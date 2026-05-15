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
      const highRiskKeywords = [
  "chest pain",
  "difficulty breathing",
  "severe bleeding",
  "stroke",
  "suicidal",
  "unconscious",
  "high fever",
  "seizure"
];

const isHighRisk = reason
  ? highRiskKeywords.some(keyword =>
      reason.toLowerCase().includes(keyword)
    )
  : false;

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
if (isHighRisk) {
  await pool.query(
    `
    INSERT INTO doctor_alerts
    (
      doctor_id,
      patient_id,
      appointment_id,
      alert_type,
      alert_message,
      severity
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      doctor_id,
      patient_id,
      newAppointment.rows[0].id,
      "high_risk_symptom",
      "URGENT: High-risk patient case detected",
      "high"
    ]
  );
}
      res.status(201).json({
  message: isHighRisk
    ? "Appointment booked successfully - HIGH RISK ALERT"
    : "Appointment booked successfully",
  appointment: newAppointment.rows[0],
  high_risk: isHighRisk,
  alert_message: isHighRisk
    ? "URGENT: High-risk patient case detected"
    : null
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
router.get(
  "/",
  authMiddleware,
  patientOnly,
  async (req, res) => {
    try {
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

      const appointments = await pool.query(
        `
        SELECT *
        FROM appointments
        WHERE patient_id = $1
        ORDER BY appointment_date ASC, appointment_time ASC
        `,
        [patient_id]
      );

      res.json({
        message: "Appointments retrieved successfully",
        appointments: appointments.rows,
      });

    } catch (error) {
      console.error("GET APPOINTMENTS ERROR:", error);
      res.status(500).json({
        message: "Failed to retrieve appointments",
        error: error.message,
      });
    }
  }
);
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

      const appointments = await pool.query(
        `
        SELECT *
        FROM appointments
        WHERE doctor_id = $1
        ORDER BY appointment_date ASC, appointment_time ASC
        `,
        [doctor_id]
      );

      res.json({
        message: "Doctor appointments retrieved successfully",
        appointments: appointments.rows,
      });

    } catch (error) {
      console.error("DOCTOR APPOINTMENTS ERROR:", error);
      res.status(500).json({
        message: "Failed to retrieve doctor appointments",
        error: error.message,
      });
    }
  }
);
router.patch(
  "/:id",
  authMiddleware,
  doctorOnly,
  async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      const allowedStatuses = [
        "confirmed",
        "cancelled",
        "completed"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid appointment status",
        });
      }

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

      const appointmentCheck = await pool.query(
        `
        SELECT *
        FROM appointments
        WHERE id = $1 AND doctor_id = $2
        `,
        [id, doctor_id]
      );

      if (appointmentCheck.rows.length === 0) {
        return res.status(404).json({
          message: "Appointment not found or unauthorized",
        });
      }

      const updatedAppointment = await pool.query(
        `
        UPDATE appointments
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, id]
      );

      res.json({
        message: "Appointment updated successfully",
        appointment: updatedAppointment.rows[0],
      });

    } catch (error) {
      console.error("UPDATE APPOINTMENT ERROR:", error);
      res.status(500).json({
        message: "Failed to update appointment",
        error: error.message,
      });
    }
  }
);
router.get(
  "/alerts",
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

      const alerts = await pool.query(
        `
        SELECT *
        FROM doctor_alerts
        WHERE doctor_id = $1
        ORDER BY created_at DESC
        `,
        [doctor_id]
      );

      res.json({
        message: "Doctor alerts retrieved successfully",
        alerts: alerts.rows,
      });

    } catch (error) {
      console.error("GET ALERTS ERROR:", error);
      res.status(500).json({
        message: "Failed to retrieve alerts",
        error: error.message,
      });
    }
  }
);
export default router;