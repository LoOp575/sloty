'use strict';

/* Sloty DevLab — front end (vanilla JS, no build step) */

const ICONS = {
  browser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>',
  terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  dns: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/></svg>',
  network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9m5 10V5m5 14v-7m5 7V8"/></svg>',
  console: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 7 5 5-5 5M13 17h6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>',
  reload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 11a8 8 0 1 0-2.3 6M20 5v6h-6"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 16-8-6 16-2-6-8-2Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5-12-7.5Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>',
  tablet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/></svg>',
};

const NAV = [
  { group: 'WORKSPACE', items: [
    { id: 'browser', label: 'Browser Embed', icon: 'browser' },
    { id: 'network', label: 'Network Timing', icon: 'network' },
    { id: 'activity', label: 'Activity Log', icon: 'console' },
  ]},
  { group: 'TESTING TOOLS', items: [
    { id: 'http', label: 'HTTP Checker', icon: 'activity' },
    { id: 'curl', label: 'cURL Lab', icon: 'terminal' },
    { id: 'headers', label: 'Security Headers', icon: 'shield' },
    { id: 'dns', label: 'DNS Lookup', icon: 'dns' },
  ]},
];

const state = {
  view: 'browser',
  url: 'https://example.com',
  loadedUrl: '',
  mode: 'embed',
  device: 'desktop',
  proxyHtml: '',
  proxyInfo: null,
  frameLoadMs: null,
  http: {
    method: 'GET', url: 'https://example.com', headers: [], body: '', followRedirects: true,
  },
  httpResult: null,
  httpTab: 'headers',
  curlCommand: 'curl -I https://example.com',
  curlResult: null,
  dnsHost: 'example.com',
  dnsResult: null,
  logs: [],
  busy: false,
};

