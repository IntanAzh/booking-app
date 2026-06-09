# Docker Guide Booking App

## Deploy ke VPS

1. Clone repository di VPS.
2. Pastikan file `.env.docker` ada di root project. File ini dipakai langsung oleh Docker Compose.
3. Jika ingin mengubah password database atau JWT, edit `.env.docker`. Minimal nilainya:

```text
PORT=3000
DB_NAME=booking_db
DB_USER=root
DB_PASS=password_mysql_yang_kuat
DB_HOST=mysql
MYSQL_DATABASE=booking_db
MYSQL_ROOT_PASSWORD=password_mysql_yang_kuat
JWT_SECRET=secret_jwt_yang_panjang_dan_acak
DB_SYNC_ALTER=false
NODE_ENV=production
```

4. Jalankan container:

```bash
docker compose up --build -d
```

5. Akses API dari browser atau Postman:

```text
http://IP_VPS_KAMU:3000
```

Catatan: MySQL tidak diekspos ke host secara default. Database hanya bisa diakses dari container API.

## Jalankan Project Lokal Dengan Docker

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
tidak diekspos ke host secara default
```

Credential MySQL Docker:

```text
database: booking_db
user: root
password: ambil dari file .env
host di container: mysql
host dari container lain: mysql
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
