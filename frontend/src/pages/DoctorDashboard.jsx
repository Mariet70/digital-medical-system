import { useEffect, useState } from "react";
import api from "../api/axios";

function DoctorDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard/doctor");
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error(error);
    }
  };

  if (!dashboard) {
    return <div className="card">Loading dashboard...</div>;
  }

  return (
    <div className="card">
      <h2>Doctor Dashboard</h2>

      <p>
        <strong>Total Appointments:</strong>{" "}
        {dashboard.total_appointments}
      </p>

      <p>
        <strong>Pending Appointments:</strong>{" "}
        {dashboard.pending_appointments}
      </p>

      <p>
        <strong>Confirmed Appointments:</strong>{" "}
        {dashboard.confirmed_appointments}
      </p>

      <p>
        <strong>Completed Appointments:</strong>{" "}
        {dashboard.completed_appointments}
      </p>

      <p>
        <strong>Unread Alerts:</strong>{" "}
        {dashboard.unread_alerts}
      </p>

      <p>
        <strong>Medical Records:</strong>{" "}
        {dashboard.total_medical_records}
      </p>

      <p>
        <strong>Prescriptions:</strong>{" "}
        {dashboard.total_prescriptions}
      </p>
    </div>
  );
}

export default DoctorDashboard;