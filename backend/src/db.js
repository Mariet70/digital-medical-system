import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";

const { Pool } = pkg;

console.log("DB.JS DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;