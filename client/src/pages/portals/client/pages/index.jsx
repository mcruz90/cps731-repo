// TODO: need to add search bar so user can easily search for services, practitioners, etc
// TODO: add calendar component
// TODO: add notifications component
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Appointments from './Appointments';
import BookAppointment from './BookAppointment';

export default function ClientPortal() {
  console.log('ClientPortal rendering, current path:', window.location.pathname);
  
  return (
    <div>
      <h1>Client Portal</h1>
      
      {/* Navigation */}
      <nav>
        <Link to="/client">Dashboard</Link>
        <Link to="/client/profile">Profile</Link>
        <Link to="/client/appointments">Appointments</Link>
      </nav>

      {/* Nested Routes */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="appointments/book" element={<BookAppointment />} />
      </Routes>
    </div>
  );
}