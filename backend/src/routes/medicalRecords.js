import express from "express";
import pool from "../db.js";
import {
  authMiddleware,
  patientOnly,
  doctorOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

//DOCTOR CREATES MEDICAL RECORD
router.post(
  "/",
  authMiddleware,
  doctorOnly,
  async (req, res) => {
    try {
      const {
        patient_id,
        diagnosis,
        treatment,
        prescription_notes,
        test_results,
        notes
      } = req.body;

      if (!patient_id || !diagnosis) {
        return res.status(400).json({
          message: "Patient ID and diagnosis are required",
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

      const newRecord = await pool.query(
        `
        INSERT INTO medical_records
        (
          patient_id,
          doctor_id,
          diagnosis,
          treatment,
          prescription_notes,
          test_results,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          patient_id,
          doctor_id,
          diagnosis,
          treatment || null,
          prescription_notes || null,
          test_results || null,
          notes || null
        ]
      );

      res.status(201).json({
        message: "Medical record created successfully",
        record: newRecord.rows[0],
      });

    } catch (error) {
      console.error("CREATE MEDICAL RECORD ERROR:", error);
      res.status(500).json({
        message: "Failed to create medical record",
        error: error.message,
      });
    }
  }
);


//PATIENT VIEWS OWN RECORDS
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

      const records = await pool.query(
        `
        SELECT *
        FROM medical_records
        WHERE patient_id = $1
        ORDER BY record_date DESC
        `,
        [patient_id]
      );

      res.json({
        message: "Medical records retrieved successfully",
        records: records.rows,
      });

    } catch (error) {
      console.error("GET MEDICAL RECORDS ERROR:", error);
      res.status(500).json({
        message: "Failed to retrieve medical records",
        error: error.message,
      });
    }
  }
);

export default router;