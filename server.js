require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const port = Number(process.env.PORT) || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "turbat_gis",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres"
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/db-status", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database_name, PostGIS_Full_Version() AS postgis_version"
    );

    res.json({
      status: "connected",
      database: result.rows[0].database_name,
      postgis: result.rows[0].postgis_version
    });
  } catch (error) {
    console.error("Database check failed:", error.message);
    res.status(503).json({ status: "not connected", error: "PostgreSQL/PostGIS is not ready." });
  }
});

app.get("/api/facilities", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        facility_name,
        facility_type,
        district,
        locality,
        address_text,
        source_note,
        source_url,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM turbat_facilities
      ORDER BY id;
    `);

    const features = result.rows.map((row) => ({
      type: "Feature",
      geometry: row.geometry,
      properties: {
        id: row.id,
        facility_name: row.facility_name,
        facility_type: row.facility_type,
        district: row.district,
        locality: row.locality,
        address_text: row.address_text,
        source_note: row.source_note,
        source_url: row.source_url
      }
    }));

    res.json({ type: "FeatureCollection", features });
  } catch (error) {
    console.error("Facility query failed:", error.message);
    res.status(503).json({ error: "Could not load facilities. Check the database setup." });
  }
});

app.listen(port, () => {
  console.log(`Turbat facilities app listening on port ${port}`);
});
