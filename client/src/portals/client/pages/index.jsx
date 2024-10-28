import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';

export default function ClientPortal() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}