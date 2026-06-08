# Struktur dan Penjelasan Booking App

## Ringkasan fitur

Aplikasi ini adalah backend booking layanan berbasis Express, Sequelize, MySQL, dan JWT. Fitur yang sudah disiapkan:

- Role `customer`, `provider`, dan `admin`.
- Register, login, logout, profile, JWT, dan role guard.
- CRUD data layanan.
- CRUD khusus data penyedia layanan.
- Jadwal layanan per provider dan service.
- Slot waktu per provider, service, dan tanggal.
- Booking oleh customer.
- Validasi ketersediaan slot dengan pengecekan overlap waktu.
- Dynamic pricing berdasarkan weekend, peak hour, dan jumlah permintaan.
- Simulasi pembayaran.
- Pembatalan booking dan pengembalian status slot.
- Histori booking untuk customer, provider, dan admin.
- Dashboard pemesanan dan pendapatan untuk admin serta provider.

## Struktur folder

```text
booking-app/
  bin/
    www
  database/
    schema.sql
  postman/
  public/
    stylesheets/style.css
  routes/
    index.js
    users.js
  src/
    app.js
    config/
      database.js
    middlewares/
      authMiddleware.js
    models/
      booking.js
      category.js
      payment.js
      service.js
      serviceSchedule.js
      serviceVariant.js
      staffSpeciality.js
      timeSlot.js
      user.js
    routes/
      auth.js
      bookings.js
      dashboard.js
      payments.js
      posts.js
      providers.js
      schedules.js
      services.js
      slots.js
      users.js
    utils/
      pricing.js
  views/
  package.json
```

## File penting yang dibuat atau diperbarui

- `src/models/serviceSchedule.js`: model jadwal mingguan provider untuk sebuah layanan dengan `day`, `start_time`, `end_time`, dan `is_available`.
- `src/models/timeSlot.js`: model slot waktu aktual yang bisa `available`, `booked`, atau `blocked`.
- `src/models/payment.js`: model simulasi pembayaran booking.
- `src/models/booking.js`: ditambah `provider_id`, `slot_id`, `payment_status`, dan `cancellation_reason`.
- `src/models/service.js`: ditambah `provider_id` agar layanan bisa dikaitkan ke penyedia.
- `src/routes/providers.js`: CRUD penyedia layanan, profil provider login, dan list layanan milik provider.
- `src/routes/schedules.js`: CRUD jadwal layanan.
- `src/routes/slots.js`: CRUD slot waktu.
- `src/routes/payments.js`: simulasi pembayaran, detail pembayaran, list pembayaran, dan refund.
- `src/routes/bookings.js`: booking, histori, validasi overlap slot, dynamic pricing, update status, dan cancel.
- `src/routes/dashboard.js`: statistik booking dan revenue untuk admin/provider.
- `src/utils/pricing.js`: logika dynamic pricing.
- `database/schema.sql`: struktur database lengkap sesuai model baru.

## Endpoint utama

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

### Users dan provider

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/providers`
- `POST /api/providers`
- `GET /api/providers/me`
- `PUT /api/providers/me`
- `GET /api/providers/me/services`
- `GET /api/providers/:id`
- `PUT /api/providers/:id`
- `DELETE /api/providers/:id`

### Services

- `POST /api/services`
- `GET /api/services`
- `GET /api/services/:id`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

Create dan update service memvalidasi relasi wajib:

- `category_id` harus ada di table `categories`.
- `provider_id` harus ada di table `users` dengan role `provider`.
- Jika category atau provider belum ada, service tidak bisa dibuat.

### Jadwal dan slot

- `POST /api/schedules`
- `GET /api/schedules`
- `GET /api/schedules/:id`
- `PUT /api/schedules/:id`
- `DELETE /api/schedules/:id`
- `POST /api/slots`
- `GET /api/slots`
- `PUT /api/slots/:id`
- `DELETE /api/slots/:id`

### Booking

- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/bookings/:id`
- `PUT /api/bookings/:id`
- `PATCH /api/bookings/:id/cancel`
- `DELETE /api/bookings/:id`

