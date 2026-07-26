# Booking App

Aplikasi backend (REST API) untuk sistem pemesanan (booking) yang dibangun menggunakan Node.js, Express, Sequelize, dan MySQL. Aplikasi ini juga telah dilengkapi dengan Docker untuk kemudahan deployment dan Swagger untuk dokumentasi API.

## Teknologi yang Digunakan
- **Node.js & Express.js** sebagai framework backend.
- **Sequelize ORM** untuk interaksi dengan database.
- **MySQL** sebagai sistem manajemen basis data.
- **JWT (JSON Web Token)** untuk Autentikasi dan Otorisasi.
- **Swagger** (`swagger-ui-express`, `swagger-jsdoc`) untuk Dokumentasi API.
- **Docker & Docker Compose** untuk containerization.

## Persyaratan Sistem
- Node.js
- MySQL Server
- Docker & Docker Compose (Opsional, jika ingin menjalankan via Docker)

## Cara Instalasi & Menjalankan (Local - Tanpa Docker)

1. Pastikan Anda sudah menginstal Node.js dan MySQL.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi Environment:
   Salin file environment contoh (misalnya `.env.docker.example` atau `.env.example`) menjadi `.env`:
   ```bash
   cp .env.docker.example .env
   ```
   Buka file `.env` dan sesuaikan konfigurasi koneksi database Anda (Host, User, Password, Nama DB).
4. Jalankan aplikasi:
   - **Mode Development** (menggunakan nodemon):
     ```bash
     npm run dev
     ```
   - **Mode Production**:
     ```bash
     npm start
     ```

## Cara Menjalankan (Dengan Docker)

Aplikasi ini sudah dikonfigurasi untuk berjalan di atas Docker.

1. Pastikan Docker Desktop atau Docker Engine sudah terinstal dan berjalan.
2. Konfigurasi file environment (lihat panduan environment di atas).
3. Build dan jalankan container:
   ```bash
   docker-compose up -d --build
   ```
4. Aplikasi Node.js dan service MySQL akan otomatis berjalan dan terhubung satu sama lain.

## Dokumentasi API (Swagger)

Aplikasi ini dilengkapi dengan Swagger UI untuk memudahkan eksplorasi dan pengujian endpoint API.
Setelah aplikasi berjalan, buka browser dan akses:
```
http://localhost:<PORT>/api-docs
```
*(Sesuaikan `<PORT>` dengan nilai port yang terkonfigurasi di file `.env` Anda, biasanya port 3000).*

## Referensi Dokumen Tambahan
Terdapat beberapa dokumen terpisah untuk panduan yang lebih detail:
- **[STRUKTUR_DAN_PENJELASAN.md](STRUKTUR_DAN_PENJELASAN.md)**: Penjelasan mengenai arsitektur kode dan fungsi dari setiap folder.
- **[DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)**: Panduan untuk melakukan deployment aplikasi ke server production.
- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)**: Panduan spesifik terkait penggunaan Docker di proyek ini.
- **[testguide.md](testguide.md)**: Panduan dan instruksi untuk melakukan pengujian/testing API.
