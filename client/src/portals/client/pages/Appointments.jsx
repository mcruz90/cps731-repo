import { useSubscription } from '@/hooks/useSubscription';
import { useCallback } from 'react';
import { AppointmentList } from '../components/AppointmentList';
import { appointmentService } from '@/services/api/appointments';

export default function Appointments() {
  const appointments = useSubscription('appointments');

  // Handler for canceling appointments
  const handleCancelAppointment = useCallback(async (appointmentId) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      
      
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      // Handle error (show toast or a modal notification???)
    }
  }, []);

  // Handler for rescheduling appointments
  const handleReschedule = useCallback(async (appointmentId) => {
    try {
      // if rescheduling, should navigate to the reschedule page
      // else, handle the reschedule logic here
      await appointmentService.initiateReschedule(appointmentId);
      
      // navigate to the reschedule page
      window.location.href = '/reschedule';


    } catch (error) {
      console.error('Failed to initiate reschedule:', error);
      // Handle error (show toast notification????)
    }
  }, []);

  return (
    <div>
      <h1>My Appointments</h1>
      <AppointmentList 
        appointments={appointments}
        onCancelAppointment={handleCancelAppointment}
        onReschedule={handleReschedule}
      />
    </div>
  );
}