process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pkg from "pg";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import appointmentRoutes from "./routes/appointments.js";
import medicalRecordsRoutes from "./routes/medicalRecords.js";
import prescriptionsRoutes from "./routes/prescriptions.js";
import patientRoutes from "./routes/patients.js";
import dashboardRoutes from "./routes/dashboard.js";
import messagesRoutes from "./routes/messages.js";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/medical-records", medicalRecordsRoutes);
app.use("/prescriptions", prescriptionsRoutes);
app.use("/patients", patientRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/messages", messagesRoutes);
console.log("DATABASE_URL:", process.env.DATABASE_URL);

(async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to Supabase");
    client.release();
  } catch (err) {
    console.error("DB CONNECTION ERROR:", err);
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

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});