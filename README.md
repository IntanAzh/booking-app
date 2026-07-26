# Booking App (Aplikasi Pemesanan Layanan)

## 📌 About Apps (Tentang Aplikasi)

**Booking App** adalah platform pemesanan (booking) layanan berbasis web *full-stack* modern yang dirancang untuk menghubungkan **Pelanggan (Customer)**, **Penyedia Jasa (Provider)**, dan **Pengelola Sistem (Admin)**. 

Aplikasi ini menyediakan sistem penjadwalan layanan yang fleksibel, validasi slot waktu *real-time* untuk mencegah *overbooking*, kalkulasi harga dinamis (*dynamic pricing*) berdasarkan jam sibuk atau akhir pekan, simulasi pembayaran, hingga dasbor analitik pendapatan dan integrasi cloud storage untuk penyimpanan media/gambar layanan.

### 🌟 Fitur Utama
- **Sistem Otentikasi & Multi-Role**: Registrasi, Login, Profile, JWT Authentication dengan hak akses terbatas (`customer`, `provider`, `admin`).
- **Manajemen Layanan & Provider**: Pengelolaan katalog layanan per kategori dan profil penyedia jasa.
- **Penjadwalan & Slot Waktu Akurat**: Pembuatan jadwal mingguan, slot waktu per tanggal, serta pengecekan ketersediaan slot bebas bentrok (*overlap check*).
- **Dynamic Pricing Engine**: Penyesuaian harga otomatis berdasarkan hari libur/weekend, *peak hour*, dan jumlah permintaan (*demand*).
- **Simulasi Pembayaran & Refund**: Alur konfirmasi booking otomatis, simulasi transaksi pembayaran, serta pembatalan booking dengan pengembalian slot.
- **Supabase Cloud Storage Integration**: Penyimpanan gambar layanan terpusat menggunakan Supabase Storage.
- **Dasbor Statistik & Analitik**: Grafik dan laporan statistik transaksi serta pendapatan khusus Admin dan Provider.
- **API Documentation**: Dokumentasi interaktif REST API menggunakan Swagger UI.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework & Build Tool**: React 18 + Vite
- **Styling**: Tailwind CSS + PostCSS
- **Icons & UI**: Lucide React
- **Cloud Storage SDK**: `@supabase/supabase-js`

### **Backend**
- **Runtime & Framework**: Node.js + Express.js
- **ORM & Database**: Sequelize ORM + MySQL
- **Authentication**: JSON Web Token (JWT) + BcryptJS
- **API Documentation**: Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)

### **Infrastructure & Utilities**
- **Cloud Storage**: Supabase Storage
- **Containerization**: Docker & Docker Compose
- **MCP Integration**: Supabase MCP Server (`.mcp.json`)

---

## 📂 Struktur Proyek

```text
booking-app/
├── backend/                        # Source code Backend (Node.js/Express)
│   ├── bin/                        # Entry point server (www)
│   ├── database/                   # Schema SQL, migrasi, & seeder
│   │   ├── schema.sql              # Skema tabel MySQL lengkap
│   │   └── migrate_*.sql           # Skrip penyesuaian kolom database
│   ├── public/                     # Static files & stylesheet default
│   ├── src/
│   │   ├── app.js                  # Inisialisasi Express app & middleware
│   │   ├── config/                 # Konfigurasi koneksi Sequelize database
│   │   ├── middlewares/            # Auth JWT & Role guard middleware
│   │   ├── models/                 # Model Sequelize (User, Service, Booking, Payment, TimeSlot, dsb)
│   │   ├── routes/                 # Route handler REST API
│   │   │   ├── auth.js             # API Login, Register, Profile
│   │   │   ├── bookings.js         # API Transaksi booking & validasi slot
│   │   │   ├── customers.js        # API Histori booking customer
│   │   │   ├── dashboard.js        # API Statistik & pendapatan
│   │   │   ├── myBookings.js       # API Booking user terautentikasi
│   │   │   ├── payments.js         # API Simulasi pembayaran & refund
│   │   │   ├── pricing.js          # API Kalkulasi dynamic pricing
│   │   │   ├── providers.js        # API Kelola data provider & layanan milik provider
│   │   │   ├── schedules.js        # API Jadwal rutin layanan
│   │   │   ├── services.js         # API Katalog layanan
│   │   │   ├── slots.js            # API Kelola slot waktu aktual
│   │   │   └── users.js            # API Manajemen pengguna
│   │   └── utils/                  # Utility helper (Kalkulasi Dynamic Pricing)
│   ├── .env                        # File konfigurasi environment backend
│   ├── Dockerfile                  # Container definition backend
│   └── package.json                # Dependencies backend
│
├── frontend/                       # Source code Frontend (React/Vite)
│   ├── public/                     # Aset publik frontend
│   ├── src/
│   │   ├── components/             # Komponen UI reusable (Navbar, Footer, Card, Modal)
│   │   ├── pages/                  # Halaman aplikasi (Home, Login, Services, Booking, Dashboard)
│   │   ├── services/               # API Service & Supabase Storage Client (supabaseService.js)
│   │   ├── App.jsx                 # Routing & Layout utama
│   │   ├── main.jsx                # React Entry Point
│   │   └── index.css               # Import Tailwind CSS & styling global
│   ├── .env                        # File konfigurasi environment frontend
│   ├── index.html                  # Template HTML utama
│   ├── tailwind.config.js          # Konfigurasi Tailwind CSS
│   ├── vite.config.js              # Konfigurasi Vite
│   └── package.json                # Dependencies frontend
│
├── .mcp.json                       # Konfigurasi Supabase MCP Server untuk AGY / AI
├── docker-compose.yml              # Container orchestration (Backend + MySQL)
├── DEPLOY_GUIDE.md                 # Panduan deployment ke server produksi
├── DOCKER_GUIDE.md                 # Panduan detail penggunaan Docker
├── STRUKTUR_DAN_PENJELASAN.md      # Penjelasan detail arsitektur & modul
└── testguide.md                    # Panduan skenario pengujian & API testing
```

