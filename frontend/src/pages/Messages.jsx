import { useState } from "react";
import api from "../api/axios";

function Messages() {
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/messages", {
        receiver_user_id: receiverId,
        message,
      });

      setStatus(response.data.message);
      setMessage("");

    } catch (error) {
      setStatus(
        error.response?.data?.message || "Failed to send message"
      );
    }
  };

  return (
    <div className="card">
      <h2>Messages</h2>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Receiver User ID"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        />

        <textarea
          placeholder="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button type="submit">Send Message</button>
      </form>

      <p>{status}</p>
    </div>
  );
}

export default Messages;