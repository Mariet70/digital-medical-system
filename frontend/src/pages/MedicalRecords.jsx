import { useEffect, useState } from "react";
import api from "../api/axios";

function MedicalRecords() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get("/medical-records");
      setRecords(response.data.records);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="card">
      <h2>Medical Records</h2>

      {records.length === 0 ? (
        <p>No medical records found.</p>
      ) : (
        records.map((record) => (
          <div
            key={record.id}
            className="card"
          >
            <p>
              <strong>Diagnosis:</strong>{" "}
              {record.diagnosis}
            </p>

            <p>
              <strong>Treatment:</strong>{" "}
              {record.treatment}
            </p>

            <p>
              <strong>Prescription Notes:</strong>{" "}
              {record.prescription_notes}
            </p>

            <p>
              <strong>Test Results:</strong>{" "}
              {record.test_results}
            </p>

            <p>
              <strong>Doctor Notes:</strong>{" "}
              {record.notes}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(record.record_date).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MedicalRecords;