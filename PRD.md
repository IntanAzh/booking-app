# PRD Booking App

## Ringkasan

Booking App adalah aplikasi pemesanan layanan untuk tiga peran:

- `customer`: melihat layanan, membuat booking, membayar, dan membatalkan booking miliknya.
- `provider`: mengelola kategori, layanan, jadwal, slot, booking masuk, dan pembayaran layanan miliknya.
- `admin`: mengelola user/provider, melihat katalog dan jadwal secara read-only, mengelola booking/payment global, dashboard, dan dynamic pricing.

## Aturan Role

### Customer

- Registrasi publik melalui `/register` atau `POST /api/auth/register`.
- Public register selalu membuat role `customer`.
- Dapat membuat booking, membayar, melihat riwayat, dan membatalkan booking miliknya.

### Provider

- Tidak bisa daftar sendiri dari public register.
- Akun provider dibuat oleh admin melalui menu Providers atau `POST /api/providers`.
- Dapat create/update/delete Categories, Services miliknya sendiri, dan Schedules miliknya sendiri.
- Tidak dapat mengelola service/schedule milik provider lain.

### Admin

- Akun admin dibuat lewat seed/setup internal, bukan public register.
- Dapat mengelola user dan provider.
- Dapat melihat Categories, Services, dan Schedules, tetapi tidak create/update/delete pada modul tersebut.
- Dapat melihat semua booking/payment dan dashboard global.
- Dapat mengelola dynamic pricing rules.

## Katalog dan Jadwal

- Category hanya membutuhkan `name` dari UI.
- `slug` category dibuat otomatis oleh backend dari `name`.
- Service `slug` juga dibuat otomatis dari `name`.
- Provider membuat service dengan `category_id`, `name`, `price`, `duration`, optional `description`, dan optional `image_url`.
- Provider membuat schedule dengan `service_id`, `day`, `start_time`, `end_time`, dan `is_available`.

## Database dan Migrasi

Database fresh dapat dibuat dari `backend/database/schema.sql`.

Database lama perlu migration berikut bila kolom belum ada:

- `backend/database/migrate_service_schedules_day.sql`
- `backend/database/migrate_categories_slug.sql`

## Acceptance Criteria

- Public register menghasilkan user `customer` meskipun body mengirim role lain.
- Admin tidak melihat tombol create/edit/delete di Admin Categories, Services, dan Schedules.
- API `POST/PUT/DELETE /api/categories`, `/api/services`, dan `/api/schedules` menolak token admin dan hanya menerima provider.
- Provider tetap bisa create/edit/delete category, service miliknya, dan schedule miliknya.
- Customer dapat membatalkan booking melalui endpoint cancel khusus sehingga slot/payment status ikut sinkron.
