CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS turbat_facilities (
    id SERIAL PRIMARY KEY,
    facility_name TEXT NOT NULL,
    facility_type VARCHAR(30) NOT NULL CHECK (facility_type IN ('School', 'Book Shop')),
    district VARCHAR(80) NOT NULL,
    locality VARCHAR(120) NOT NULL,
    address_text TEXT NOT NULL,
    source_note TEXT NOT NULL,
    source_url TEXT,
    geom GEOMETRY(Point, 4326) NOT NULL
);

ALTER TABLE turbat_facilities
    ADD COLUMN IF NOT EXISTS source_url TEXT;

CREATE INDEX IF NOT EXISTS idx_turbat_facilities_geom
    ON turbat_facilities USING GIST (geom);
