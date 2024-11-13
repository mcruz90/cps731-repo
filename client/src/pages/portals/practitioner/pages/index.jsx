import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Schedule from './Schedule';
import Clients from './Clients';

export default function PractitionerPortal() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/clients" element={<Clients />} />
    </Routes>
  );
}