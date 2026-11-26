# Sloty DevLab

Web testing playground berbasis Node.js tanpa dependency eksternal. Masukkan URL situs, tampilkan di dalam dashboard, lalu analisis dengan tool testing yang tersedia.

## Menjalankan

```bash
npm start
```

Buka `http://localhost:3000` (atau URL preview yang diberikan). Port bisa diubah lewat environment variable `PORT`.

## Fitur

| Menu | Fungsi |
| --- | --- |
| **Browser Embed** | Membuka URL di dalam iframe, mode *Proxy* (HTML diambil server lalu dirender dengan `srcdoc`) untuk situs yang memblokir iframe, pilihan viewport desktop/tablet/mobile, buka tab baru. |
| **HTTP Checker** | Kirim request GET/HEAD/POST/PUT/PATCH/DELETE/OPTIONS dengan custom header dan body; lihat status, header, redirect chain, body, serta timing. |
| **cURL Lab** | Menjalankan perintah cURL di server dan menampilkan stdout, stderr, exit code, dan durasi. Opsi yang menulis file diblokir. |
| **Security Headers** | Audit CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, dan lain-lain dengan skor 0–100. |
| **DNS Lookup** | Rekaman A, AAAA, CNAME, MX, TXT, dan NS untuk sebuah host. |
| **Network Timing** | Waterfall DNS → TCP → TLS → TTFB → download dari inspeksi terakhir. |
| **Activity Log** | Riwayat aksi dan pesan `console.log`/error dari halaman yang dibuka dalam mode Proxy. |

## Catatan

- Situs seperti Google, GitHub, Facebook, dan banyak aplikasi lain mengirim `X-Frame-Options: DENY` atau CSP `frame-ancestors`, sehingga tidak bisa tampil di iframe biasa. Mode **Proxy** mencoba mengatasi ini dengan mengambil HTML dari server, tetapi JavaScript halaman tersebut tetap bisa gagal karena pembatasan cookies/CORS.
- Request HTTP, cURL, dan proxy dijalankan dari server. Pastikan hanya orang yang dipercaya yang memiliki akses ke tool ini bila di-deploy publik; sandbox ini bukan pengganti audit keamanan.
- Di lingkungan preview dengan jaringan terbatas, hanya domain yang diizinkan platform yang bisa dijangkau oleh tool server-side. Mode **Embed** tetap membuka situs langsung dari browser pengguna.

## Struktur

```
server.js          # HTTP server + API (/api/inspect, /api/curl, /api/dns, /api/proxy)
public/index.html  # shell aplikasi
public/styles.css  # UI
public/app.js      # logika SPA dan tool
```
