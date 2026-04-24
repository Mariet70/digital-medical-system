import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


(async () => {
  try {
    const client = await pool.connect();
    console.log(" Connected to Supabase");
    client.release();
  } catch (err) {
    console.error(" DB CONNECTION ERROR:", err);
  }
})();

export default pool;