# Test Guide API Booking App di Postman

Base URL:

```text
http://localhost:3000
```

Header untuk endpoint yang butuh login:

```text
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

Token didapat dari response `POST /api/auth/login`.

## 1. Jalankan server

```bash
npm run dev
```

Atau:

```bash
npm start
```

Jika database lama perlu mengikuti kolom baru saat development, tambahkan ini di `.env`:

```text
DB_SYNC_ALTER=true
```

## 2. Auth

### Register customer

Method: `POST`

URL:

```text
{{base_url}}/api/auth/register
```

Body:

```json
{
  "name": "Customer Satu",
  "email": "customer@example.com",
  "password": "password123",
  "role": "customer"
}
```

### Register provider

Method: `POST`

URL:

```text
{{base_url}}/api/auth/register
```

Body:

```json
{
  "name": "Provider Satu",
  "email": "provider@example.com",
  "password": "password123",
  "role": "provider"
}
```

### Register admin

Method: `POST`

URL:

```text
{{base_url}}/api/auth/register
```

Body:

```json
{
  "name": "Admin Satu",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Login

Method: `POST`

URL:

```text
{{base_url}}/api/auth/login
```

Body:

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

Simpan `token` dari response ke variable Postman, misalnya `customer_token`.

### Profile

Method: `GET`

URL:

```text
{{base_url}}/api/auth/profile
```

Headers:

```text
Authorization: Bearer {{customer_token}}
```

## 3. Users

### List semua user

Role: `admin`

Method: `GET`

URL:

```text
{{base_url}}/api/users
```

Headers:

```text
Authorization: Bearer {{admin_token}}
```

### Detail user

Role: `admin` atau user pemilik data

Method: `GET`

URL:

```text
{{base_url}}/api/users/1
```

### Update user

Role: `admin`

Method: `PUT`

URL:

```text
{{base_url}}/api/users/1
```

Body:

```json
{
  "name": "Provider Update",
  "role": "provider"
}
```

### Delete user

Role: `admin`

Method: `DELETE`

URL:

```text
{{base_url}}/api/users/1
```

## 4. Provider

### List provider

Method: `GET`

URL:

```text
{{base_url}}/api/providers
```

### Detail provider

Method: `GET`

URL:

```text
{{base_url}}/api/providers/2
```

### List layanan milik provider login

Role: `provider`

Method: `GET`

URL:

```text
{{base_url}}/api/providers/me/services
```

Headers:

```text
Authorization: Bearer {{provider_token}}
```

## 5. Services

Catatan: `category_id` harus sudah ada di tabel `categories`. Jika belum ada endpoint category, buat data category langsung dari database terlebih dahulu.

Contoh SQL:

```sql
INSERT INTO categories (name, createdAt, updatedAt)
VALUES ('Kecantikan', NOW(), NOW());
```

### Create service

Role: `admin` atau `provider`

Method: `POST`

URL:

```text
{{base_url}}/api/services
```

Headers:

```text
Authorization: Bearer {{provider_token}}
```

Body:

```json
{
  "category_id": 1,
  "name": "Hair Spa",
  "slug": "hair-spa",
  "description": "Perawatan rambut lengkap",
  "price": 150000,
  "duration": 60,
  "image_url": "https://example.com/hair-spa.jpg"
}
```

Jika admin ingin menentukan provider:

```json
{
  "category_id": 1,
  "provider_id": 2,
  "name": "Makeup Party",
  "slug": "makeup-party",
  "description": "Makeup untuk acara pesta",
  "price": 300000,
  "duration": 90,
  "image_url": "https://example.com/makeup.jpg"
}
```

### List services

Method: `GET`

URL:

```text
{{base_url}}/api/services
```

Filter opsional:

```text
{{base_url}}/api/services?provider_id=2
{{base_url}}/api/services?category_id=1
```

### Detail service

Method: `GET`

URL:

```text
{{base_url}}/api/services/1
```

### Update service

Role: `admin` atau provider pemilik layanan

Method: `PUT`

URL:

```text
{{base_url}}/api/services/1
```

Body:

```json
{
  "name": "Hair Spa Premium",
  "price": 180000,
  "duration": 75,
  "is_active": true
}
```

### Delete service

Role: `admin`

Method: `DELETE`

URL:

```text
{{base_url}}/api/services/1
```

## 6. Jadwal Layanan

`day_of_week` memakai format:

- `0`: Minggu
- `1`: Senin
- `2`: Selasa
- `3`: Rabu
- `4`: Kamis
- `5`: Jumat
- `6`: Sabtu

### Create schedule

Role: `admin` atau `provider`

Method: `POST`

URL:

```text
{{base_url}}/api/schedules
```

Headers:

```text
Authorization: Bearer {{provider_token}}
```

Body:

```json
{
  "service_id": 1,
  "day_of_week": 1,
  "start_time": "09:00:00",
  "end_time": "17:00:00"
}
```

Jika admin ingin menentukan provider:

```json
{
  "provider_id": 2,
  "service_id": 1,
  "day_of_week": 1,
  "start_time": "09:00:00",
  "end_time": "17:00:00"
}
```

### List schedule

Method: `GET`

URL:

```text
{{base_url}}/api/schedules
```

Filter opsional:

```text
{{base_url}}/api/schedules?provider_id=2
{{base_url}}/api/schedules?service_id=1
```

### Update schedule

Role: `admin` atau provider pemilik jadwal

Method: `PUT`

URL:

```text
{{base_url}}/api/schedules/1
```

Body:

```json
{
  "start_time": "10:00:00",
  "end_time": "18:00:00",
  "is_active": true
}
```

### Delete schedule

Role: `admin` atau provider pemilik jadwal

Method: `DELETE`

URL:

```text
{{base_url}}/api/schedules/1
```

## 7. Slot Waktu

### Create slot

Role: `admin` atau `provider`

Method: `POST`

URL:

```text
{{base_url}}/api/slots
```

Headers:

```text
Authorization: Bearer {{provider_token}}
```

Body:

```json
{
  "service_id": 1,
  "slot_date": "2026-05-18",
  "start_time": "2026-05-18T09:00:00.000Z",
  "end_time": "2026-05-18T10:00:00.000Z"
}
```

Jika admin ingin menentukan provider:

```json
{
  "provider_id": 2,
  "service_id": 1,
  "slot_date": "2026-05-18",
  "start_time": "2026-05-18T09:00:00.000Z",
  "end_time": "2026-05-18T10:00:00.000Z",
  "status": "available"
}
```

### List slot

Method: `GET`

URL:

```text
{{base_url}}/api/slots
```

Filter opsional:

```text
{{base_url}}/api/slots?provider_id=2
{{base_url}}/api/slots?service_id=1
{{base_url}}/api/slots?slot_date=2026-05-18
{{base_url}}/api/slots?status=available
```

### Update slot

Role: `admin` atau provider pemilik slot

Method: `PUT`

URL:

```text
{{base_url}}/api/slots/1
```

Body:

```json
{
  "status": "blocked"
}
```

### Block slot

Role: `admin` atau provider pemilik slot

Method: `DELETE`

URL:

```text
{{base_url}}/api/slots/1
```

## 8. Booking

### Create booking memakai slot

Role: `customer`

Method: `POST`

URL:

```text
{{base_url}}/api/bookings
```

Headers:

```text
Authorization: Bearer {{customer_token}}
```

Body:

```json
{
  "service_id": 1,
  "slot_id": 1
}
```

Response akan mengembalikan data booking dan breakdown dynamic pricing.

### Create booking tanpa slot

Role: `customer`

Method: `POST`

URL:

```text
{{base_url}}/api/bookings
```

Body:

```json
{
  "service_id": 1,
  "provider_id": 2,
  "start_time": "2026-05-18T11:00:00.000Z"
}
```

Jika `end_time` tidak dikirim, sistem memakai `duration` dari service.

Dengan `end_time` manual:

```json
{
  "service_id": 1,
  "provider_id": 2,
  "start_time": "2026-05-18T11:00:00.000Z",
  "end_time": "2026-05-18T12:00:00.000Z"
}
```

### Test validasi slot bentrok

Kirim request booking kedua dengan `provider_id`, `service_id`, dan waktu yang overlap dengan booking aktif sebelumnya.

Contoh:

```json
{
  "service_id": 1,
  "provider_id": 2,
  "start_time": "2026-05-18T11:30:00.000Z",
  "end_time": "2026-05-18T12:30:00.000Z"
}
```

Expected response:

```json
{
  "message": "Slot waktu bentrok dengan booking lain"
}
```

### Histori booking

Role:

- `customer`: hanya booking miliknya.
- `provider`: booking untuk provider tersebut.
- `admin`: semua booking.

Method: `GET`

URL:

```text
{{base_url}}/api/bookings
```

Filter status:

```text
{{base_url}}/api/bookings?status=pending
{{base_url}}/api/bookings?status=confirmed
{{base_url}}/api/bookings?status=completed
{{base_url}}/api/bookings?status=cancelled
```

### Detail booking

Method: `GET`

URL:

```text
{{base_url}}/api/bookings/1
```

### Update status booking

Role: `admin` atau provider pemilik booking

Method: `PUT`

URL:

```text
{{base_url}}/api/bookings/1
```

Body:

```json
{
  "status": "completed"
}
```

Status yang valid:

```text
pending, confirmed, completed, cancelled
```

### Cancel booking

Role: customer pemilik booking, provider pemilik booking, atau admin

Method: `PATCH`

URL:

```text
{{base_url}}/api/bookings/1/cancel
```

Body:

```json
{
  "reason": "Customer membatalkan jadwal"
}
```

Alternatif:

Method: `DELETE`

URL:

```text
{{base_url}}/api/bookings/1
```

## 9. Simulasi Pembayaran

### Payment success

Role: customer pemilik booking, provider pemilik booking, atau admin

Method: `POST`

URL:

```text
{{base_url}}/api/payments/simulate
```

Headers:

```text
Authorization: Bearer {{customer_token}}
```

Body:

```json
{
  "booking_id": 1,
  "method": "transfer"
}
```

Jika sukses:

- Payment dibuat dengan status `paid`.
- Booking berubah menjadi `confirmed` jika sebelumnya `pending`.
- `payment_status` booking menjadi `paid`.

### Payment failed

Method: `POST`

URL:

```text
{{base_url}}/api/payments/simulate
```

Body:

```json
{
  "booking_id": 1,
  "method": "ewallet",
  "force_status": "failed"
}
```

### List payments

Role:

- `admin`: semua payment.
- `customer`: payment booking miliknya.
- `provider`: payment booking milik provider tersebut.

Method: `GET`

URL:

```text
{{base_url}}/api/payments
```

## 10. Dashboard

### Dashboard admin

Role: `admin`

Method: `GET`

URL:

```text
{{base_url}}/api/dashboard
```

Headers:

```text
Authorization: Bearer {{admin_token}}
```

Response berisi:

- Total users.
- Total customers.
- Total providers.
- Total services.
- Total bookings.
- Breakdown status booking.
- Total revenue dari booking `completed` dan `paid`.
- Top services.

### Dashboard provider

Role: `provider`

Method: `GET`

URL:

```text
{{base_url}}/api/dashboard
```

Headers:

```text
Authorization: Bearer {{provider_token}}
```

Response berisi statistik booking, service, revenue, dan top services milik provider login.

## 11. Urutan testing yang disarankan

1. Register admin, provider, dan customer.
2. Login masing-masing user, simpan token.
3. Buat category langsung dari database.
4. Login provider, buat service.
5. Buat schedule untuk service.
6. Buat slot waktu.
7. Login customer, buat booking memakai `slot_id`.
8. Test booking kedua pada slot atau waktu yang sama untuk memastikan validasi bentrok berjalan.
9. Simulasikan pembayaran sukses.
10. Login provider/admin, ubah status booking menjadi `completed`.
11. Cek dashboard.
12. Buat booking baru, lalu test cancel booking.

## 12. Variable Postman yang disarankan

```text
base_url=http://localhost:3000
admin_token=<token admin>
provider_token=<token provider>
customer_token=<token customer>
service_id=1
provider_id=2
slot_id=1
booking_id=1
```

Gunakan variable di URL:

```text
{{base_url}}/api/bookings/{{booking_id}}
```

Gunakan variable di body:

```json
{
  "service_id": {{service_id}},
  "slot_id": {{slot_id}}
}
```
