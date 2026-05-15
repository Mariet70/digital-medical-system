import express from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// SEND MESSAGE
router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const { receiver_user_id, message } = req.body;

      if (!receiver_user_id || !message) {
        return res.status(400).json({
          message: "Receiver and message are required",
        });
      }

      const newMessage = await pool.query(
        `
        INSERT INTO messages
        (
          sender_user_id,
          receiver_user_id,
          message
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [
          req.user.id,
          receiver_user_id,
          message
        ]
      );

      res.status(201).json({
        message: "Message sent successfully",
        message_data: newMessage.rows[0],
      });

    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
      res.status(500).json({
        message: "Failed to send message",
        error: error.message,
      });
    }
  }
);

// GET CONVERSATION
router.get(
  "/:conversation_user_id",
  authMiddleware,
  async (req, res) => {
    try {
      const { conversation_user_id } = req.params;

      const messages = await pool.query(
        `
        SELECT *
        FROM messages
        WHERE
          (sender_user_id = $1 AND receiver_user_id = $2)
          OR
          (sender_user_id = $2 AND receiver_user_id = $1)
        ORDER BY sent_at ASC
        `,
        [
          req.user.id,
          conversation_user_id
        ]
      );

      res.json({
        message: "Conversation retrieved successfully",
        messages: messages.rows,
      });

    } catch (error) {
      console.error("GET CONVERSATION ERROR:", error);
      res.status(500).json({
        message: "Failed to retrieve conversation",
        error: error.message,
      });
    }
  }
);

export default router;