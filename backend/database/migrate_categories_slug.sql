USE booking_db;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NULL AFTER name;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS description TEXT NULL AFTER slug;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL AFTER description;

UPDATE categories
SET slug = LOWER(
  TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9 ]', ''),
      '[[:space:]]+',
      '-'
    )
  )
)
WHERE slug IS NULL;

ALTER TABLE categories
ADD UNIQUE KEY categories_slug_unique (slug);
