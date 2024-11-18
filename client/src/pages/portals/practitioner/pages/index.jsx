import { Routes, Route, Link} from 'react-router-dom';
import Dashboard from './Dashboard';
import Schedule from './Schedule';
import Clients from './Clients';

export default function PractitionerPortal() {
  console.log('PractitionerPortal rendering, current path:', window.location.pathname);
  
  return (
      <>
      <div>
        <h1>Practitioner Portal</h1>

        <nav>
          <Link to="/practitioner">Dashboard</Link>
          <Link to="/practitioner/schedule">Schedule</Link>
          <Link to="/practitioner/clients">Clients</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/clients" element={<Clients />} />
      </Routes>
      </div>
    </>
  );
}