const app = document.getElementById('app');
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtBytes = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`);
const fmtMs = (n) => (n == null ? '—' : n < 1000 ? `${n} ms` : `${(n / 1000).toFixed(2)} s`);
const statusTone = (code) => (code >= 200 && code < 300 ? 'ok' : code >= 300 && code < 400 ? 'warn' : 'danger');
const shorten = (text, len = 120) => (text || '').replace(/\s+/g, ' ').trim().slice(0, len) + ((text || '').length > len ? '…' : '');
const now = () => new Date().toLocaleTimeString('id-ID', { hour12: false });

function log(level, message) {
  state.logs.unshift({ time: now(), level, message });
  if (state.logs.length > 250) state.logs.pop();
  if (state.view === 'activity') {
    const list = document.getElementById('logList');
    if (list) list.innerHTML = logRows();
  }
}

function logRows() {
  if (!state.logs.length) return '<div class="empty-state"><p>Belum ada aktivitas.</p></div>';
  return state.logs.map((l) => `<div class="log-line"><span class="log-time">${esc(l.time)}</span><span class="log-level ${esc(l.level)}">${esc(l.level.toUpperCase())}</span><span class="log-message">${esc(l.message)}</span></div>`).join('');
}

function toast(message, isError = false) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = `toast${isError ? ' error' : ''}`;
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

async function api(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({ error: 'Respons server tidak valid.' }));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  if (data.error) throw new Error(data.error);
  return data;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Disalin ke clipboard.');
  } catch (_) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast('Disalin ke clipboard.');
  }
}

function shell() {
  const groups = NAV.map((g) => `
    <div class="nav-group">
      <div class="nav-label">${g.group}</div>
      ${g.items.map((item) => `<button class="nav-item" data-view="${item.id}">${ICONS[item.icon]}<span>${item.label}</span></button>`).join('')}
    </div>`).join('');
  app.innerHTML = `
    <div class="app">
      <div class="backdrop" id="backdrop"></div>
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="brand-mark">S</div>
          <div><div class="brand-name">Sloty DevLab</div><div class="brand-sub">Web testing playground</div></div>
        </div>
        ${groups}
        <div class="sidebar-foot">
          <div class="status-line"><span class="status-dot"></span><span id="serverStatus">Menghubungkan ke server…</span></div>
          <div class="sidebar-hint">Semua request dijalankan dari server sandbox. Situs yang melarang iframe bisa dibuka lewat mode Proxy.</div>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="menu-toggle" id="menuToggle" aria-label="Buka menu">${ICONS.menu}</button>
          <div class="top-title">Sloty <span>/ DevLab</span></div>
          <form class="global-url" id="globalUrlForm">
            <div class="input-wrap">
              <span class="url-icon">${ICONS.globe}</span>
              <input id="globalUrl" value="${esc(state.url)}" placeholder="Masukkan URL situs yang ingin diuji…" spellcheck="false" aria-label="URL" />
            </div>
          </form>
          <div class="top-actions">
            <button class="btn btn-primary" id="globalGo">${ICONS.send}<span>Buka</span></button>
          </div>
        </header>
        <main class="content" id="content"></main>
      </div>
      <div class="toast-wrap" id="toastWrap"></div>
    </div>`;

  document.getElementById('globalUrlForm').addEventListener('submit', (e) => {
    e.preventDefault();
    goUrl(document.getElementById('globalUrl').value);
  });
  document.getElementById('globalGo').addEventListener('click', () => goUrl(document.getElementById('globalUrl').value));
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('backdrop').classList.toggle('show');
  });
  document.getElementById('backdrop').addEventListener('click', closeMenu);
  app.querySelectorAll('[data-view]').forEach((el) => el.addEventListener('click', () => setView(el.dataset.view)));
  fetch('/api/health').then((r) => r.json()).then((data) => {
    const el = document.getElementById('serverStatus');
    if (el) el.textContent = data.ok ? 'Server aktif · siap menguji' : 'Server bermasalah';
  }).catch(() => {
    const el = document.getElementById('serverStatus');
    if (el) el.textContent = 'Server tidak terhubung';
  });
}

function closeMenu() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('backdrop')?.classList.remove('show');
}

function setView(view) {
  state.view = view;
  closeMenu();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goUrl(value, view = 'browser') {
  const url = String(value || '').trim();
  if (!url) return;
  state.url = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const globalInput = document.getElementById('globalUrl');
  if (globalInput) globalInput.value = state.url;
  state.http.url = state.url;
  state.loadedUrl = state.url;
  state.proxyHtml = '';
  state.proxyInfo = null;
  state.frameLoadMs = null;
  log('info', `Membuka ${state.url} di browser embed (${state.mode}).`);
  setView(view);
  if (state.mode === 'proxy') loadProxy();
  else {
    const frame = document.getElementById('previewFrame');
    if (frame) {
      frame.src = state.loadedUrl;
      const started = performance.now();
      frame.onload = () => {
        state.frameLoadMs = Math.round(performance.now() - started);
        const foot = document.getElementById('browserFoot');
        if (foot) foot.innerHTML = footHtml();
        log('success', `Halaman termuat dalam ${state.frameLoadMs} ms.`);
      };
    }
  }
}

async function loadProxy() {
  if (!state.loadedUrl) return;
  const info = document.getElementById('proxyStatus');
  if (info) info.innerHTML = '<span class="spinner"></span> Mengambil HTML lewat server…';
  try {
    const data = await api('/api/proxy', { url: state.loadedUrl });
    state.proxyHtml = data.html;
    state.proxyInfo = data;
    const frame = document.getElementById('previewFrame');
    if (frame) {
      frame.srcdoc = data.html;
      const started = performance.now();
      frame.onload = () => {
        state.frameLoadMs = Math.round(performance.now() - started);
        const foot = document.getElementById('browserFoot');
        if (foot) foot.innerHTML = footHtml();
      };
    }
    log('success', `Proxy siap: ${data.status} · ${fmtMs(data.duration)} · console halaman di-forward ke Activity Log.`);
    const foot = document.getElementById('browserFoot');
    if (foot) foot.innerHTML = footHtml();
  } catch (err) {
    log('error', `Proxy gagal: ${err.message}`);
    toast(err.message, true);
    const el = document.getElementById('proxyStatus');
    if (el) el.innerHTML = `<span class="badge danger">Gagal</span> ${esc(err.message)}`;
  }
}

function pageHead(eyebrow, title, desc) {
  return `<div class="page-head"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="page-desc">${desc}</p></div>`;
}

function footHtml() {
  if (!state.loadedUrl) return '<span>Belum ada halaman dimuat</span>';
  return `
    <span>URL: ${esc(shorten(state.loadedUrl, 72))}</span><span class="sep"></span>
    <span>Mode: ${state.mode === 'proxy' ? 'Proxy (server-side)' : 'Embed (iframe)'}</span><span class="sep"></span>
    <span>Viewport: ${{ desktop: 'Desktop · penuh', tablet: 'Tablet · 820px', mobile: 'Mobile · 390px' }[state.device]}</span><span class="sep"></span>
    <span>${state.frameLoadMs != null ? `Muat: ${fmtMs(state.frameLoadMs)}` : 'Menunggu halaman…'}</span>
    <span style="margin-left:auto" id="proxyStatus"></span>`;
}

function browserView() {
  const deviceBtn = (id, icon, label) => `<button class="btn btn-icon ${state.device === id ? 'btn-primary' : ''}" data-device="${id}" title="${label}">${ICONS[icon]}</button>`;
  return `
    ${pageHead('BROWSER · EMBED', 'Browser Embed', 'Masukkan URL situs, lalu jalankan di dalam dashboard ini. Gunakan mode Proxy bila situs memblokir iframe (X-Frame-Options / CSP frame-ancestors).')}
    <div class="notice" style="margin-bottom:16px">${ICONS.info}<div><strong>Catatan iframe:</strong> banyak situs besar (Google, GitHub, Facebook, dll.) secara sengaja melarang ditampilkan di dalam iframe. Bila halaman kosong, coba tombol <strong>Proxy</strong> atau buka di tab baru. Console dari halaman proxy otomatis masuk ke Activity Log.</div></div>
    <div class="browser-shell">
      <div class="browser-toolbar">
        <button class="btn btn-icon" data-action="reload" title="Muat ulang">${ICONS.reload}</button>
        <div class="input-wrap" style="flex:1">
          <span class="url-icon">${ICONS.globe}</span>
          <input id="browserUrl" value="${esc(state.loadedUrl || state.url)}" placeholder="https://contoh.com" spellcheck="false" style="padding-left:36px" />
        </div>
        <button class="btn btn-primary" data-action="load-browser">Buka</button>
        <button class="btn btn-icon" data-action="open-new" title="Buka di tab baru">${ICONS.external}</button>
        <span style="width:1px;height:24px;background:var(--border);margin:0 3px"></span>
        <button class="chip ${state.mode === 'embed' ? 'active' : ''}" data-mode="embed">Embed</button>
        <button class="chip ${state.mode === 'proxy' ? 'active' : ''}" data-mode="proxy">Proxy</button>
        <span style="width:1px;height:24px;background:var(--border);margin:0 3px"></span>
        ${deviceBtn('desktop', 'monitor', 'Desktop')}
        ${deviceBtn('tablet', 'tablet', 'Tablet')}
        ${deviceBtn('mobile', 'mobile', 'Mobile')}
      </div>
      ${state.loadedUrl ? `
        <div class="browser-viewport has-frame">
          <div class="device-frame ${state.device}">
            <iframe id="previewFrame" ${state.mode === 'proxy' ? 'srcdoc=""' : `src="${esc(state.loadedUrl)}"`}
              sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads"
              referrerpolicy="no-referrer" title="Preview ${esc(state.loadedUrl)}"></iframe>
          </div>
        </div>
        <div class="browser-foot" id="browserFoot">${footHtml()}</div>
      ` : `
        <div class="browser-viewport">
          <div class="empty-state">
            <div class="empty-icon">${ICONS.globe}</div>
            <h3>Masukkan URL untuk mulai menguji</h3>
            <p>Website yang Anda masukkan akan tampil di panel ini. Coba salah satu contoh di bawah, lalu pakai menu tool untuk menganalisis responsnya.</p>
            <div class="example-row">
              ${[
                ['https://example.com', 'example.com'],
                ['https://developer.mozilla.org', 'developer.mozilla.org'],
                ['https://httpbin.org/get', 'httpbin.org/get'],
                ['https://api.github.com', 'api.github.com (demo tool)'],
              ].map(([u, label]) => `<button class="chip" data-example="${u}">${label}</button>`).join('')}
            </div>
          </div>
        </div>`}
    </div>
    <div class="grid-3" style="margin-top:16px">
      <button class="card card-body row-tight" data-action="to-http" style="text-align:left">${ICONS.activity}<div><strong>Periksa HTTP response</strong><div class="muted small">Status, header, timing, dan body respons</div></div></button>
      <button class="card card-body row-tight" data-action="to-headers" style="text-align:left">${ICONS.shield}<div><strong>Audit security header</strong><div class="muted small">CSP, HSTS, X-Frame-Options, dan lainnya</div></div></button>
      <button class="card card-body row-tight" data-action="to-dns" style="text-align:left">${ICONS.dns}<div><strong>Lihat rekaman DNS</strong><div class="muted small">A, AAAA, CNAME, MX, TXT, NS</div></div></button>
    </div>`;
}

function headerRows() {
  return state.http.headers.map((h, i) => `
    <div class="row" style="margin-bottom:8px" data-header-row="${i}">
      <div class="field"><input value="${esc(h.key)}" data-hkey="${i}" placeholder="Nama header" /></div>
      <div class="field"><input value="${esc(h.value)}" data-hvalue="${i}" placeholder="Nilai" /></div>
      <button class="btn btn-icon" data-remove-header="${i}" title="Hapus">${ICONS.trash}</button>
    </div>`).join('');
}

function httpView() {
  const result = state.httpResult;
  return `
    ${pageHead('TOOLS · HTTP', 'HTTP Checker', 'Kirim request ke URL mana pun dan lihat respons lengkapnya: status code, header, redirect chain, timing, dan isi body.')}
    <div class="card" style="margin-bottom:16px">
      <div class="card-body">
        <div class="row">
          <div class="field" style="flex:0 0 130px">
            <label class="field-label">METHOD</label>
            <select id="httpMethod">${['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].map((m) => `<option ${state.http.method === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
          </div>
          <div class="field">
            <label class="field-label">URL TUJUAN</label>
            <input id="httpUrl" value="${esc(state.http.url)}" placeholder="https://api.contoh.com/v1" spellcheck="false" />
          </div>
          <button class="btn btn-primary" id="httpSend" style="height:41px" ${state.busy ? 'disabled' : ''}>${state.busy ? '<span class="spinner"></span>' : ICONS.send} Kirim Request</button>
        </div>
        <div class="row-tight" style="margin-top:12px">
          <label class="chip" style="cursor:pointer"><input type="checkbox" id="httpFollow" ${state.http.followRedirects ? 'checked' : ''} style="width:auto;margin-right:6px" /> Ikuti redirect</label>
          <button class="chip" data-preset-url="https://httpbin.org/get">httpbin GET</button>
          <button class="chip" data-preset-url="https://httpbin.org/status/404">Contoh 404</button>
          <button class="chip" data-preset-url="https://example.com">example.com</button>
          <button class="chip" data-action="to-curl" style="margin-left:auto">${ICONS.terminal} Kirim ke cURL Lab</button>
        </div>
      </div>
    </div>
    <div class="grid-2" style="margin-bottom:16px">
      <div class="card">
        <div class="card-head"><h3>Custom Request Headers</h3><div class="sub" id="headerCount">${state.http.headers.length} header</div></div>
        <div class="card-body">
          <div id="headerRows">${headerRows() || '<div class="muted small" style="margin-bottom:10px">Belum ada header tambahan.</div>'}</div>
          <button class="btn btn-sm" data-action="add-header">${ICONS.plus} Tambah header</button>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Request Body</h3><div class="sub">JSON / text</div></div>
        <div class="card-body">
          <textarea id="httpBody" placeholder='{ "key": "value" }' spellcheck="false">${esc(state.http.body)}</textarea>
          <div class="muted small" style="margin-top:8px">Content-Type: application/json ditambahkan otomatis bila belum ada header Content-Type.</div>
        </div>
      </div>
    </div>
    ${result ? `
      <div class="stack">
        ${result.error ? `<div class="notice">${ICONS.info}<div><strong>Request gagal:</strong> ${esc(result.error)}</div></div>` : `
          <div class="status-hero">
            <div class="status-number badge ${statusTone(result.status)}">${result.status}</div>
            <div><div style="font-weight:700">${esc(result.statusText || 'Response')}</div><div class="status-text mono">${esc(result.url)}</div></div>
            <div class="spacer"></div>
            <div style="text-align:right"><div class="muted small">Total waktu</div><div class="mono" style="font-size:18px;font-weight:700">${fmtMs(result.timings.total)}</div></div>
          </div>
          <div class="grid-4">
            ${metric('DNS', fmtMs(result.timings.dns), 'Resolusi domain')}
            ${metric('TCP', fmtMs(result.timings.tcp), 'Koneksi socket')}
            ${metric('TTFB', fmtMs(result.timings.ttfb), 'Byte pertama')}
            ${metric('UKURAN', fmtBytes(result.bytes), result.truncated ? 'Dipotong' : 'Respons penuh')}
          </div>
          <div class="card">
            <div class="tabs">
              ${['headers', 'body', 'redirects', 'raw'].map((t) => `<button class="tab ${state.httpTab === t ? 'active' : ''}" data-httptab="${t}">${t[0].toUpperCase() + t.slice(1)}${t === 'redirects' && result.redirects.length ? ` (${result.redirects.length})` : ''}</button>`).join('')}
              <button class="tab" data-action="copy-response" style="margin-left:auto">${ICONS.copy}</button>
            </div>
            <div class="tab-panel">${httpTabContent(result)}</div>
          </div>`}
      </div>` : `
      <div class="card"><div class="empty-state"><div class="empty-icon">${ICONS.activity}</div><h3>Belum ada respons</h3><p>Isi URL di atas dan klik <strong>Kirim Request</strong> untuk melihat detail responsnya di sini.</p></div></div>`}`;
}

function metric(label, value, foot) {
  return `<div class="card metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></div>`;
}

function httpTabContent(result) {
  if (state.httpTab === 'body') {
    let text = result.body || '(respons kosong)';
    const jsonType = /json/i.test(result.contentType);
    if (jsonType) {
      try { text = JSON.stringify(JSON.parse(text), null, 2); } catch (_) { /* keep original */ }
    }
    return `<pre class="code" style="max-height:520px">${esc(text.slice(0, 200000))}</pre>`;
  }
  if (state.httpTab === 'redirects') {
    if (!result.redirects.length) return '<div class="muted small">Tidak ada redirect yang diikuti.</div>';
    return `<table class="kv"><thead><tr><th>Dari</th><th>Ke</th><th>Status</th></tr></thead><tbody>${result.redirects.map((r) => `<tr><td class="key">${esc(r.from)}</td><td>${esc(r.to)}</td><td><span class="badge warn">${r.status}</span></td></tr>`).join('')}</tbody></table>`;
  }
  if (state.httpTab === 'raw') {
    const head = `HTTP/${result.httpVersion} ${result.status} ${result.statusText}\n${Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n`;
    return `<pre class="code">${esc(head + (result.body || ''))}</pre>`;
  }
  return `<table class="kv"><thead><tr><th>Header</th><th>Nilai</th></tr></thead><tbody>${Object.entries(result.headers).map(([k, v]) => `<tr><td class="key">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`;
}

function curlView() {
  const r = state.curlResult;
  return `
    ${pageHead('TOOLS · CURL', 'cURL Lab', 'Tulis perintah cURL, jalankan langsung di server sandbox, dan lihat stdout, stderr, serta exit code-nya.')}
    <div class="notice info" style="margin-bottom:16px">${ICONS.info}<div>Perintah dijalankan tanpa shell. Opsi yang menulis file (<span class="mono">-o, -O, --config</span>) sengaja diblokir. Batas waktu request 20 detik.</div></div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-body">
        <label class="field-label">PERINTAH</label>
        <textarea id="curlCommand" spellcheck="false" style="min-height:90px">${esc(state.curlCommand)}</textarea>
        <div class="row-tight" style="margin-top:12px">
          <button class="btn btn-primary" id="curlRun" ${state.busy ? 'disabled' : ''}>${state.busy ? '<span class="spinner"></span>' : ICONS.play} Jalankan cURL</button>
          <span class="dim" style="font-size:11px">Contoh:</span>
          ${[
            ['curl -I https://example.com', 'HEAD request'],
            ['curl -s -w " [HTTP %{http_code} · %{time_total}s]" https://example.com', 'Status + waktu'],
            ['curl -X POST -H "Content-Type: application/json" -d \'{"test":true}\' https://httpbin.org/post', 'POST JSON'],
            ['curl -A "SlotyBot/1.0" -L https://example.com', 'Custom UA + redirect'],
          ].map(([cmd, label]) => `<button class="chip" data-curl-preset="${esc(cmd)}">${label}</button>`).join('')}
        </div>
      </div>
    </div>
    ${r ? `
      <div class="grid-3" style="margin-bottom:16px">
        ${metric('EXIT CODE', String(r.exitCode ?? '—'), r.exitCode === 0 ? 'Berhasil' : 'Perintah menghasilkan error')}
        ${metric('DURASI', fmtMs(r.duration), 'Waktu eksekusi')}
        ${metric('OUTPUT', fmtBytes((r.stdout || '').length + (r.stderr || '').length), 'Total stdout + stderr')}
      </div>
      <div class="grid-2">
        <div class="card"><div class="card-head"><h3>STDOUT</h3><div class="sub"><button class="btn btn-sm btn-ghost" data-action="copy-stdout">${ICONS.copy} Salin</button></div></div><div class="card-body"><pre class="code">${esc(r.stdout || '(kosong)')}</pre></div></div>
        <div class="card"><div class="card-head"><h3>STDERR</h3><div class="sub">${r.stderr ? '<span class="badge warn">ada output</span>' : '<span class="badge ok">bersih</span>'}</div></div><div class="card-body"><pre class="code">${esc(r.stderr || '(kosong)')}</pre></div></div>
      </div>` : `
      <div class="card"><div class="empty-state"><div class="empty-icon">${ICONS.terminal}</div><h3>Belum ada output</h3><p>Jalankan perintah cURL untuk melihat hasilnya.</p></div></div>`}`;
}

function scoreChecks(headers) {
  const get = (name) => {
    const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
    return key ? headers[key] : null;
  };
  const checks = [
    { name: 'Strict-Transport-Security', value: get('strict-transport-security'), weight: 18, ok: (v) => /max-age\s*=\s*[1-9]\d*/.test(v || ''), note: 'Memaksa koneksi HTTPS. Disarankan max-age minimal 1 bulan.' },
    { name: 'Content-Security-Policy', value: get('content-security-policy'), weight: 22, ok: (v) => /default-src|script-src/.test(v || ''), note: 'Membatasi sumber script/style untuk mencegah XSS.' },
    { name: 'X-Content-Type-Options', value: get('x-content-type-options'), weight: 12, ok: (v) => /nosniff/i.test(v || ''), note: 'Mencegah browser menebak tipe MIME (nosniff).' },
    { name: 'X-Frame-Options / frame-ancestors', value: get('x-frame-options') || get('content-security-policy'), weight: 14, ok: (v) => /deny|sameorigin/i.test(v || '') || /frame-ancestors/i.test(v || ''), note: 'Melindungi dari clickjacking sekaligus mengatur apakah halaman boleh di-embed.' },
    { name: 'Referrer-Policy', value: get('referrer-policy'), weight: 10, ok: (v) => /no-referrer|strict-origin|same-origin/i.test(v || ''), note: 'Mengatur seberapa banyak informasi URL dikirim ke situs lain.' },
    { name: 'Permissions-Policy', value: get('permissions-policy') || get('feature-policy'), weight: 10, ok: (v) => /camera|geolocation|microphone/.test(v || ''), note: 'Membatasi akses fitur sensitif seperti kamera dan lokasi.' },
    { name: 'X-XSS-Protection', value: get('x-xss-protection'), weight: 4, ok: (v) => /1/.test(v || ''), note: 'Header lama; CSP adalah pengganti yang direkomendasikan.' },
    { name: 'Cache-Control', value: get('cache-control'), weight: 10, ok: (v) => /no-store|private|max-age/i.test(v || ''), note: 'Mengontrol penyimpanan cache untuk konten sensitif.' },
  ];
  const score = checks.reduce((sum, c) => sum + (c.value && c.ok(c.value) ? c.weight : 0), 0);
  return { checks, score };
}

function headersView() {
  const result = state.httpResult;
  let audit = null;
  if (result && !result.error) {
    const { checks, score } = scoreChecks(result.headers);
    audit = { checks, score };
  }
  return `
    ${pageHead('TOOLS · SECURITY', 'Security Headers', 'Audit header keamanan pada response terakhir. Skor dihitung dari keberadaan dan nilai header penting.')}
    <div class="card" style="margin-bottom:16px"><div class="card-body">
      <div class="row">
        <div class="field"><label class="field-label">URL TUJUAN</label><input id="headersUrl" value="${esc(state.http.url)}" spellcheck="false" /></div>
        <button class="btn btn-primary" id="headersRun" style="height:41px" ${state.busy ? 'disabled' : ''}>${state.busy ? '<span class="spinner"></span>' : ICONS.shield} Audit Header</button>
      </div>
    </div></div>
    ${audit ? `
      <div class="grid-2">
        <div class="card"><div class="card-head"><h3>Skor keamanan</h3><div class="sub">${esc(result.url)}</div></div>
          <div class="card-body score-wrap">
            <div class="score-ring" style="--score:${audit.score}"><span>${audit.score}</span></div>
            <div><div style="font-size:18px;font-weight:700;margin-bottom:5px">${audit.score >= 80 ? 'Bagus' : audit.score >= 50 ? 'Cukup' : 'Perlu perbaikan'}</div>
              <div class="muted" style="line-height:1.6">${audit.checks.filter((c) => c.value && c.ok(c.value)).length} dari ${audit.checks.length} header penting terdeteksi. Status HTTP: <span class="badge ${statusTone(result.status)}">${result.status}</span></div>
              <div class="dim small" style="margin-top:8px">Skor ini hanya indikator cepat, bukan pengganti audit keamanan penuh.</div></div>
          </div>
        </div>
        <div class="card"><div class="card-head"><h3>Hasil pemeriksaan</h3><div class="sub">${Object.keys(result.headers).length} header diterima</div></div>
          <div class="card-body">${audit.checks.map((c) => {
            const pass = c.value && c.ok(c.value);
            const tone = pass ? 'ok' : c.value ? 'warn' : 'danger';
            const icon = pass ? '✓' : c.value ? '!' : '×';
            return `<div class="header-check"><div class="check-icon ${tone}">${icon}</div><div class="check-body">
              <div class="check-title">${esc(c.name)} <span class="badge ${tone}" style="margin-left:5px">${pass ? 'Aman' : c.value ? 'Perlu dicek' : 'Tidak ada'}</span></div>
              <div class="check-note">${esc(c.note)}</div>
              ${c.value ? `<div class="check-value">${esc(shorten(c.value, 160))}</div>` : ''}
            </div></div>`;
          }).join('')}</div>
        </div>
      </div>` : `
      <div class="card"><div class="empty-state"><div class="empty-icon">${ICONS.shield}</div><h3>Belum ada data header</h3><p>Masukkan URL lalu klik <strong>Audit Header</strong> untuk memeriksa response header situs tersebut.</p></div></div>`}`;
}

function dnsView() {
  const r = state.dnsResult;
  const recordRows = (name, values) => `
    <div class="card"><div class="card-head"><h3>${name}</h3><div class="sub">${values.length} record</div></div>
      <div class="card-body">${values.length ? `<div class="log-list">${values.map((v) => `<div class="log-line" style="grid-template-columns:1fr"><span class="log-message">${esc(v)}</span></div>`).join('')}</div>` : '<div class="muted small">Tidak ada record ditemukan.</div>'}</div>
    </div>`;
  return `
    ${pageHead('TOOLS · DNS', 'DNS Lookup', 'Lihat rekaman DNS sebuah domain: alamat IP, CNAME, MX, TXT, dan nameserver.')}
    <div class="card" style="margin-bottom:16px"><div class="card-body">
      <div class="row"><div class="field"><label class="field-label">HOST / DOMAIN</label><input id="dnsHost" value="${esc(state.dnsHost)}" placeholder="example.com" spellcheck="false" /></div>
      <button class="btn btn-primary" id="dnsRun" style="height:41px" ${state.busy ? 'disabled' : ''}>${state.busy ? '<span class="spinner"></span>' : ICONS.dns} Lookup</button></div>
    </div></div>
    ${r ? `
      <div class="notice info" style="margin-bottom:16px">${ICONS.info}<div><strong>${esc(r.host)}</strong> · lookup selesai dalam ${fmtMs(r.duration)} · ${Object.values(r.records).reduce((n, v) => n + v.length, 0)} record ditemukan</div></div>
      <div class="grid-2">${Object.entries(r.records).map(([k, v]) => recordRows(k, v)).join('')}</div>` : `
      <div class="card"><div class="empty-state"><div class="empty-icon">${ICONS.dns}</div><h3>Belum ada hasil lookup</h3><p>Masukkan domain lalu klik Lookup.</p></div></div>`}`;
}

function networkView() {
  const r = state.httpResult;
  if (!r || r.error) {
    return `${pageHead('BROWSER · NETWORK', 'Network Timing', 'Visualisasi fase request: DNS, TCP, TLS, time to first byte, dan download.')}
      <div class="card"><div class="empty-state"><div class="empty-icon">${ICONS.network}</div><h3>Belum ada request untuk dianalisis</h3><p>Jalankan request di <strong>HTTP Checker</strong> atau audit di Security Headers, lalu kembali ke halaman ini untuk melihat waterfall-nya.</p><button class="btn btn-primary" data-action="to-http">Buka HTTP Checker</button></div></div>`;
  }
  const t = r.timings;
  const total = Math.max(1, t.total);
  const pct = (n) => `${Math.min(100, Math.max(0, (n / total) * 100))}%`;
  const segments = [
    ['DNS lookup', t.dns, 0, t.dns],
    ['TCP connect', t.tcp, t.dns, t.tcp],
    ['TLS handshake', t.tls, t.tcp, t.tls],
    ['TTFB (server)', t.ttfb, t.tls ?? t.tcp ?? 0, t.ttfb],
    ['Download', t.download, t.ttfb, t.total],
  ];
  return `
    ${pageHead('BROWSER · NETWORK', 'Network Timing', 'Visualisasi fase request dari hasil inspeksi terakhir. Waktu dihitung dari server sandbox, bukan dari browser Anda.')}
    <div class="card" style="margin-bottom:16px"><div class="card-body">
      <div class="row-tight"><span class="badge ${statusTone(r.status)}">${r.status} ${esc(r.statusText)}</span><span class="mono muted">${esc(r.url)}</span><span style="margin-left:auto" class="mono dim">${new Date(r.at).toLocaleString('id-ID')}</span></div>
    </div></div>
    <div class="grid-4" style="margin-bottom:16px">
      ${metric('TOTAL', fmtMs(t.total), 'End-to-end')}
      ${metric('TTFB', fmtMs(t.ttfb), 'Server merespons')}
      ${metric('DOWNLOAD', fmtMs(t.download), fmtBytes(r.bytes))}
      ${metric('REDIRECT', String(r.redirects.length), 'Hop yang diikuti')}
    </div>
    <div class="card"><div class="card-head"><h3>Waterfall Request</h3><div class="sub">Total ${fmtMs(t.total)}</div></div>
      <div class="card-body waterfall">
        ${segments.filter((s) => s[1] != null && s[1] >= 0).map(([label, value, start, end]) => `
          <div class="waterfall-row"><span class="waterfall-label">${label}</span>
            <div class="waterfall-track"><div class="waterfall-bar" style="left:${pct(start || 0)};width:${pct(Math.max(1, end - (start || 0)))}"></div></div>
            <span class="waterfall-value">${fmtMs(value)}</span></div>`).join('')}
      </div>
    </div>`;
}

function activityView() {
  return `
    ${pageHead('BROWSER · LOG', 'Activity Log', 'Riwayat semua aksi tool di sesi ini. Saat mode Proxy aktif, console.log, warn, error, dan error JavaScript dari halaman yang dimuat juga tampil di sini.')}
    <div class="card">
      <div class="card-head"><h3>Aktivitas</h3><div class="sub">${state.logs.length} entri <button class="btn btn-sm btn-ghost" data-action="clear-log" style="margin-left:8px">${ICONS.trash} Hapus</button></div></div>
      <div id="logList" class="log-list">${logRows()}</div>
    </div>`;
}

const VIEWS = { browser: browserView, http: httpView, curl: curlView, headers: headersView, dns: dnsView, network: networkView, activity: activityView };

function render() {
  if (!document.getElementById('app').firstChild) shell();
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.view === state.view));
  const global = document.getElementById('globalUrl');
  if (global && document.activeElement !== global) global.value = state.url;
  document.getElementById('content').innerHTML = VIEWS[state.view]();
  bindView();
}

function bindView() {
  const on = (id, event, fn) => document.getElementById(id)?.addEventListener(event, fn);
  const val = (id) => document.getElementById(id)?.value ?? '';

  if (state.view === 'browser') {
    on('browserUrl', 'keydown', (e) => { if (e.key === 'Enter') goUrl(val('browserUrl')); });
    document.querySelectorAll('[data-example]').forEach((el) => el.addEventListener('click', () => goUrl(el.dataset.example)));
    if (state.mode === 'proxy' && state.proxyHtml) {
      const frame = document.getElementById('previewFrame');
      if (frame) {
        frame.srcdoc = state.proxyHtml;
        frame.onload = () => {
          state.frameLoadMs = Math.round(performance.now() - proxyStarted);
          const foot = document.getElementById('browserFoot');
          if (foot) foot.innerHTML = footHtml();
        };
        const proxyStarted = performance.now();
      }
    }
  }
  if (state.view === 'http') {
    on('httpMethod', 'change', (e) => { state.http.method = e.target.value; });
    on('httpUrl', 'input', (e) => { state.http.url = e.target.value; });
    on('httpBody', 'input', (e) => { state.http.body = e.target.value; });
    on('httpFollow', 'change', (e) => { state.http.followRedirects = e.target.checked; });
    on('httpUrl', 'keydown', (e) => { if (e.key === 'Enter') doInspect(); });
    on('httpSend', 'click', doInspect);
    document.querySelectorAll('[data-preset-url]').forEach((el) => el.addEventListener('click', () => {
      state.http.url = el.dataset.presetUrl;
      render();
    }));
    document.querySelectorAll('[data-httptab]').forEach((el) => el.addEventListener('click', () => { state.httpTab = el.dataset.httptab; render(); }));
    document.querySelectorAll('[data-hkey]').forEach((el) => el.addEventListener('input', () => { state.http.headers[el.dataset.hkey].key = el.value; }));
    document.querySelectorAll('[data-hvalue]').forEach((el) => el.addEventListener('input', () => { state.http.headers[el.dataset.hvalue].value = el.value; }));
    document.querySelectorAll('[data-remove-header]').forEach((el) => el.addEventListener('click', () => {
      state.http.headers.splice(Number(el.dataset.removeHeader), 1);
      render();
    }));
  }
  if (state.view === 'curl') {
    on('curlCommand', 'input', (e) => { state.curlCommand = e.target.value; });
    on('curlRun', 'click', runCurl);
    on('curlCommand', 'keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runCurl(); });
    document.querySelectorAll('[data-curl-preset]').forEach((el) => el.addEventListener('click', () => {
      state.curlCommand = el.dataset.curlPreset;
      render();
    }));
  }
  if (state.view === 'headers') {
    on('headersUrl', 'input', (e) => { state.http.url = e.target.value; });
    on('headersUrl', 'keydown', (e) => { if (e.key === 'Enter') runHeaderAudit(); });
    on('headersRun', 'click', runHeaderAudit);
  }
  if (state.view === 'dns') {
    on('dnsHost', 'input', (e) => { state.dnsHost = e.target.value; });
    on('dnsHost', 'keydown', (e) => { if (e.key === 'Enter') runDns(); });
    on('dnsRun', 'click', runDns);
  }
}

async function doInspect(options = {}) {
  const url = options.url || (document.getElementById('httpUrl')?.value ?? state.http.url);
  state.http.url = url;
  state.busy = true;
  log('info', `HTTP ${state.http.method} → ${url}`);
  render();
  try {
    const result = await api('/api/inspect', {
      url,
      method: state.http.method,
      headers: Object.fromEntries(state.http.headers.filter((h) => h.key.trim()).map((h) => [h.key.trim(), h.value])),
      body: ['POST', 'PUT', 'PATCH'].includes(state.http.method) ? state.http.body : null,
      followRedirects: state.http.followRedirects,
    });
    state.httpResult = { ...result, at: Date.now() };
    if (result.error) { log('error', `HTTP request gagal: ${result.error}`); toast(result.error, true); }
    else log('success', `${result.status} ${result.statusText} dari ${result.url} · ${fmtMs(result.timings.total)} · ${fmtBytes(result.bytes)}`);
    render();
  } catch (err) {
    log('error', err.message);
    toast(err.message, true);
    render();
  } finally {
    state.busy = false;
    render();
  }
}

async function runHeaderAudit() {
  const url = document.getElementById('headersUrl')?.value || state.http.url;
  state.http.url = url;
  state.http.method = 'GET';
  state.busy = true;
  render();
  log('info', `Audit security header: ${url}`);
  try {
    const result = await api('/api/inspect', { url, method: 'GET', followRedirects: true });
    state.httpResult = { ...result, at: Date.now() };
    if (result.error) { toast(result.error, true); log('error', result.error); }
    else log('success', `Audit selesai: ${Object.keys(result.headers).length} header dari ${result.url}`);
  } catch (err) {
    toast(err.message, true);
    log('error', err.message);
  } finally {
    state.busy = false;
    render();
  }
}

async function runCurl() {
  state.busy = true;
  render();
  log('console', `$ ${state.curlCommand}`);
  try {
    const result = await api('/api/curl', { command: state.curlCommand });
    state.curlResult = result;
    if (result.error) { toast(result.error, true); log('error', result.error); }
    else {
      log('success', `cURL selesai · exit ${result.exitCode} · ${fmtMs(result.duration)}`);
      log('console', shorten(result.stdout || result.stderr || '(tanpa output)', 220));
    }
  } catch (err) {
    toast(err.message, true);
    log('error', err.message);
  } finally {
    state.busy = false;
    render();
  }
}

async function runDns() {
  state.busy = true;
  render();
  log('info', `DNS lookup: ${state.dnsHost}`);
  try {
    state.dnsResult = await api('/api/dns', { host: state.dnsHost });
    log('success', `DNS ${state.dnsHost}: ${Object.values(state.dnsResult.records).reduce((n, v) => n + v.length, 0)} record · ${fmtMs(state.dnsResult.duration)}`);
  } catch (err) {
    toast(err.message, true);
    log('error', err.message);
  } finally {
    state.busy = false;
    render();
  }
}

function quote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function curlFromState() {
  const parts = ['curl', '-X', state.http.method];
  if (state.http.followRedirects) parts.push('-L');
  state.http.headers.filter((h) => h.key.trim()).forEach((h) => parts.push('-H', quote(`${h.key.trim()}: ${h.value}`)));
  if (['POST', 'PUT', 'PATCH'].includes(state.http.method) && state.http.body) parts.push('--data', quote(state.http.body));
  parts.push(quote(state.http.url));
  return parts.join(' ');
}

document.addEventListener('click', async (e) => {
  const target = e.target.closest('[data-action], [data-mode], [data-device]');
  if (!target) return;
  if (target.dataset.view) return;
  const action = target.dataset.action;
  if (target.dataset.mode) {
    const mode = target.dataset.mode;
    if (mode === state.mode) return;
    state.mode = mode;
    if (mode === 'proxy') {
      state.proxyHtml = '';
      log('info', 'Beralih ke mode Proxy; mengambil HTML lewat server.');
      render();
      await loadProxy();
    } else {
      log('info', 'Beralih ke mode Embed (iframe langsung).');
      render();
      if (state.loadedUrl) {
        const frame = document.getElementById('previewFrame');
        if (frame) frame.src = state.loadedUrl;
      }
    }
    return;
  }
  if (target.dataset.device) {
    state.device = target.dataset.device;
    render();
    return;
  }
  switch (action) {
    case 'reload':
      if (state.mode === 'proxy') loadProxy();
      else {
        const frame = document.getElementById('previewFrame');
        if (frame) { frame.src = state.loadedUrl; toast('Halaman dimuat ulang.'); }
      }
      break;
    case 'load-browser': goUrl(document.getElementById('browserUrl')?.value || state.url); break;
    case 'open-new': window.open(state.loadedUrl || state.url, '_blank', 'noopener,noreferrer'); break;
    case 'add-header':
      state.http.headers.push({ key: '', value: '' });
      render();
      document.querySelector('[data-hkey]')?.focus();
      break;
    case 'to-http': setView('http'); break;
    case 'to-headers': setView('headers'); break;
    case 'to-dns':
      state.dnsHost = state.url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      setView('dns');
      break;
    case 'to-curl':
      state.curlCommand = curlFromState();
      setView('curl');
      break;
    case 'copy-response': {
      const r = state.httpResult;
      if (r) copyText(`HTTP/${r.httpVersion} ${r.status} ${r.statusText}\n${Object.entries(r.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${r.body || ''}`);
      break;
    }
    case 'copy-stdout': copyText(state.curlResult?.stdout || ''); break;
    case 'clear-log': state.logs = []; render(); break;
  }
});

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.__slotyBridge !== true) return;
  log('console', `${String(data.level || 'log').toUpperCase()}: ${String(data.text || '').slice(0, 300)}`);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

render();
log('info', 'Sloty DevLab siap. Masukkan URL untuk mulai menguji.');
