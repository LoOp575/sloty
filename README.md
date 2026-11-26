# Sloty DevLab

Web testing playground berbasis Node.js tanpa dependency eksternal. Masukkan URL situs, tampilkan di dalam dashboard, lalu analisis dengan tool testing yang tersedia.

## Menjalankan

```bash
npm start
```

Buka `http://localhost:3000` (atau URL preview yang diberikan). Port bisa diubah lewat environment variable `PORT`. Timeout default tool bisa diubah lewat `REQUEST_TIMEOUT` dan `CURL_TIMEOUT` (milidetik, maksimal 60000), atau lewat selector timeout di UI.

## Fitur

| Menu | Fungsi |
| --- | --- |
| **Browser Launcher** | Mode utama: URL langsung dibuka di browser perangkat, dashboard mencatat sesi, durasi, klik menu, dan riwayat status (monitoring berkala). Mode **Embed** (iframe) dan **Proxy** tetap tersedia. |
| **HTTP Checker** | Kirim request GET/HEAD/POST/PUT/PATCH/DELETE/OPTIONS dengan custom header dan body; lihat status, header, redirect chain, body, serta timing. |
| **cURL Lab** | Menjalankan perintah cURL di server dan menampilkan stdout, stderr, exit code, dan durasi. Opsi yang menulis file diblokir. |
| **Security Headers** | Audit CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, dan lain-lain dengan skor 0–100. |
| **DNS Lookup** | Rekaman A, AAAA, CNAME, MX, TXT, dan NS untuk sebuah host. |
| **Network Timing** | Waterfall DNS → TCP → TLS → TTFB → download dari inspeksi terakhir. |
| **Konektivitas / Diagnostics** | Cek DNS → TCP → TLS → HTTP satu per satu untuk melihat tepat di mana koneksi ke URL terputus. |
| **Activity Log** | Riwayat aksi dan pesan `console.log`/error dari halaman yang dibuka dalam mode Proxy. |

## Alur kerja launcher

1. Masukkan URL di address bar → halaman terbuka di browser HP/perangkat.
2. Kembali ke dashboard: kartu **Sesi pengujian aktif** menampilkan URL, waktu buka, dan durasi.
3. Klik menu tool — URL otomatis terisi dan setiap klik tercatat di **Activity Log**.
4. Klik **Mulai monitoring status** untuk mencatat status HTTP dan response time setiap 15 detik.

## Catatan

- Situs seperti Google, GitHub, Facebook, dan banyak aplikasi lain mengirim `X-Frame-Options: DENY` atau CSP `frame-ancestors`, sehingga tidak bisa tampil di iframe biasa. Mode **Proxy** mencoba mengatasi ini dengan mengambil HTML dari server, tetapi JavaScript halaman tersebut tetap bisa gagal karena pembatasan cookies/CORS.
- Request HTTP, cURL, dan proxy dijalankan dari server. Pastikan hanya orang yang dipercaya yang memiliki akses ke tool ini bila di-deploy publik; sandbox ini bukan pengganti audit keamanan.
- Di lingkungan preview dengan jaringan terbatas, hanya domain yang diizinkan platform yang bisa dijangkau oleh tool server-side. Mode **Embed** tetap membuka situs langsung dari browser pengguna.
- Untuk membuka **web lokal yang berjalan di PC/laptop** dari HP (mis. Termux), jangan pakai `localhost` — itu merujuk ke HP. Gunakan IP LAN PC (contoh `http://192.168.1.5:8080`), pastikan kedua perangkat di WiFi sama, server web PC bind ke `0.0.0.0`, dan firewall PC mengizinkan port tersebut.
- Aplikasi perbankan/fintech (mis. `dana.id`) sengaja memblokir iframe dan request otomatis lewat header `X-Frame-Options`/CSP serta WAF anti-bot, jadi wajar bila timeout di semua mode. Gunakan situs uji seperti `example.com`, `httpbin.org`, `api.github.com`, `registry.npmjs.org`, atau `pypi.org`.

## Struktur

```
server.js          # HTTP server + API (/api/inspect, /api/curl, /api/dns, /api/proxy)
public/index.html  # shell aplikasi
public/styles.css  # UI
public/app.js      # logika SPA dan tool
```
