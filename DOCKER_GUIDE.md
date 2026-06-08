# Docker Guide Booking App

## Jalankan Project

Build dan jalankan API + MySQL:

```bash
docker compose up --build
```

API berjalan di:

```text
http://localhost:3000
```

MySQL dari host berjalan di:

```text
localhost:3308
```

Credential MySQL Docker:

```text
database: booking_db
user: root
password: booking_password
host di container: mysql
host dari laptop: localhost
port dari laptop: 3308
```

## Jalankan Dengan Ngrok

Ngrok dipakai agar API lokal bisa diakses online.

1. Buat akun dan ambil authtoken dari dashboard ngrok.
2. Tambahkan token ke file `.env` di root project:

```text
NGROK_AUTHTOKEN=isi_token_ngrok_kamu
```

3. Jalankan API + MySQL + ngrok:

```bash
docker compose --profile ngrok up --build
```

4. Buka dashboard ngrok lokal:

```text
http://localhost:4040
```

Di sana akan muncul public URL seperti:

```text
https://xxxx-xxxx.ngrok-free.app
```

Gunakan URL tersebut sebagai `base_url` Postman:

```text
{{base_url}} = https://xxxx-xxxx.ngrok-free.app
```

Contoh endpoint online:

```text
https://xxxx-xxxx.ngrok-free.app/api/auth/login
```

Jika ingin melihat URL langsung dari log:

```bash
docker compose logs -f ngrok
```

## Stop Container

```bash
docker compose down
```

## Reset Database Docker

Perintah ini menghapus volume database Docker, jadi semua data di MySQL Docker hilang:

```bash
docker compose down -v
docker compose up --build
```

Saat volume kosong, MySQL akan menjalankan:

```text
database/schema.sql
```

## Lihat Log

```bash
docker compose logs -f api
docker compose logs -f mysql
docker compose logs -f ngrok
```

## Test API

Gunakan Postman dengan:

```text
{{base_url}} = http://localhost:3000
```

Ikuti contoh endpoint di:

```text
testguide.md
```
