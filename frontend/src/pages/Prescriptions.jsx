import { useEffect, useState } from "react";
import api from "../api/axios";

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get("/prescriptions");
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="card">
      <h2>Prescriptions</h2>

      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className="card"
          >
            <p>
              <strong>Medication:</strong>{" "}
              {prescription.medication_name}
            </p>

            <p>
              <strong>Dosage:</strong>{" "}
              {prescription.dosage}
            </p>

            <p>
              <strong>Duration:</strong>{" "}
              {prescription.duration}
            </p>

            <p>
              <strong>Instructions:</strong>{" "}
              {prescription.instructions}
            </p>

            <p>
              <strong>Date Prescribed:</strong>{" "}
              {new Date(prescription.prescribed_at).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Prescriptions;