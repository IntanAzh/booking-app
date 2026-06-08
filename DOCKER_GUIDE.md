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
localhost:3307
```

Credential MySQL Docker:

```text
database: booking_db
user: root
password: booking_password
host di container: mysql
host dari laptop: localhost
port dari laptop: 3307
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
