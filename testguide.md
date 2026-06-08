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

### Logout

Role: `admin`, `provider`, atau `customer`

Method: `POST`

URL:

```text
{{base_url}}/api/auth/logout
```

Headers:

```text
Authorization: Bearer {{customer_token}}
```

Setelah logout, token yang sama tidak bisa dipakai lagi ke endpoint yang butuh login. Untuk admin/provider, ganti token header menjadi `{{admin_token}}` atau `{{provider_token}}`.

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

### Create provider

Role: `admin`

Method: `POST`

URL:

```text
{{base_url}}/api/providers
```

Headers:

```text
Authorization: Bearer {{admin_token}}
```

Body:

```json
{
  "name": "Provider Baru",
  "email": "providerbaru@example.com",
  "password": "password123"
}
```

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

### Profil provider login

Role: `provider`

Method: `GET`

URL:

```text
{{base_url}}/api/providers/me
```

Headers:

```text
Authorization: Bearer {{provider_token}}
```

### Update profil provider login

Role: `provider`

Method: `PUT`

URL:

```text
{{base_url}}/api/providers/me
```

Headers:

```text
Authorization: Bearer {{provider_token}}
```

Body:

```json
{
  "name": "Provider Update",
  "email": "providerupdate@example.com",
  "password": "passwordbaru123"
}
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

### Update provider by admin

Role: `admin`

Method: `PUT`

URL:

```text
{{base_url}}/api/providers/2
```

Headers:

```text
Authorization: Bearer {{admin_token}}
```

Body:

```json
{
  "name": "Provider Admin Update",
  "email": "provideradminupdate@example.com"
}
```

### Delete provider by admin

Role: `admin`

Method: `DELETE`

URL:

```text
{{base_url}}/api/providers/2
```

Headers:

```text
Authorization: Bearer {{admin_token}}
```

Catatan: provider tidak bisa dihapus jika masih punya booking aktif dengan status `pending` atau `confirmed`.

## 5. Services

Catatan: `category_id` dan `provider_id` harus sudah ada sebelum membuat service. Jika category kosong atau provider kosong, API akan menolak create service.

Untuk admin, `provider_id` wajib dikirim dan harus mengarah ke user dengan role `provider`. Untuk provider login, `provider_id` otomatis memakai ID dari token provider.

Contoh SQL:

```sql
INSERT INTO categories (name, createdAt, updatedAt)
VALUES ('Kecantikan', NOW(), NOW());
```

Pastikan provider sudah dibuat dari endpoint:

```text
POST {{base_url}}/api/providers
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

`day` memakai format:

