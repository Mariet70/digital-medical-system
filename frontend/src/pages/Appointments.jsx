import { useEffect, useState } from "react";
import api from "../api/axios";

function Appointments() {
  const [appointments, setAppointments] = useState([]);

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const endpoint =
        role === "doctor"
          ? "/appointments/doctor"
          : "/appointments";

      const response = await api.get(endpoint);

      setAppointments(response.data.appointments);

    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}`, {
        status,
      });

      fetchAppointments();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="card">
      <h2>Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        appointments.map((appt) => (
          <div
            key={appt.id}
            className="card"
          >
            <p>
              <strong>Date:</strong>{" "}
              {new Date(appt.appointment_date).toLocaleDateString()}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {appt.appointment_time}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {appt.consultation_type}
            </p>

            <p>
              <strong>Reason:</strong>{" "}
              {appt.reason_for_visit}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {appt.status}
            </p>

            {role === "doctor" && (
              <div>
                <button
                  onClick={() =>
                    updateStatus(appt.id, "confirmed")
                  }
                >
                  Confirm
                </button>

                <button
                  onClick={() =>
                    updateStatus(appt.id, "completed")
                  }
                >
                  Complete
                </button>

                <button
                  onClick={() =>
                    updateStatus(appt.id, "cancelled")
                  }
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Appointments;