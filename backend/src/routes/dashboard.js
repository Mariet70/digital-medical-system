import express from "express";
import pool from "../db.js";
import {
  authMiddleware,
  doctorOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

// DOCTOR DASHBOARD 
router.get(
  "/doctor",
  authMiddleware,
  doctorOnly,
  async (req, res) => {
    try {
      const doctorResult = await pool.query(
        "SELECT id FROM doctors WHERE user_id = $1",
        [req.user.id]
      );

      if (doctorResult.rows.length === 0) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      const doctor_id = doctorResult.rows[0].id;

      const totalAppointments = await pool.query(
        "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1",
        [doctor_id]
      );

      const pendingAppointments = await pool.query(
        "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'pending'",
        [doctor_id]
      );

      const confirmedAppointments = await pool.query(
        "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'confirmed'",
        [doctor_id]
      );

      const completedAppointments = await pool.query(
        "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'completed'",
        [doctor_id]
      );

      const unreadAlerts = await pool.query(
        "SELECT COUNT(*) FROM doctor_alerts WHERE doctor_id = $1 AND is_read = false",
        [doctor_id]
      );

      const totalMedicalRecords = await pool.query(
        "SELECT COUNT(*) FROM medical_records WHERE doctor_id = $1",
        [doctor_id]
      );

      const totalPrescriptions = await pool.query(
        "SELECT COUNT(*) FROM prescriptions WHERE doctor_id = $1",
        [doctor_id]
      );

      res.json({
        message: "Doctor dashboard retrieved successfully",
        dashboard: {
          total_appointments: Number(totalAppointments.rows[0].count),
          pending_appointments: Number(pendingAppointments.rows[0].count),
          confirmed_appointments: Number(confirmedAppointments.rows[0].count),
          completed_appointments: Number(completedAppointments.rows[0].count),
          unread_alerts: Number(unreadAlerts.rows[0].count),
          total_medical_records: Number(totalMedicalRecords.rows[0].count),
          total_prescriptions: Number(totalPrescriptions.rows[0].count)
        }
      });

    } catch (error) {
      console.error("DOCTOR DASHBOARD ERROR:", error);
      res.status(500).json({
        message: "Failed to retrieve dashboard",
        error: error.message,
      });
    }
  }
);

export default router;