'use strict';

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const net = require('node:net');
const tls = require('node:tls');
const dnsPromises = require('node:dns').promises;
const { spawn } = require('node:child_process');
const { performance } = require('node:perf_hooks');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_BODY = 2 * 1024 * 1024;
const MAX_CURL_OUTPUT = 1024 * 1024;
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const DEFAULT_TIMEOUT = clamp(process.env.REQUEST_TIMEOUT, 5000, 60000) || 30000;
const DEFAULT_CURL_TIMEOUT = clamp(process.env.CURL_TIMEOUT, 5000, 60000) || 30000;

// Gunakan CA sistem agar request HTTPS tetap terverifikasi di lingkungan dengan proxy/CB TLS korporat.
let systemCa = null;
for (const caPath of ['/etc/ssl/certs/ca-certificates.crt', '/etc/pki/tls/certs/ca-bundle.crt']) {
  try {
    systemCa = fs.readFileSync(caPath);
    break;
  } catch (_) { /* lanjut ke path berikutnya */ }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
};

function sendJson(res, status, payload) {
  const data = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Cache-Control': 'no-store',
  });
  res.end(data);
}

function readBody(req, limit = 1_500_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Payload terlalu besar.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new Error('JSON tidak valid.'));
      }
    });
    req.on('error', reject);
  });
}

function friendlyError(message) {
  const text = String(message || 'Terjadi kesalahan.');
  if (/unable to verify the first certificate|self.signed certificate|UNABLE_TO_VERIFY/i.test(text)) {
    return `Gagal verifikasi sertifikat TLS server tujuan (${text}).`;
  }
  if (/ENOTFOUND|getaddrinfo/i.test(text)) return `Domain tidak ditemukan / DNS gagal (${text}).`;
  if (/ECONNREFUSED/i.test(text)) return `Koneksi ditolak oleh server tujuan (${text}).`;
  if (/socket disconnected|ETIMEDOUT|timeout/i.test(text)) {
    return `Server sandbox tidak dapat menjangkau target ini. Mungkin jaringan dibatasi atau server timeout (${text}).`;
  }
  return text;
}

