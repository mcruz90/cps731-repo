import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchPractitionerAppointments } from '@/services/api/appointments';
import { useAuth } from '@/hooks/useAuth';

const PractitionerSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await fetchPractitionerAppointments(user.id);
        const formattedAppointments = data.map(appointment => ({
          id: appointment.id,
          title: `Appointment with ${appointment.profiles.first_name} ${appointment.profiles.last_name}`,
          start: `${appointment.date}T${appointment.time}`,
          end: `${appointment.date}T${appointment.time}`, // Adjust end time based on duration if needed
          extendedProps: {
            duration: appointment.duration,
            status: appointment.status,
            notes: appointment.notes,
          }
        }));
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    if (user) {
      loadAppointments();
    }
  }, [user]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      events={appointments}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
    />
  );
};

export default PractitionerSchedule;