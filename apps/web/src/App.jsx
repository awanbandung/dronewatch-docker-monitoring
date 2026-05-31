import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage     from '@/pages/LoginPage.jsx'
import DashboardPage from '@/pages/DashboardPage.jsx'
import StreamingPage from '@/pages/StreamingPage.jsx'
import ComingSoon    from '@/pages/ComingSoon.jsx'

function RequireAuth({ children }) {
  return localStorage.getItem('dw_token')
    ? children
    : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Navigate to="/login" replace />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/streaming" element={<RequireAuth><StreamingPage /></RequireAuth>} />

      {/* Phase 2 — disabled, shows coming soon */}
      <Route path="/gps"       element={<RequireAuth><ComingSoon title="GPS Tracker" /></RequireAuth>} />
      <Route path="/inventory" element={<RequireAuth><ComingSoon title="Inventory Asset" /></RequireAuth>} />

      {/* Fallback */}
      <Route path="*"          element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
