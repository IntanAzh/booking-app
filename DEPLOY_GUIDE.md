# Deploy Guide Booking App

Panduan ini dipakai saat kamu ingin deploy aplikasi ke VPS menggunakan Docker. Alurnya dibuat supaya setelah `git clone`, kamu tinggal isi `.env.docker` lalu jalankan container.

## Prasyarat

- VPS sudah terpasang Docker dan Docker Compose.
- Port 3000 terbuka di firewall VPS.
- Repository sudah di-clone ke VPS.

## Struktur file deploy

- `docker-compose.yml` untuk menjalankan API dan MySQL.
- `.env.docker` untuk konfigurasi production.
- `database/schema.sql` untuk inisialisasi database pertama kali.

## Langkah deploy

1. Clone repository ke VPS.

```bash
git clone <repo-url>
cd booking-app
```

2. Pastikan file `.env.docker` ada di root project.

Kalau belum ada, salin dari contoh:

```bash
cp .env.docker.example .env.docker
```

3. Isi `.env.docker` dengan value production.

Contoh minimal:

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

4. Jalankan container.

```bash
docker compose up --build -d
```

5. Cek status container.

```bash
docker compose ps
```

6. Buka API dari browser atau Postman.

```text
http://IP_VPS_KAMU:3000
```

## Cara kerja database

- MySQL berjalan sebagai container `mysql`.
- API berjalan sebagai container `api`.
- API terhubung ke MySQL menggunakan host internal `mysql`.
- Database tidak diekspos ke port host secara default.

## Perintah penting

Lihat log API:

```bash
docker compose logs -f api
```

Lihat log MySQL:

```bash
docker compose logs -f mysql
```

Stop container:

```bash
docker compose down
```

Stop dan hapus volume database:

```bash
docker compose down -v
```

## Catatan penting

- Saat volume database masih kosong, MySQL akan menjalankan `database/schema.sql`.
- Jangan pakai `DB_HOST=localhost` di VPS Docker. Nilai yang benar adalah `mysql`.
- Jika mengubah `DB_PASS`, pastikan `MYSQL_ROOT_PASSWORD` di `.env.docker` sama.

## Verifikasi cepat

Setelah container hidup, cek endpoint root:

```text
http://IP_VPS_KAMU:3000/
```

Dan Swagger:

```text
http://IP_VPS_KAMU:3000/api-docs
```
