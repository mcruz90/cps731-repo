import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PortalNav from '@/components/Layout/PortalNav';
import Dashboard from './Dashboard';
import Schedule from './Schedule';
import Clients from './Clients';
import BookAppointment from './BookAppointment';

const PractitionerPortal = () => {
  const navLinks = [
    { to: '/practitioner', label: 'Dashboard' },
    { to: '/practitioner/schedule', label: 'Schedule' },
    { to: '/practitioner/clients', label: 'Clients' },
    { to: '/practitioner/book', label: 'Book Appointment' },
  ];

  return (
    <>
      <PortalNav links={navLinks} />
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="clients" element={<Clients />} />
        <Route path="book" element={<BookAppointment />} />
      </Routes>
    </>
  );
};

export default PractitionerPortal;