import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage     from '@/pages/LoginPage.jsx'
import DashboardPage from '@/pages/DashboardPage.jsx'
import StreamingPage from '@/pages/StreamingPage.jsx'
import ComingSoon    from '@/pages/ComingSoon.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Navigate to="/login" replace />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/streaming" element={<StreamingPage />} />

      {/* Phase 2 — disabled, shows coming soon */}
      <Route path="/gps"       element={<ComingSoon title="GPS Tracker" />} />
      <Route path="/inventory" element={<ComingSoon title="Inventory Asset" />} />

      {/* Fallback */}
      <Route path="*"          element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
