import express from "express";
import pool from "../db.js";
import {
  authMiddleware,
  patientOnly,
  doctorOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  patientOnly,
  async (req, res) => {
    try {
      const {
        doctor_id,
        appointment_date,
        appointment_time,
        consultation_type,
        reason
      } = req.body;

      if (
        !doctor_id ||
        !appointment_date ||
        !appointment_time ||
        !consultation_type
      ) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      const patientResult = await pool.query(
        "SELECT id FROM patients WHERE user_id = $1",
        [req.user.id]
      );

      if (patientResult.rows.length === 0) {
        return res.status(404).json({
          message: "Patient profile not found",
        });
      }

      const patient_id = patientResult.rows[0].id;

      const newAppointment = await pool.query(
        `
        INSERT INTO appointments
        (
          patient_id,
          doctor_id,
          appointment_date,
          appointment_time,
          consultation_type,
          reason_for_visit,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *
        `,
        [
          patient_id,
          doctor_id,
          appointment_date,
          appointment_time,
          consultation_type,
          reason || null
        ]
      );

      res.status(201).json({
        message: "Appointment booked successfully",
        appointment: newAppointment.rows[0],
      });

    } catch (error) {
      console.error("BOOK APPOINTMENT ERROR:", error);
      res.status(500).json({
        message: "Failed to book appointment",
        error: error.message,
      });
    }
  }
);

export default router;