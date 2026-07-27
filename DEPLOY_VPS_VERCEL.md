# 🚀 Panduan Deployment Step-by-Step: VPS (Backend) & Vercel (Frontend)

Panduan ini berisi langkah-langkah praktis dan terurut untuk men-deploy **Booking App**:
- **Backend (Node.js/Express + MySQL)** di-deploy ke **VPS** menggunakan **Docker Compose**.
- **Frontend (React + Vite)** di-deploy ke **Vercel**.
- **Storage (Gambar Layanan)** dihubungkan ke **Supabase Storage**.

---

## 📋 DAFTAR ISI
1. [Prasyarat](#1-prasyarat)
2. [Langkah 1: Setup Supabase Storage & RLS](#langkah-1-setup-supabase-storage--rls)
3. [Langkah 2: Deploy Backend ke VPS (Docker)](#langkah-2-deploy-backend-ke-vps-docker)
4. [Langkah 3: Deploy Frontend ke Vercel](#langkah-3-deploy-frontend-ke-vercel)
5. [Langkah 4: Pengujian & Verifikasi Akhir](#langkah-4-pengujian--verifikasi-akhir)
6. [Troubleshooting & Perintah Penting](#troubleshooting--perintah-penting)

---

## 1. Prasyarat

Sebelum memulai, pastikan Anda memiliki:
- **Akses VPS** (Ubuntu/Debian/CentOS) dengan akses SSH & IP Publik (contoh: `103.xxx.xxx.xxx`).
- **Docker & Docker Compose** sudah terinstal di VPS.
- **Akun Vercel** yang sudah terhubung dengan akun GitHub/GitLab.
- **Akun Supabase** dengan proyek aktif.
- **Repository Git** yang berisi kode proyek ini yang sudah di-push ke GitHub.

---

## Langkah 1: Setup Supabase Storage & RLS

Aplikasi ini menggunakan Supabase Storage untuk menyimpan foto/gambar layanan.

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan pilih proyek Anda.
2. Masuk ke menu **SQL Editor** pada bilah sebelah kiri.
3. Jalankan query SQL berikut untuk membuat bucket `service-images` dan memberikan izin upload publik:

```sql
-- 1. Set bucket service-images menjadi Public
UPDATE storage.buckets
SET public = true
WHERE id = 'service-images';

-- 2. Policy Izin Pembacaan (SELECT)
CREATE POLICY "Allow Public Select"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'service-images' );

-- 3. Policy Izin Unggah (INSERT)
CREATE POLICY "Allow Public Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'service-images' );

-- 4. Policy Izin Pembaruan File (UPDATE)
CREATE POLICY "Allow Public Update"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'service-images' );
```
4. Catat **Project URL** (contoh: `https://atpdfersupwoooxphhtw.supabase.co`) dan **anon key** dari menu **Project Settings -> API**.

---

## Langkah 2: Deploy Backend ke VPS (Docker)

### 2.1. SSH & Clone Repository di VPS
Buka terminal lokal Anda dan hubungi VPS via SSH:
```bash
ssh root@IP_VPS_ANDA
```
Setelah masuk ke VPS, clone repository proyek Anda:
```bash
git clone https://github.com/USERNAME/booking-app.git
cd booking-app
```

### 2.2. Konfigurasi Environment File Backend
Buat/edit file `backend/.env.docker`:
```bash
nano backend/.env.docker
```
Isi dengan variabel produksi berikut (ganti password & secret):
```env
PORT=3000
DB_NAME=booking_db
DB_USER=root
DB_PASS=BuatPasswordMySQLYangKuat123!
DB_HOST=mysql
MYSQL_DATABASE=booking_db
MYSQL_ROOT_PASSWORD=BuatPasswordMySQLYangKuat123!
JWT_SECRET=BuatJWTSecretSangatAcakDanPanjang998877!
NODE_ENV=production
DB_SYNC_ALTER=false
```
*Simpan file dengan menekan `Ctrl+O`, `Enter`, lalu keluar dengan `Ctrl+X`.*

### 2.3. Buka Port Firewall VPS (Jika Diperlukan)
Pastikan port `3000` (Backend API) dapat diakses dari luar:
```bash
# Untuk UFW (Ubuntu)
sudo ufw allow 3000/tcp
sudo ufw reload
```

### 2.4. Build & Jalankan Container Backend
Jalankan Docker Compose dari root direktori `booking-app`:
```bash
docker compose up -d --build
```

### 2.5. Verifikasi Backend di VPS
Periksa apakah container sudah berjalan dengan status `Up` (healthy):
```bash
docker compose ps
```
Buka browser Anda dan akses endpoint backend VPS:
```text
http://IP_VPS_ANDA:3000/api-docs
```
*Jika halaman Swagger UI terbuka, artinya Backend API & Database MySQL di VPS sudah **100% Berjalan dan Siap**!*

---

## Langkah 3: Deploy Frontend ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan login.
2. Klik tombol **Add New...** $\rightarrow$ **Project**.
3. Pilih repository GitHub `booking-app` Anda.
4. Pada halaman **Configure Project**, sesuaikan pengaturan berikut:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Klik **Edit** dan pilih folder `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Buka bagian **Environment Variables** dan tambahkan 4 variabel berikut:

| Name / Key | Value | Keterangan |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://IP_VPS_ANDA:3000/api` | URL API Backend VPS Anda |
| `VITE_SUPABASE_URL` | `https://atpdfersupwoooxphhtw.supabase.co` | URL Supabase Anda |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR...` | Anon Key Supabase Anda |
| `VITE_SUPABASE_BUCKET` | `service-images` | Nama Bucket Supabase Storage |

*(Catatan: Jika VPS Anda sudah memakai HTTPS/Domain misal `https://api.domainanda.com`, gunakan `https://api.domainanda.com/api` pada `VITE_API_URL`)*.

6. Klik **Deploy**.
7. Tunggu hingga proses build Vercel selesai (biasanya 1–2 menit). Vercel akan memberikan domain publik (contoh: `https://booking-app-xyz.vercel.app`).

---

## Langkah 4: Pengujian & Verifikasi Akhir

Buka domain Vercel Anda di browser (misal `https://booking-app-xyz.vercel.app`):

1. **Uji Registrasi & Login**:
   - Buat akun baru sebagai Customer.
   - Login admin, lalu buat akun Provider dari menu Providers.
   - Pastikan login berhasil dan JWT token tersimpan di browser.
2. **Uji Unggah Foto Layanan (Supabase Storage)**:
   - Login sebagai Provider.
   - Tambah layanan baru dan unggah foto layanan.
   - Pastikan gambar berhasil diunggah dan tampil di halaman katalog layanan.
3. **Uji Alur Pemesanan (Booking)**:
   - Buat slot waktu dan lakukan simulasi booking serta pembayaran.

---

## 🛠️ Troubleshooting & Perintah Penting

### Di VPS (Backend & Database)
- **Melihat Log Backend API**:
  ```bash
  docker compose logs -f api
  ```
- **Melihat Log Database MySQL**:
  ```bash
  docker compose logs -f mysql
  ```
- **Merestart Container**:
  ```bash
  docker compose restart
  ```
- **Menghentikan Container**:
  ```bash
  docker compose down
  ```
- **Pembaruan Kode Backend dari Git**:
  ```bash
  git pull origin main
  docker compose up -d --build
  ```

### Di Vercel (Frontend)
- Jika ada perubahan kode frontend, cukup lakukan `git push` ke GitHub, Vercel akan otomatis melakukan pembaharuan (*auto-deploy*).
- Jika API gagal diakses (*Network Error*), pastikan port `3000` di VPS tidak terhalang firewall dan `VITE_API_URL` di Vercel sudah benar.
