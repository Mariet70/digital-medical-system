import express from "express";
import pool from "../db.js";
import {
  authMiddleware,
  patientOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

// PATIENT VIEWS OWN PROFILE
router.get(
  "/profile",
  authMiddleware,
  patientOnly,
  async (req, res) => {
    try {
      const patientResult = await pool.query(
        `
        SELECT *
        FROM patients
        WHERE user_id = $1
        `,
        [req.user.id]
      );

      if (patientResult.rows.length === 0) {
        return res.status(404).json({
          message: "Patient profile not found",
        });
      }

      res.json({
        message: "Patient profile retrieved successfully",
        profile: patientResult.rows[0],
      });

    } catch (error) {
      console.error("GET PATIENT PROFILE ERROR:", error);
      res.status(500).json({
        message: "Failed to retrieve patient profile",
        error: error.message,
      });
    }
  }
);

// PATIENT UPDATES OWN PROFILE
router.patch(
  "/profile",
  authMiddleware,
  patientOnly,
  async (req, res) => {
    try {
      const {
        date_of_birth,
        gender,
        blood_group,
        emergency_contact_name,
        emergency_contact_phone,
        medical_history,
        allergies
      } = req.body;

      const updatedProfile = await pool.query(
        `
        UPDATE patients
        SET
          date_of_birth = $1,
          gender = $2,
          blood_group = $3,
          emergency_contact_name = $4,
          emergency_contact_phone = $5,
          medical_history = $6,
          allergies = $7
        WHERE user_id = $8
        RETURNING *
        `,
        [
          date_of_birth || null,
          gender || null,
          blood_group || null,
          emergency_contact_name || null,
          emergency_contact_phone || null,
          medical_history || null,
          allergies || null,
          req.user.id
        ]
      );

      if (updatedProfile.rows.length === 0) {
        return res.status(404).json({
          message: "Patient profile not found",
        });
      }

      res.json({
        message: "Patient profile updated successfully",
        profile: updatedProfile.rows[0],
      });

    } catch (error) {
      console.error("UPDATE PATIENT PROFILE ERROR:", error);
      res.status(500).json({
        message: "Failed to update patient profile",
        error: error.message,
      });
    }
  }
);

export default router;