```text
monday, tuesday, wednesday, thursday, friday, saturday, sunday
```

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
  "day": "monday",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "is_available": true
}
```

Jika admin ingin menentukan provider:

```json
{
  "provider_id": 2,
  "service_id": 1,
  "day": "monday",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "is_available": true
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
{{base_url}}/api/schedules?day=monday
{{base_url}}/api/schedules?is_available=true
```

### Detail schedule

Method: `GET`

URL:

```text
{{base_url}}/api/schedules/1
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
  "is_available": true
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
  "end_time": "2026-05-18T10:00:00.000Z",
  "capacity": 1
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
  "status": "available",
  "capacity": 2
}
```

`capacity` adalah jumlah maksimal booking aktif untuk slot tersebut. Jika `capacity` bernilai `1`, maka hanya satu customer yang bisa booking pada jam itu. Jika `capacity` bernilai `2`, maksimal dua booking aktif boleh masuk pada slot yang sama.

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

### List slot tersedia

Method: `GET`

URL:

```text
{{base_url}}/api/slots/available
```

Filter opsional:

```text
{{base_url}}/api/slots/available?provider_id=2
{{base_url}}/api/slots/available?service_id=1
{{base_url}}/api/slots/available?slot_date=2026-05-18
```

Endpoint ini hanya mengembalikan slot dengan `status = available`, belum penuh, dan `remaining_capacity > 0`.

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

## 8A. Pricing

### Calculate pricing

Method: `POST`

URL:

```text
{{base_url}}/api/pricing/calculate
```

Body:

```json
{
  "service_id": 1,
  "provider_id": 2,
  "start_time": "2026-05-18T17:00:00.000Z"
}
```

Response berisi `base_price`, `total_price`, `demand_count`, dan `breakdown`.

### List pricing rules

Role: `admin`

Method: `GET`

URL:

```text
{{base_url}}/api/pricing/rules
```

Headers:

```text
Authorization: Bearer {{admin_token}}
```

Jika table `pricing_rules` kosong, response tetap menampilkan `defaults_used_when_empty`.

### Create pricing rule

Role: `admin`

Method: `POST`

URL:

```text
{{base_url}}/api/pricing/rules
```

Headers:

```text
Authorization: Bearer {{admin_token}}
```

Contoh weekend:

```json
{
  "name": "Weekend surcharge",
  "rule_type": "weekend",
  "adjustment_type": "percentage",
  "adjustment_value": 20,
  "conditions": {
    "days": [0, 6]
  },
  "is_active": true
}
```

Contoh peak hour:

```json
{
  "name": "Peak hour 17-21",
  "rule_type": "peak_hour",
  "adjustment_type": "percentage",
  "adjustment_value": 15,
  "conditions": {
    "start_hour": 17,
    "end_hour": 21
  },
  "is_active": true
}
```

Contoh demand:

```json
{
  "name": "Demand minimal 5 booking",
  "rule_type": "demand",
  "adjustment_type": "percentage",
  "adjustment_value": 10,
  "conditions": {
    "min_bookings": 5,
    "max_bookings": 9
  },
  "is_active": true
}
```

`rule_type` yang valid:

```text
weekend, peak_hour, demand
```

`adjustment_type` yang valid:

```text
percentage, fixed
```

### Update pricing rule

Role: `admin`

Method: `PUT`

URL:

```text
{{base_url}}/api/pricing/rules/1
```

Headers:

```text
Authorization: Bearer {{admin_token}}
```

Body:

```json
{
  "adjustment_value": 25,
  "is_active": true
}
```

### Check availability memakai slot

Method: `POST`

URL:

```text
{{base_url}}/api/bookings/check-availability
```

Body:

```json
{
  "service_id": 1,
  "slot_id": 1
}
```

Response jika tersedia:

```json
{
  "message": "Hasil pengecekan ketersediaan booking",
  "data": {
    "available": true,
    "reason": "Slot tersedia",
    "service_id": 1,
    "provider_id": 2,
    "slot_id": 1,
    "capacity": 1,
    "active_bookings": 0,
    "remaining_capacity": 1
  }
}
```

Response jika penuh:

```json
{
  "message": "Hasil pengecekan ketersediaan booking",
  "data": {
    "available": false,
    "reason": "Slot waktu sudah penuh",
    "slot_id": 1,
    "capacity": 1,
    "active_bookings": 1,
    "remaining_capacity": 0
  }
}
```

### Check availability tanpa slot

Method: `GET`

URL:

```text
{{base_url}}/api/bookings/check-availability?service_id=1&provider_id=2&start_time=2026-05-18T11:00:00.000Z
```

Jika `end_time` tidak dikirim, sistem memakai `duration` dari service.

Dengan `end_time` manual:

```text
{{base_url}}/api/bookings/check-availability?service_id=1&provider_id=2&start_time=2026-05-18T11:00:00.000Z&end_time=2026-05-18T12:00:00.000Z
```

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

Jika slot sudah penuh, response akan seperti ini:

```json
{
  "message": "Slot waktu sudah penuh",
  "data": {
    "slot_id": 1,
    "capacity": 1,
    "active_bookings": 1
  }
}
```

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

Method yang valid:

```text
cash, transfer, ewallet, card
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

### Detail payment

Role: customer pemilik booking, provider pemilik booking, atau admin

Method: `GET`

URL:

```text
{{base_url}}/api/payments/1
```

Headers:

```text
Authorization: Bearer {{customer_token}}
```

### Refund payment

Role: `admin` atau provider pemilik booking

Method: `PATCH`

URL:

```text
{{base_url}}/api/payments/1/refund
```

Headers:

```text
Authorization: Bearer {{admin_token}}
```

Body:

```json
{
  "reason": "Customer meminta refund"
}
```

Jika refund berhasil:

- Payment berubah menjadi `refunded`.
- Booking berubah menjadi `cancelled`, kecuali booking sudah `completed`.
- `payment_status` booking menjadi `refunded`.

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
