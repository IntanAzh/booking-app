# Ngrok Local Guide

Panduan ini dipakai jika ingin membuka API lokal ke internet tanpa Docker.

## 1. Install ngrok

Install ngrok dari:

```text
https://ngrok.com/download
```

Atau lewat Windows Package Manager:

```bash
winget install ngrok.ngrok
```

Pastikan command ini bisa jalan:

```bash
ngrok version
```

## 2. Set authtoken ngrok

Ambil authtoken dari dashboard ngrok, lalu jalankan:

```bash
ngrok config add-authtoken TOKEN_NGROK_KAMU
```

Jangan simpan token ngrok di file project yang akan di-push ke Git.

## 3. Jalankan backend lokal

Pastikan `.env` lokal masih memakai database lokal kamu:

```text
DB_NAME=booking_db
DB_USER=root
DB_PASS=
DB_HOST=localhost
JWT_SECRET=SECRET_KEY
DB_SYNC_ALTER=false
```

Jalankan backend:

```bash
npm run dev
```

API lokal:

```text
http://localhost:3000
```

## 4. Jalankan ngrok lokal

Buka terminal baru, lalu jalankan:

```bash
npm run ngrok
```

Atau langsung:

```bash
ngrok http 3000
```

Ngrok akan menampilkan URL seperti:

```text
https://xxxx-xxxx.ngrok-free.app
```

Gunakan URL itu sebagai `base_url` di Postman:

```text
{{base_url}} = https://xxxx-xxxx.ngrok-free.app
```

Contoh endpoint online:

```text
https://xxxx-xxxx.ngrok-free.app/api/auth/login
```

## 5. Dashboard ngrok

Saat ngrok berjalan, buka:

```text
http://localhost:4040
```

Dashboard ini menampilkan request yang masuk, status response, dan detail error.

## 6. Reserved domain opsional

Jika akun ngrok kamu punya reserved domain, jalankan:

```bash
ngrok http --domain=domain-kamu.ngrok-free.app 3000
```

Dengan reserved domain, URL public tidak berubah-ubah setiap restart.
