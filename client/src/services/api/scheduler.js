import { supabase } from './index';

// defines all services related to scheduling
// Available methods:
// checkAvailability, - checks if a specific time slot is available for a practitioner (params: practitionerId (UUID), date (String), time (String))
// getAvailableSlots, - fetches the available slots for a practitioner and service on a specific date (params: practitionerId (UUID), serviceId (UUID), date (String))
// fetchPractitionerSchedule, - fetches the schedule of a practitioner (params: practitionerId (UUID))
// fetchPractitionerClients, - fetches the unique clients who have booked appointments with a practitioner (params: practitionerId (UUID))
// fetchClientAppointments, - fetches the appointments of a client (params: practitionerId (UUID), clientId (UUID))

export const SchedulerSystem = {
    
  // checks if a specific time slot is available for a practitioner
    async checkAvailability(practitionerId, date, time) {
        try {
            
            const { data, error } = await supabase
                .from('appointments')
                .select('id')
                .eq('practitioner_id', practitionerId)
                .eq('date', date)
                .eq('start_time', time);

            if (error) throw error;

            return data.length === 0;
        } catch (error) {
            console.error('Error checking availability:', error);
            throw new Error(`Failed to check availability: ${error.message}`);
        }
    },

    // fetches the available slots for a practitioner and service on a specific date
    async getAvailableSlots(practitionerId, serviceId, date) {
        try {
            if (!practitionerId || !serviceId || !date) {
                throw new Error('Practitioner ID, Service ID, and Date are required');
            }

            const { data: availability, error: availabilityError } = await supabase
                .from('availability')
                .select('start_time, end_time')
                .eq('practitioner_id', practitionerId)
                .eq('date', date);

            if (availabilityError) throw availabilityError;

            if (availability.length === 0) {
                return []; 
            }

            const { start_time, end_time } = availability[0];
            const serviceDuration = await getServiceDuration(serviceId);

            const slots = generateTimeSlots(start_time, end_time, serviceDuration);

            const { data: existingAppointments, error: appointmentsError } = await supabase
                .from('appointments')
                .select('time, duration')
                .eq('practitioner_id', practitionerId)
                .eq('date', date)
                .neq('status', 'cancelled');

            if (appointmentsError) throw appointmentsError;

            const availableSlots = slots.filter(slot => {
                const slotStart = parseTime(slot.time);
                const slotEnd = addMinutes(slotStart, serviceDuration);

                return !existingAppointments.some(app => {
                    const appStart = parseTime(app.time);
                    const appEnd = addMinutes(appStart, app.duration);
                    return (
                        (slotStart >= appStart && slotStart < appEnd) ||
                        (slotEnd > appStart && slotEnd <= appEnd) ||
                        (appStart >= slotStart && appStart < slotEnd)
                    );
                });
            });

            return availableSlots;
        } catch (error) {
            console.error('Error in getAvailableSlots:', error);
            throw new Error(`Failed to get available slots: ${error.message}`);
        }
    },

    async fetchPractitionerSchedule(practitionerId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    id,
                    client_id,
                    practitioner_id,
                    date,
                    time,
                    duration,
                    status,
                    notes,
                    created_at,
                    updated_at,
                    service_id,
                    availability_id,
                    profiles:client_id (
                        first_name,
                        last_name
                    ),
                    services:service_id (
                        name,
                        description
                    )
                `)
                .eq('practitioner_id', practitionerId)
                .eq('status', 'confirmed');
    
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching practitioner appointments:', error);
            throw error;
        }
    },

    // Fetches unique clients who have booked appointments with the practitioner
    async fetchPractitionerClients(practitionerId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    client_id,
                    profiles:client_id (
                        first_name,
                        last_name
                    )
                `)
                .eq('practitioner_id', practitionerId)
                .eq('status', 'confirmed');

            if (error) throw error;

            // fixes duplicate clients being retrieved
            const uniqueClientsMap = new Map();
            data.forEach(appointment => {
                if (appointment.client_id && appointment.profiles) {
                    uniqueClientsMap.set(appointment.client_id, {
                        id: appointment.client_id,
                        firstName: appointment.profiles.first_name,
                        lastName: appointment.profiles.last_name,
                    });
                }
            });

            const uniqueClients = Array.from(uniqueClientsMap.values());

            return uniqueClients;
        } catch (error) {
            console.error('Error fetching practitioner clients:', error);
            throw new Error(`Failed to fetch clients: ${error.message}`);
        }
    },

    // Fetches client's appointments
    async fetchClientAppointments(practitionerId, clientId) {
        try {
          const { data, error } = await supabase
            .from('appointments')
            .select(`
              id,
              date,
              time,
              duration,
              status,
              notes,
              service_id,
              services:service_id (
                name
              )
            `)
            .eq('practitioner_id', practitionerId)
            .eq('client_id', clientId)
            .order('date', { ascending: false });
    
          if (error) throw error;
    
          const appointments = data.map((appt) => ({
            id: appt.id,
            date: appt.date,
            time: appt.time,
            duration: appt.duration,
            status: appt.status,
            notes: appt.notes,
            serviceId: appt.service_id,
            serviceName: appt.services ? appt.services.name : 'N/A',
          }));
    
          return appointments;
        } catch (error) {
          console.error('Error fetching client appointments:', error);
          throw new Error(`Failed to fetch client appointments: ${error.message}`);
        }
      },
    
};

// Helper Functions

// fetches  duration of a service
const getServiceDuration = async (serviceId) => {
    const { data, error } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single();

    if (error) throw error;
    return data.duration;
};

// generates the time slots for a practitioner
const generateTimeSlots = (startTime, endTime, duration) => {
    const slots = [];
    let current = parseTime(startTime);
    const end = parseTime(endTime);

    while (current + duration <= end) {
        slots.push({ time: formatTime(current) });
        current += duration;
    }

    return slots;
};
  
// parses the time string to minutes
const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// adds minutes to a time represented in total minutes
const addMinutes = (time, minutes) => time + minutes;

// formats the time represented in total minutes to a string in 'HH:MM' format
const formatTime = (time) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};