### Payment dan dashboard

- `POST /api/payments/simulate`
- `GET /api/payments`
- `GET /api/payments/:id`
- `PATCH /api/payments/:id/refund`
- `GET /api/dashboard`

## Alur booking

1. Admin/provider membuat layanan.
2. Admin/provider membuat jadwal layanan.
3. Admin/provider membuat slot waktu.
4. Customer login dan membuat booking memakai `slot_id`, atau memakai `provider_id` + `start_time`.
5. Sistem mengecek provider, service, status slot, kapasitas slot, dan booking lain yang overlap.
6. Sistem menghitung dynamic pricing.
7. Booking dibuat dengan status `pending` dan `payment_status` `unpaid`.
8. Customer/admin/provider melakukan simulasi pembayaran melalui `/api/payments/simulate`.
9. Jika pembayaran sukses, booking menjadi `confirmed` dan `payment_status` menjadi `paid`.
10. Booking bisa dibatalkan melalui `PATCH /api/bookings/:id/cancel`; slot kembali `available`.

## Perhitungan Slot Waktu

Table `time_slots` menyimpan slot aktual yang bisa dibooking. Kolom penting:

- `provider_id`: penyedia layanan.
- `service_id`: layanan yang tersedia pada slot tersebut.
- `slot_date`: tanggal slot.
- `start_time` dan `end_time`: jam mulai dan selesai.
- `capacity`: jumlah maksimal booking aktif pada slot yang sama.
- `status`: `available`, `booked`, atau `blocked`.

Saat customer booking memakai `slot_id`, sistem menghitung jumlah booking aktif pada slot tersebut dengan status `pending` atau `confirmed`. Jika jumlahnya sudah sama dengan atau lebih besar dari `capacity`, booking ditolak dengan pesan `Slot waktu sudah penuh`.

Contoh:

```text
time_slots.id = 1
start_time = 09:00
end_time = 10:00
capacity = 1
active_bookings = 1
```

Request booking berikutnya ke `slot_id = 1` akan ditolak.

## Jadwal Layanan

Table `service_schedules` menyimpan jadwal kerja provider untuk layanan tertentu. Kolom penting:

- `provider_id`: penyedia layanan.
- `service_id`: layanan yang dijadwalkan.
- `day`: hari dalam bentuk `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, atau `sunday`.
- `start_time` dan `end_time`: jam mulai dan selesai.
- `is_available`: apakah jadwal tersebut aktif tersedia.

Jika database lama masih memakai kolom `day_of_week` dan muncul error `Unknown column 'service_schedules.day'`, jalankan file SQL:

```text
database/migrate_service_schedules_day.sql
```

Endpoint CRUD jadwal layanan:

```text
POST   /api/schedules
GET    /api/schedules
GET    /api/schedules/:id
PUT    /api/schedules/:id
DELETE /api/schedules/:id
```

## Dynamic pricing

Pricing dihitung di `src/utils/pricing.js`:

- Base price dari `services.price`.
- Weekend surcharge 20% untuk Sabtu dan Minggu.
- Peak hour surcharge 15% untuk jam 17:00 sampai sebelum 21:00.
- Demand surcharge 10% jika booking aktif di hari yang sama minimal 5.
- High demand surcharge 20% jika booking aktif di hari yang sama minimal 10.

Response booking mengembalikan `pricing.breakdown` agar perhitungan bisa dilihat.

## Catatan setup database

Project memakai `sequelize.sync()` di `src/app.js`, sehingga tabel dari model akan dibuat otomatis saat server berjalan. Untuk setup manual, jalankan isi `database/schema.sql` di MySQL pada database `booking_db`.

Jika database lama sudah terlanjur punya tabel dan ingin Sequelize menyesuaikan kolom baru saat development, tambahkan:

```text
DB_SYNC_ALTER=true
```

Pastikan `.env` berisi:

```text
DB_NAME=booking_db
DB_USER=root
DB_PASS=
DB_HOST=localhost
JWT_SECRET=secret_yang_kuat
```