function normalizeUrl(input) {
  const value = String(input || '').trim();
  if (!value) throw new Error('URL belum diisi.');
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function decodeBody(buffer, encoding, contentType) {
  let out = buffer;
  try {
    if (/gzip/i.test(encoding)) out = zlib.gunzipSync(buffer);
    else if (/br/i.test(encoding)) out = zlib.brotliDecompressSync(buffer);
    else if (/deflate/i.test(encoding)) out = zlib.inflateSync(buffer);
  } catch (_) {
    return buffer.toString('utf8');
  }
  const match = /charset\s*=\s*["']?([\w-]+)/i.exec(contentType || '');
  const charset = (match ? match[1] : 'utf8').toLowerCase();
  try {
    return out.toString(['utf-8', 'utf8'].includes(charset) ? 'utf8' : charset);
  } catch (_) {
    return out.toString('utf8');
  }
}

/** Single HTTP round trip, with phase timings. Follows redirects in the caller. */
function roundTrip(rawUrl, options = {}) {
  return new Promise((resolve) => {
    let target;
    try {
      target = new URL(normalizeUrl(rawUrl));
    } catch (err) {
      resolve({ error: `URL tidak valid: ${err.message}` });
      return;
    }
    if (!['http:', 'https:'].includes(target.protocol)) {
      resolve({ error: 'Hanya http:// dan https:// yang didukung.' });
      return;
    }

    const started = performance.now();
    const timings = {};
    const headers = { 'User-Agent': 'SlotyDevLab/1.0 (+testing tool)', ...(options.headers || {}) };
    if (options.body && !Object.keys(headers).some((h) => h.toLowerCase() === 'content-type')) {
      headers['Content-Type'] = 'application/json';
    }
    const lib = target.protocol === 'https:' ? https : http;
    const requestOptions = {
      method: options.method || 'GET',
      headers,
      timeout: options.timeout || DEFAULT_TIMEOUT,
    };
    if (target.protocol === 'https:' && systemCa) requestOptions.ca = systemCa;
    const req = lib.request(
      target,
      requestOptions,
      (res) => {
        timings.ttfb = Math.round(performance.now() - started);
        const chunks = [];
        let bytes = 0;
        let truncated = false;
        const limit = options.maxBytes || MAX_BODY;
        res.on('data', (chunk) => {
          bytes += chunk.length;
          if (bytes <= limit) chunks.push(chunk);
          else truncated = true;
        });
        res.on('end', () => {
          const total = Math.round(performance.now() - started);
          const buffer = Buffer.concat(chunks);
          const responseHeaders = {};
          for (const [key, value] of Object.entries(res.headers)) responseHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
          const contentType = responseHeaders['content-type'] || '';
          const body = decodeBody(buffer, responseHeaders['content-encoding'] || '', contentType);
          resolve({
            ok: true,
            status: res.statusCode,
            statusText: res.statusMessage || '',
            httpVersion: res.httpVersion,
            url: target.href,
            headers: responseHeaders,
            timings: {
              dns: timings.dns ?? null,
              tcp: timings.tcp ?? null,
              tls: timings.secureConnect ?? null,
              ttfb: timings.ttfb ?? null,
              download: Math.max(0, total - (timings.ttfb || 0)),
              total,
            },
            bytes,
            truncated,
            body,
            contentType,
          });
        });
        res.on('error', (err) => resolve({ error: friendlyError(err.message) }));
      },
    );

    req.on('socket', (socket) => {
      const mark = (key) => () => {
        if (timings[key] === undefined && socket.connecting !== undefined) timings[key] = Math.round(performance.now() - started);
      };
      socket.once('lookup', mark('dns'));
      socket.once('connect', mark('tcp'));
      socket.once('secureConnect', mark('secureConnect'));
      if (socket.connecting === false) {
        timings.dns = 0;
        timings.tcp = 0;
        if (target.protocol === 'https:') timings.secureConnect = 0;
      }
    });
    req.on('timeout', () => req.destroy(new Error(`Request timeout (${Math.round((options.timeout || DEFAULT_TIMEOUT) / 1000)} detik).`)));
    req.on('error', (err) => resolve({ error: friendlyError(err.message) }));
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

async function inspectTarget(url, options = {}) {
  const redirects = [];
  let current = normalizeUrl(url);
  let method = options.method || 'GET';
  for (let hop = 0; hop <= 5; hop += 1) {
    const result = await roundTrip(current, { ...options, method });
    if (result.error) return { ...result, redirects };
    const code = result.status;
    const location = result.headers.location;
    if ([301, 302, 303, 307, 308].includes(code) && location && options.followRedirects !== false && hop < 5) {
      redirects.push({ from: current, to: new URL(location, current).href, status: code });
      current = new URL(location, current).href;
      if (code === 303 || ((code === 301 || code === 302) && method === 'POST')) method = 'GET';
      continue;
    }
    return { ...result, redirects };
  }
  return { error: 'Terlalu banyak redirect.', redirects };
}

function tokenizeCommand(command) {
  const tokens = [];
  let current = '';
  let quote = null;
  let active = false;
  const input = command.trim();
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '\\' && quote && ['"', "'", '\\'].includes(input[i + 1])) {
      current += input[i + 1];
      active = true;
      i += 1;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      active = true;
    } else if (/\s/.test(char)) {
      if (active) {
        tokens.push(current);
        current = '';
        active = false;
      }
    } else {
      current += char;
      active = true;
    }
  }
  if (active) tokens.push(current);
  return tokens;
}

function runCurl(command, timeoutMs = DEFAULT_CURL_TIMEOUT) {
  return new Promise((resolve) => {
    const tokens = tokenizeCommand(command);
    if (!tokens.length || tokens[0].toLowerCase() !== 'curl') {
      resolve({ error: 'Perintah harus diawali dengan "curl".' });
      return;
    }
    const dangerous = ['-o', '-O', '--output', '-K', '--config', '--libcurl'];
    const args = tokens.slice(1);
    if (args.some((arg) => dangerous.includes(arg) || /^--output=/.test(arg))) {
      resolve({ error: 'Opsi penulisan file tidak diizinkan di sandbox ini.' });
      return;
    }
    const urlArgs = args.filter((a) => /^https?:\/\//i.test(a));
    if (!urlArgs.length) {
      resolve({ error: 'Tidak ada URL http/https pada perintah.' });
      return;
    }
    const started = performance.now();
    let stdout = '';
    let stderr = '';
    let killed = false;
    const child = spawn('curl', [...args, '--max-time', String(Math.ceil(timeoutMs / 1000))], { windowsHide: true });
    const guard = setTimeout(() => {
      if (!killed) {
        killed = true;
        child.kill('SIGKILL');
        stderr += `\n[sloty] Proses dihentikan setelah ${Math.round(timeoutMs / 1000)} detik.`;
      }
    }, timeoutMs + 5000);
    child.stdout.on('data', (chunk) => {
      if (stdout.length < MAX_CURL_OUTPUT) stdout += chunk.toString('utf8').slice(0, MAX_CURL_OUTPUT - stdout.length);
    });
    child.stderr.on('data', (chunk) => {
      if (stderr.length < 32768) stderr += chunk.toString('utf8').slice(0, 32768 - stderr.length);
    });
    child.on('error', (err) => {
      clearTimeout(guard);
      resolve({ error: `Gagal menjalankan curl: ${err.message}` });
    });
    child.on('close', (code) => {
      clearTimeout(guard);
      resolve({
        ok: true,
        command: tokens.join(' '),
        exitCode: code,
        stdout,
        stderr,
        duration: Math.round(performance.now() - started),
      });
    });
  });
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise.then((value) => ({ status: 'fulfilled', value })).catch((error) => ({ status: 'rejected', reason: error })),
    new Promise((resolve) => setTimeout(() => resolve({ status: 'rejected', reason: new Error('timeout') }), ms)),
  ]).then((result) => (result.status === 'fulfilled' ? result.value : fallback));
}

async function dnsLookup(input) {
  const host = String(input || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
  if (!host) throw new Error('Host belum diisi.');
  const started = performance.now();
  const [a, aaaa, cname, mx, txt, ns] = await Promise.all([
    withTimeout(dnsPromises.resolve4(host), 4000, []),
    withTimeout(dnsPromises.resolve6(host), 4000, []),
    withTimeout(dnsPromises.resolveCname(host), 4000, []),
    withTimeout(dnsPromises.resolveMx(host), 4000, []),
    withTimeout(dnsPromises.resolveTxt(host), 4000, []),
    withTimeout(dnsPromises.resolveNs(host), 4000, []),
  ]);
  return {
    host,
    duration: Math.round(performance.now() - started),
    records: {
      A: a,
      AAAA: aaaa,
      CNAME: cname,
      MX: mx.filter((r) => r.exchange).sort((x, y) => x.priority - y.priority).map((r) => `${r.priority} ${r.exchange}`),
      TXT: txt.map((parts) => parts.join('')),
      NS: ns,
    },
  };
}

function tcpCheck(host, port, timeout) {
  return new Promise((resolve) => {
    const started = performance.now();
    const socket = net.connect({ host, port });
    let finished = false;
    const finish = (ok, detail) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve({ layer: 'TCP', ok, detail, ms: Math.round(performance.now() - started) });
    };
    socket.setTimeout(timeout);
    socket.once('connect', () => finish(true, `Terhubung ke ${host}:${port}`));
    socket.once('timeout', () => finish(false, `TCP timeout setelah ${Math.round(timeout / 1000)} detik`));
    socket.once('error', (err) => finish(false, friendlyError(err.message)));
  });
}

function tlsCheck(host, port, timeout) {
  return new Promise((resolve) => {
    const started = performance.now();
    const options = { host, port, servername: host, timeout };
    if (systemCa) options.ca = systemCa;
    const socket = tls.connect(options);
    let finished = false;
    const finish = (ok, detail) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve({ layer: 'TLS', ok, detail, ms: Math.round(performance.now() - started) });
    };
    socket.once('secureConnect', () => finish(true, `TLS OK · ${socket.getProtocol() || 'HTTPS'}`));
    socket.once('timeout', () => finish(false, `TLS timeout setelah ${Math.round(timeout / 1000)} detik`));
    socket.once('error', (err) => finish(false, friendlyError(err.message)));
  });
}

async function diagnoseTarget(rawUrl, timeout = DEFAULT_TIMEOUT) {
  const url = normalizeUrl(rawUrl);
  const target = new URL(url);
  const port = Number(target.port) || (target.protocol === 'https:' ? 443 : 80);
  const checks = [];

  const startedDns = performance.now();
  try {
    const addresses = await dnsPromises.lookup(target.hostname, { all: true });
    checks.push({
      layer: 'DNS',
      ok: addresses.length > 0,
      detail: addresses.map((a) => a.address).join(', '),
      ms: Math.round(performance.now() - startedDns),
    });
  } catch (err) {
    checks.push({ layer: 'DNS', ok: false, detail: friendlyError(err.message), ms: Math.round(performance.now() - startedDns) });
    return { url, host: target.hostname, port, protocol: target.protocol, checks };
  }

  checks.push(await tcpCheck(target.hostname, port, timeout));
  if (!checks[checks.length - 1].ok) return { url, host: target.hostname, port, protocol: target.protocol, checks };

  if (target.protocol === 'https:') {
    checks.push(await tlsCheck(target.hostname, port, timeout));
    if (!checks[checks.length - 1].ok) return { url, host: target.hostname, port, protocol: target.protocol, checks };
  }

  const response = await roundTrip(url, { method: 'GET', maxBytes: 4096, timeout });
  checks.push({
    layer: 'HTTP',
    ok: !response.error && response.status < 500,
    detail: response.error || `${response.status} ${response.statusText || ''} · ${response.contentType || 'tanpa content-type'}`,
    ms: response.timings?.total ?? null,
  });
  return { url, host: target.hostname, port, protocol: target.protocol, checks };
}

const CONSOLE_BRIDGE = `<script>
(function(){
  var send=function(level,args){try{parent.postMessage({__slotyBridge:true,level:level,text:Array.prototype.map.call(args,function(a){try{return typeof a==='object'?JSON.stringify(a):String(a)}catch(e){return String(a)}}).join(' ')},'*')}catch(e){}};
  ['log','info','warn','error'].forEach(function(level){var original=console[level];console[level]=function(){send(level,arguments);if(original)original.apply(console,arguments)}});
  window.addEventListener('error',function(e){send('error',[e.message+' ('+(e.filename||'')+':'+e.lineno+')'])});
  window.addEventListener('unhandledrejection',function(e){send('error',['Unhandled rejection: '+String(e.reason)])});
})();
<\/script>`;

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

async function proxyHtml(url, timeout = DEFAULT_TIMEOUT) {
  const result = await inspectTarget(url, {
    timeout,
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SlotyDevLab/1.0)', Accept: 'text/html,application/xhtml+xml' },
    maxBytes: 3 * 1024 * 1024,
  });
  if (result.error) throw new Error(result.error);
  if (!/html|xml/i.test(result.contentType) && !/^\s*<(html|!doctype)/i.test(result.body)) {
    throw new Error('Respons bukan HTML. Gunakan mode Embed atau buka di tab baru.');
  }
  const injection = `<base href="${escapeAttr(result.url)}">${CONSOLE_BRIDGE}`;
  let html = result.body.replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, '');
  if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, (match) => `${match}${injection}`);
  else html = injection + html;
  return { html, url: result.url, status: result.status, duration: result.timings.total };
}

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const filePath = path.resolve(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== PUBLIC_DIR) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — tidak ditemukan');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true, service: 'Sloty DevLab', time: new Date().toISOString() });
    return;
  }
  if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
    let payload;
    try {
      payload = await readBody(req);
    } catch (err) {
      sendJson(res, 400, { error: err.message });
      return;
    }
    try {
      if (url.pathname === '/api/inspect') {
        const result = await inspectTarget(payload.url, {
          method: (payload.method || 'GET').toUpperCase(),
          headers: payload.headers || {},
          body: payload.body || null,
          followRedirects: payload.followRedirects !== false,
          timeout: clamp(payload.timeout, 5000, 60000) || DEFAULT_TIMEOUT,
          maxBytes: clamp(payload.maxBytes, 1024, MAX_BODY) || MAX_BODY,
        });
        sendJson(res, result.error ? 200 : 200, result);
      } else if (url.pathname === '/api/curl') {
        sendJson(res, 200, await runCurl(payload.command || '', clamp(payload.timeout, 5000, 60000) || DEFAULT_CURL_TIMEOUT));
      } else if (url.pathname === '/api/diagnose') {
        sendJson(res, 200, await diagnoseTarget(payload.url || '', clamp(payload.timeout, 5000, 60000) || DEFAULT_TIMEOUT));
      } else if (url.pathname === '/api/dns') {
        sendJson(res, 200, await dnsLookup(payload.host || ''));
      } else if (url.pathname === '/api/proxy') {
        sendJson(res, 200, await proxyHtml(payload.url || '', clamp(payload.timeout, 5000, 60000) || DEFAULT_TIMEOUT));
      } else {
        sendJson(res, 404, { error: 'Endpoint tidak ditemukan.' });
      }
    } catch (err) {
      sendJson(res, 200, { error: err.message || 'Terjadi kesalahan.' });
    }
    return;
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res, url.pathname);
    return;
  }
  sendJson(res, 405, { error: 'Method tidak diizinkan.' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Sloty DevLab berjalan di http://0.0.0.0:${PORT}`);
});
