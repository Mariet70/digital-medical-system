import { Routes, Route, Link } from "react-router-dom";
import logo from "./assets/logo.png";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Prescriptions from "./pages/Prescriptions";
import Messages from "./pages/Messages";

function App() {
  const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};
  return (
    <div className="container">
      
        <nav className="navbar">
  <div className="logo-section">
    <img
      src={logo}
      alt="Digital Medical System Logo"
      className="logo"
    />
    <h2>Digital Medical System</h2>
  </div>

        <Link to="/">Login</Link> |{" "}
        <Link to="/register">Register</Link> |{" "}
        <Link to="/patient-dashboard">Patient Dashboard</Link> |{" "}
        <Link to="/doctor-dashboard">Doctor Dashboard</Link> |{" "}
        <Link to="/appointments">Appointments</Link> |{" "}
        <Link to="/medical-records">Medical Records</Link> |{" "}
        <Link to="/prescriptions">Prescriptions</Link> |{" "}
        <Link to="/messages">Messages</Link>
        <button onClick={logout}>Logout</button>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </div>
  );
}

export default App;