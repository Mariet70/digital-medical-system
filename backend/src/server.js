process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import pkg from "pg";

const { Pool } = pkg;


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // fixes self-signed cert error
  },
});

const app = express();


console.log("DATABASE_URL:", process.env.DATABASE_URL);


(async () => {
  try {
    const client = await pool.connect();
    console.log(" Connected to Supabase");
    client.release();
  } catch (err) {
    console.error(" DB CONNECTION ERROR:", err);
  }
})();


app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`DB Connected: ${result.rows[0].now}`);
  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).send("Database connection failed");
  }
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});