---

## 🚀 Cara Instalasi & Menjalankan Proyek

### **Prasyarat Sistem**
- **Node.js** (v18 atau versi lebih baru) & **npm**
- **MySQL Server** (jika menjalankan lokal tanpa Docker)
- **Docker Desktop** (opsional, jika ingin menggunakan Docker)
- **Akun Supabase** (untuk fitur unggah gambar ke Supabase Storage)

---

### **1. Setup & Konfigurasi Backend**

1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `backend`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=booking_db
   JWT_SECRET=rahasia_jwt_booking_app_super_aman
   DB_SYNC_ALTER=true
   ```
4. Buat database `booking_db` di MySQL Anda, atau jalankan file `backend/database/schema.sql`.
5. Jalankan server backend dalam mode development:
   ```bash
   npm run dev
   ```
   *Backend akan berjalan di `http://localhost:3000`*.

---

### **2. Setup & Konfigurasi Frontend**

1. Masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `frontend`:
   ```env
   VITE_SUPABASE_URL=https://<PROJECT_REF_ANDA>.supabase.co
   VITE_SUPABASE_ANON_KEY=<ANON_KEY_SUPABASE_ANDA>
   VITE_SUPABASE_BUCKET=service-images
   ```
4. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan di `http://localhost:5173`*.

---

### **3. Konfigurasi Supabase Storage (Untuk Gambar Layanan)**

Agar fitur pengunggahan foto layanan berfungsi di Supabase Storage:

1. Buka [Supabase Console](https://supabase.com/dashboard) dan pilih proyek Anda.
2. Buka menu **SQL Editor**, lalu jalankan query SQL berikut untuk membuat bucket `service-images` dan memberikan izin upload publik:
   ```sql
   -- Set bucket service-images menjadi Public
   UPDATE storage.buckets
   SET public = true
   WHERE id = 'service-images';

   -- Policy Izin Pembacaan (SELECT)
   CREATE POLICY "Allow Public Select"
   ON storage.objects FOR SELECT
   TO public
   USING ( bucket_id = 'service-images' );

   -- Policy Izin Unggah (INSERT)
   CREATE POLICY "Allow Public Upload"
   ON storage.objects FOR INSERT
   TO public
   WITH CHECK ( bucket_id = 'service-images' );

   -- Policy Izin Pembaruan File (UPDATE)
   CREATE POLICY "Allow Public Update"
   ON storage.objects FOR UPDATE
   TO public
   USING ( bucket_id = 'service-images' );
   ```

---

### **4. Menjalankan Menggunakan Docker (Opsional)**

Aplikasi ini sudah mendukung Docker & Docker Compose untuk kemudahan eksekusi satu langkah:

1. Dari root direktori proyek, jalankan:
   ```bash
   docker-compose up -d --build
   ```
2. Docker akan mengunduh image MySQL, melakukan build backend, dan menjalankan container secara terisolasi.

---

## 📑 Dokumentasi REST API (Swagger)

Setelah backend berjalan, Anda dapat mengakses dokumentasi API interaktif Swagger pada browser di URL:
```text
http://localhost:3000/api-docs
```

---

## 📚 Referensi Dokumen Tambahan
- **[STRUKTUR_DAN_PENJELASAN.md](STRUKTUR_DAN_PENJELASAN.md)**: Detail alur kerja booking, dynamic pricing, dan skema database.
- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)**: Panduan penanganan container Docker.
- **[DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)**: Instruksi deployment ke server VPS / Cloud Production.
- **[testguide.md](testguide.md)**: Skenario pengujian API dan petunjuk pengujian fitur.
