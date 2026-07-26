USE booking_db;

-- Migrasi service_schedules dari struktur lama:
-- day_of_week INT, is_active BOOLEAN
-- ke struktur baru:
-- day ENUM('monday', ...), is_available BOOLEAN

ALTER TABLE service_schedules
ADD COLUMN IF NOT EXISTS day ENUM(
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
) NULL AFTER service_id;

ALTER TABLE service_schedules
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE AFTER end_time;

UPDATE service_schedules
SET day = CASE day_of_week
  WHEN 0 THEN 'sunday'
  WHEN 1 THEN 'monday'
  WHEN 2 THEN 'tuesday'
  WHEN 3 THEN 'wednesday'
  WHEN 4 THEN 'thursday'
  WHEN 5 THEN 'friday'
  WHEN 6 THEN 'saturday'
  ELSE 'monday'
END
WHERE day IS NULL;

UPDATE service_schedules
SET is_available = is_active
WHERE is_available IS NULL;

ALTER TABLE service_schedules
MODIFY COLUMN day ENUM(
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
) NOT NULL;

ALTER TABLE service_schedules
MODIFY COLUMN is_available BOOLEAN DEFAULT TRUE;

ALTER TABLE service_schedules
DROP COLUMN IF EXISTS day_of_week;

ALTER TABLE service_schedules
DROP COLUMN IF EXISTS is_active;
