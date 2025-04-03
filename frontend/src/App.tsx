import { BrowserRouter, Routes, Route } from "react-router-dom"
import DoctorDashboard from "./pages/DoctorDashboard"
import PatientQueue from "./pages/PatientQueue"
import Login from "./pages/Login"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/queue/:id" element={<PatientQueue />} />
        <Route path="/doctor/:id" element={<DoctorDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
