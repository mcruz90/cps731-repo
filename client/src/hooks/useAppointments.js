import { useState, useEffect } from 'react';
import { appointmentService } from '@/services/api/appointments';
import { getCurrentWeekDateRange } from '@/utils/dateUtils';

export const useAppointments = (userId) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const { start, end } = getCurrentWeekDateRange();
        const fetchedAppointments = await appointmentService.getAppointmentsByDateRange(
          userId,
          start,
          end
        );
        setAppointments(fetchedAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userId]);

  return { appointments, loading, error };
};
