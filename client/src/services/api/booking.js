import { supabase } from './index';

export const BookingService = {
  async getServiceAvailability(serviceId) {
    console.log('Fetching availability for service:', serviceId);
    
    try {
      // Get all practitioners for this service
      const { data: practitionerServices, error: psError } = await supabase
        .from('practitioner_services')
        .select(`
          practitioner_id,
          service_id,
          profiles:practitioner_id (
            first_name,
            last_name
          )
        `)
        .eq('service_id', serviceId);

      console.log('Practitioner service query result:', { practitionerServices, error: psError });

      if (psError) {
        console.error('Error fetching practitioner services:', psError);
        throw psError;
      }

      if (!practitionerServices?.length) {
        console.log('No practitioners found for this service');
        return { practitioners: [], availability: [] };
      }

      // Get first practitioner for now (we can handle multiple practitioners later)
      const firstPractitioner = practitionerServices[0];

      // Then get their availability schedule
      const { data: availabilityData, error: availError } = await supabase
        .from('availability')
        .select(`
          id,
          practitioner_id,
          day_of_week,
          start_time,
          end_time,
          is_available
        `)
        .eq('practitioner_id', firstPractitioner.practitioner_id)
        .eq('is_available', true);

      console.log('Availability query result:', { availabilityData, error: availError });

      if (availError) {
        console.error('Error fetching availability:', availError);
        throw availError;
      }

      // Format the response
      const response = {
        practitioner: {
          id: firstPractitioner.practitioner_id,
          name: `${firstPractitioner.profiles.first_name} ${firstPractitioner.profiles.last_name}`
        },
        availability: availabilityData?.map(slot => ({
          dayOfWeek: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time
        })) || []
      };

      console.log('Formatted availability response:', response);
      return response;

    } catch (error) {
      console.error('Error in getServiceAvailability:', error);
      throw new Error(`Failed to fetch service availability: ${error.message}`);
    }
  },

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
          status: 'pending' // Default status
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

  async getServicePractitioners(serviceId) {
    console.log('Fetching practitioners for service:', serviceId);
    
    try {
      const { data: practitionerServices, error: psError } = await supabase
        .from('practitioner_services')
        .select(`
          practitioner_id,
          service_id,
          profiles:practitioner_id (
            first_name,
            last_name,
            role
          )
        `)
        .eq('service_id', serviceId);

      if (psError) throw psError;

      const practitioners = practitionerServices.map(ps => ({
        id: ps.practitioner_id,
        name: `${ps.profiles.first_name} ${ps.profiles.last_name}`,
        role: ps.profiles.role
      }));

      return { practitioners };
    } catch (error) {
      console.error('Error in getServicePractitioners:', error);
      throw new Error(`Failed to fetch practitioners: ${error.message}`);
    }
  }
};