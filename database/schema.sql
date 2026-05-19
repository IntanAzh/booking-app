CREATE DATABASE IF NOT EXISTS booking_db;
USE booking_db;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer', 'provider') DEFAULT 'customer',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
);

CREATE TABLE IF NOT EXISTS categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY categories_name_unique (name)
);

CREATE TABLE IF NOT EXISTS services (
  id INT NOT NULL AUTO_INCREMENT,
  category_id INT NOT NULL,
  provider_id INT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NULL,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INT NOT NULL,
  image_url VARCHAR(255) NULL,
  is_active TINYINT(1) DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY services_slug_unique (slug),
  KEY services_category_id_idx (category_id),
  KEY services_provider_id_idx (provider_id),
  CONSTRAINT services_category_id_fk FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT services_provider_id_fk FOREIGN KEY (provider_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS service_variants (
  id INT NOT NULL AUTO_INCREMENT,
  service_id INT NOT NULL,
  variant_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY service_variants_service_id_idx (service_id),
  CONSTRAINT service_variants_service_id_fk FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS staff_specialities (
  id INT NOT NULL AUTO_INCREMENT,
  staff_id INT NOT NULL,
  service_id INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY staff_specialities_staff_id_idx (staff_id),
  KEY staff_specialities_service_id_idx (service_id),
  CONSTRAINT staff_specialities_staff_id_fk FOREIGN KEY (staff_id) REFERENCES users(id),
  CONSTRAINT staff_specialities_service_id_fk FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS service_schedules (
  id INT NOT NULL AUTO_INCREMENT,
  provider_id INT NOT NULL,
  service_id INT NOT NULL,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY service_schedules_provider_id_idx (provider_id),
  KEY service_schedules_service_id_idx (service_id),
  CONSTRAINT service_schedules_provider_id_fk FOREIGN KEY (provider_id) REFERENCES users(id),
  CONSTRAINT service_schedules_service_id_fk FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS time_slots (
  id INT NOT NULL AUTO_INCREMENT,
  provider_id INT NOT NULL,
  service_id INT NOT NULL,
  slot_date DATE NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('available', 'booked', 'blocked') DEFAULT 'available',
  capacity INT DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY time_slots_provider_id_idx (provider_id),
  KEY time_slots_service_id_idx (service_id),
  KEY time_slots_slot_date_idx (slot_date),
  CONSTRAINT time_slots_provider_id_fk FOREIGN KEY (provider_id) REFERENCES users(id),
  CONSTRAINT time_slots_service_id_fk FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT NOT NULL AUTO_INCREMENT,
  customer_id INT NOT NULL,
  service_id INT NOT NULL,
  provider_id INT NOT NULL,
  slot_id INT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  buffer_end_time DATETIME NOT NULL,
  total_price DECIMAL(10, 2) NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  cancellation_reason TEXT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY bookings_customer_id_idx (customer_id),
  KEY bookings_provider_id_idx (provider_id),
  KEY bookings_service_id_idx (service_id),
  KEY bookings_slot_id_idx (slot_id),
  CONSTRAINT bookings_customer_id_fk FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT bookings_provider_id_fk FOREIGN KEY (provider_id) REFERENCES users(id),
  CONSTRAINT bookings_service_id_fk FOREIGN KEY (service_id) REFERENCES services(id),
  CONSTRAINT bookings_slot_id_fk FOREIGN KEY (slot_id) REFERENCES time_slots(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method ENUM('cash', 'transfer', 'ewallet', 'card') DEFAULT 'transfer',
  status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  transaction_ref VARCHAR(255) NULL,
  paid_at DATETIME NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY payments_booking_id_idx (booking_id),
  CONSTRAINT payments_booking_id_fk FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
