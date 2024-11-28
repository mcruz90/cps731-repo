import { supabase } from './index';
import { format } from 'date-fns';

// defines all services related to booking
// Available methods:
// getServiceAvailability, - fetches the availability for a service on a selected date (params: serviceId (UUID), selectedDate (Date))
// createAppointment, - creates a new appointment (params: appointmentData (Object))
// getServicePractitioners, - fetches the practitioners for a service (params: serviceId (UUID))
// createAppointmentWithPayment, - creates a new appointment with payment (params: appointmentDetails (Object))
// updateAppointmentStatus, - updates the status of an appointment (params: appointmentId (UUID), status (String))
// checkPractitionerAvailability, - checks the availability of a practitioner (params: practitionerId (UUID), date (Date), time (String))

export const BookingService = {

  // fetches the availability for a service on a selected date
  async getServiceAvailability(serviceId, selectedDate) {
    try {
      console.log('Fetching availability for:', { serviceId, selectedDate });

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Fetch availability slots for the given service and date
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability')
        .select(`
          id,
          practitioner_id,
          start_time,
          end_time,
          is_available,
          service_id,
          profiles:practitioner_id (
            first_name,
            last_name
          )
        `)
        .eq('service_id', serviceId)
        .eq('date', formattedDate)
        .eq('is_available', true);

      if (availabilityError) {
        console.error('Error fetching availability:', availabilityError);
        throw availabilityError;
      }

      console.log('Raw availability data:', availabilityData);

      // Process the availability data
      const availableTimes = availabilityData.map((slot) => ({
        slotId: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
        practitionerId: slot.practitioner_id,
        practitionerName: `${slot.profiles.first_name} ${slot.profiles.last_name}`,
      }));

      console.log('Processed available times:', availableTimes);

      return {
        success: true,
        availableTimes,
      };
    } catch (error) {
      console.error('Error in getServiceAvailability:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Fetches the availability for a service within a date range
  async getServiceAvailabilityForDateRange(serviceId, startDate, endDate) {
    try {
      console.log(
        'Fetching availability for service:',
        serviceId,
        'from',
        startDate,
        'to',
        endDate
      );

      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      
      // Fetch availability slots for the given service and date range
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability')
        .select(
          `
          id,
          practitioner_id,
          date,
          start_time,
          end_time,
          is_available,
          service_id,
          profiles:practitioner_id (
            first_name,
            last_name
          )
        `
        )
        .eq('service_id', serviceId)
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate)
        .eq('is_available', true);

      if (availabilityError) {
        console.error('Error fetching availability:', availabilityError);
        throw availabilityError;
      }

      console.log('Raw availability data:', availabilityData);

      // Process the availability data
      const availableDates = [];
      const availabilityByDate = {};

      availabilityData.forEach((slot) => {
        const date = slot.date; // 'YYYY-MM-DD' format
        if (!availableDates.includes(date)) {
          availableDates.push(date);
        }
        if (!availabilityByDate[date]) {
          availabilityByDate[date] = [];
        }
        availabilityByDate[date].push({
          slotId: slot.id,
          startTime: slot.start_time,
          endTime: slot.end_time,
          practitionerId: slot.practitioner_id,
          practitionerName: `${slot.profiles.first_name} ${slot.profiles.last_name}`,
        });
      });

      return {
        success: true,
        availableDates,
        availabilityByDate,
      };
    } catch (error) {
      console.error('Error in getServiceAvailabilityForDateRange:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getClientPractitionerAppointments(clientId, practitionerId) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status
        `)
        .eq('client_id', clientId)
        .eq('practitioner_id', practitionerId)
        .order('date', { ascending: false });
  
      if (error) throw error;
  
      return {
        success: true,
        appointments: data,
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // creates a new appointment
  async createAppointment(appointmentData) {
    console.log('Creating appointment with data:', appointmentData);
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          service_id: appointmentData.service_id,
          practitioner_id: appointmentData.practitioner_id,
          client_id: appointmentData.client_id,
          appointment_date: appointmentData.date,
          start_time: appointmentData.time,
          duration: appointmentData.duration,
          notes: appointmentData.notes,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      console.log('Appointment created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  },

  // fetches the practitioners for a service
  async getServicePractitioners(serviceId) {
    try {
      const { data, error } = await supabase
        .from('practitioner_services')
        .select(`
          practitioner_id,
          profiles!inner (
            id,
            first_name,
            last_name,
            role,
            specializations
          )
        `)
        .eq('service_id', serviceId);

      if (error) throw error;

      return {
        success: true,
        practitioners: data.map(item => ({
          id: item.profiles.id,
          name: `${item.profiles.first_name} ${item.profiles.last_name}`,
          role: item.profiles.role,
          specializations: item.profiles.specializations
        }))
      };
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // creates a new appointment with payment
  async createAppointmentWithPayment(appointmentDetails) {
    try {
      console.log('Creating appointment first:', appointmentDetails);

      // Create appointment first with 'pending' status until payment completes
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert([{
          service_id: appointmentDetails.serviceId,
          practitioner_id: appointmentDetails.practitionerId,
          client_id: appointmentDetails.clientId,
          date: appointmentDetails.date,
          time: appointmentDetails.time,
          duration: appointmentDetails.duration,
          notes: appointmentDetails.notes,
          status: 'pending'
        }])
        .select(`
          *,
          services (*),
          profiles:practitioner_id (*)
        `)
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      return {
        success: true,
        appointment
      };
    } catch (error) {
      console.error('Error in createAppointmentWithPayment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // updates the status of an appointment
  async updateAppointmentStatus(appointmentId, status) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        appointment: data
      };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // checks the availability of a practitioner
  async checkPractitionerAvailability(practitionerId, date, time) {
    try {
      const dayOfWeek = format(date, 'EEEE').toLowerCase();
      
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .gte('start_time', time)
        .lte('end_time', time);

      if (error) throw error;

      return {
        success: true,
        isAvailable: data.length > 0
      };
    } catch (error) {
      console.error('Error checking practitioner availability:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};