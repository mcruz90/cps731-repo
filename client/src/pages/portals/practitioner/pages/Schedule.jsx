import React from 'react';
import PractitionerSchedule from './PractitionerSchedule';
import PortalLayout from '@/components/Layout/PortalLayout';
import { Typography } from '@mui/material';

const Schedule = () => {
  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Schedule
      </Typography>
      <PractitionerSchedule />
    </PortalLayout>
  );
};

export default Schedule;