import { Routes, Route } from 'react-router-dom';
import PortalNav from '@/components/Layout/PortalNav';
import Dashboard from './Dashboard';
import Schedule from './Schedule';
import Clients from './Clients';
import PractitionerInbox from './PractitionerInbox';
import Profile from './Profile';

const PractitionerPortal = () => {
  const navLinks = [
    { to: '/practitioner', label: 'Dashboard' },
    { to: '/practitioner/schedule', label: 'Schedule' },
    { to: '/practitioner/clients', label: 'Clients' },
    { to: '/practitioner/inbox', label: 'Inbox' },
    { to: '/practitioner/profile', label: 'Profile' },
  ];

  return (
    <>
      <PortalNav links={navLinks} />
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="clients" element={<Clients />} />
        <Route path="inbox" element={<PractitionerInbox />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </>
  );
};

export default PractitionerPortal;