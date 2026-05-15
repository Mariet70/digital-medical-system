import express from "express";
import pool from "../db.js";
import {
  authMiddleware,
  patientOnly,
  doctorOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

// DOCTOR CREATES PRESCRIPTION
router.post(
  "/",
  authMiddleware,
  doctorOnly,
  async (req, res) => {
    try {
      const {
        patient_id,
        medical_record_id,
        medication_name,
        dosage,
        duration,
        instructions
      } = req.body;

      if (!patient_id || !medication_name || !dosage) {
        return res.status(400).json({
          message: "Patient ID, medication name, and dosage are required",
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

      const newPrescription = await pool.query(
        `
        INSERT INTO prescriptions
        (
          patient_id,
          doctor_id,
          medical_record_id,
          medication_name,
          dosage,
          duration,
          instructions
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          patient_id,
          doctor_id,
          medical_record_id || null,
          medication_name,
          dosage,
          duration || null,
          instructions || null
        ]
      );

      res.status(201).json({
        message: "Prescription created successfully",
        prescription: newPrescription.rows[0],
      });

    } catch (error) {
      console.error("CREATE PRESCRIPTION ERROR:", error);
      res.status(500).json({
        message: "Failed to create prescription",
        error: error.message,
      });
    }
  }
);

// PATIENT VIEWS OWN PRESCRIPTIONS
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

      const prescriptions = await pool.query(
        `
        SELECT *
        FROM prescriptions
        WHERE patient_id = $1
        ORDER BY prescribed_at DESC
        `,
        [patient_id]
      );

      res.json({
        message: "Prescriptions retrieved successfully",
        prescriptions: prescriptions.rows,
      });

    } catch (error) {
      console.error("GET PRESCRIPTIONS ERROR:", error);
      res.status(500).json({
        message: "Failed to retrieve prescriptions",
        error: error.message,
      });
    }
  }
);

export default router;