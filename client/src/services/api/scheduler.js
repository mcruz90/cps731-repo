import { supabase } from './index';

// defines all services related to scheduling
// Available methods:
// checkAvailability, - checks if a specific time slot is available for a practitioner (params: practitionerId (UUID), date (String), time (String))
// getAvailableSlots, - fetches the available slots for a practitioner and service on a specific date (params: practitionerId (UUID), serviceId (UUID), date (String))

export const SchedulerSystem = {
    
  // checks if a specific time slot is available for a practitioner
    async checkAvailability(practitionerId, date, time) {
        try {
            // Check if the time slot is available
            const { data, error } = await supabase
                .from('appointments')
                .select('id')
                .eq('practitioner_id', practitionerId)
                .eq('date', date)
                .eq('start_time', time);

            if (error) throw error;

            // Returns true if time slot is available
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

            // Fetch practitioner's availability for the given date
            const { data: availability, error: availabilityError } = await supabase
                .from('availability')
                .select('start_time, end_time')
                .eq('practitioner_id', practitionerId)
                .eq('date', date);

            if (availabilityError) throw availabilityError;

            // if no availability found, return an empty array
            if (availability.length === 0) {
                return []; 
            }

            const { start_time, end_time } = availability[0];
            const serviceDuration = await getServiceDuration(serviceId);

            // Generate time slots based on availability and service duration
            const slots = generateTimeSlots(start_time, end_time, serviceDuration);

            // Fetch existing appointments for the practitioner on the selected date
            const { data: existingAppointments, error: appointmentsError } = await supabase
                .from('appointments')
                .select('time, duration')
                .eq('practitioner_id', practitionerId)
                .eq('date', date)
                .neq('status', 'cancelled');

            if (appointmentsError) throw appointmentsError;

            // Mark slots as available or not based on existing appointments
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
};

// Helper Functions

// fetches the duration of a service
const getServiceDuration = async (serviceId) => {
    const { data, error } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single();

    if (error) throw error;
    return data.duration; // duration in minutes
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