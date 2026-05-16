import { useEffect, useState } from "react";
import api from "../api/axios";

function PatientDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard/patient");
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
      <h2>Patient Dashboard</h2>

      <p>
        <strong>Upcoming Appointments:</strong>{" "}
        {dashboard.upcoming_appointments}
      </p>

      <p>
        <strong>Medical Records:</strong>{" "}
        {dashboard.total_medical_records}
      </p>

      <p>
        <strong>Prescriptions:</strong>{" "}
        {dashboard.total_prescriptions}
      </p>

      <p>
        <strong>Emergency Contact Configured:</strong>{" "}
        {dashboard.emergency_contact_configured ? "Yes" : "No"}
      </p>
    </div>
  );
}

export default PatientDashboard;