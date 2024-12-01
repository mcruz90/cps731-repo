import { supabase } from './index'; 

/*
  Practitioner-specific database operations.
  Practitioners interact with their own data and availability.

  available methods:
    - getAvailability
    - getAppointmentsWithClientInfo
    - getAppointmentsWithClientCount
    - getConfirmedAppointmentsWithDetails
    - getConfirmedAppointmentsWithClientCount
    - getAppointmentBookings
    - getAvailabilities
    - getServices
*/

export const practitionerService = {
  // Fetch practitioner's availability with service names
  async getAvailability(practitionerId) {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select(`
          *,
          services(name)
        `)
        .eq('practitioner_id', practitionerId)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw new Error(`Failed to fetch availability: ${error.message}`);
    }
  },

  // Fetch practitioner's appointments with client information
  async getAppointmentsWithClientInfo(practitionerId) {
    try {
      const { data, error } = await supabase
        .rpc('get_appointments_with_client_info', { p_practitioner_id: practitionerId });

      if (error) throw error;

      return data.map((appointment) => ({
        id: appointment.id,
        date: appointment.date,
        appointment_time: appointment.appointment_time,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        service_name: appointment.service_name || 'No Service',
        client_name: appointment.client_name || 'No Client',
        client_email: appointment.client_email || '',
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }
  },

  async getAppointmentsWithClientCount(practitionerId) {
    try {
      const { data, error } = await supabase
        .rpc('get_appointments_with_client_count', { p_practitioner_id: practitionerId });

      if (error) throw error;

      return data.map((appointment) => ({
        id: appointment.id,
        date: appointment.date,
        appointment_time: appointment.time,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        service_name: appointment.service_name || 'No Service',
        service_id: appointment.service_id || '',
        client_count: appointment.client_count || 0,
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }
  },

  // fetches confirmed appointments with details
  async getConfirmedAppointmentsWithDetails(practitionerId) {
    try {
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          duration,
          status,
          notes,
          service_id,
          availability_id,
          services(name)
        `)
        .eq('practitioner_id', practitionerId)
        .eq('status', 'confirmed');

      if (appointmentsError) {
        throw appointmentsError;
      }

      if (!appointments || appointments.length === 0) {
        return []; 
      }

      const appointmentIds = appointments.map((apt) => apt.id);

      const { data: bookings, error: bookingsError } = await supabase
        .from('appointment_bookings')
        .select('appointment_id')
        .in('appointment_id', appointmentIds);

      if (bookingsError) {
        throw bookingsError;
      }

      const bookingCounts = bookings.reduce((acc, booking) => {
        acc[booking.appointment_id] = (acc[booking.appointment_id] || 0) + 1;
        return acc;
      }, {});

      const formattedAppointments = appointments.map((appointment) => ({
        ...appointment,
        client_count: bookingCounts[appointment.id] || 0,
        service_name: appointment.services?.name || 'No Service',
      }));

      return formattedAppointments;
    } catch (error) {
      console.error('Error fetching confirmed appointments with details:', error);
      throw error;
    }
  },

  // fetches confirmed appointments with client count
  async getConfirmedAppointmentsWithClientCount(practitionerId) {
    try {
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          duration,
          status,
          notes,
          service_id,
          availability_id,
          services (name)
        `)
        .eq('practitioner_id', practitionerId)
        .eq('status', 'confirmed');

      if (appointmentsError) {
        throw appointmentsError;
      }

      if (!appointments || appointments.length === 0) {
        return [];
      }

      const appointmentIds = appointments.map((apt) => apt.id);
      console.log('Appointment IDs:', appointmentIds);

      const bookingsData = await this.getAppointmentBookings(appointmentIds);
      console.log('Fetched Bookings:', bookingsData);

      const bookingCounts = bookingsData.reduce((acc, booking) => {
        acc[booking.appointment_id] = (acc[booking.appointment_id] || 0) + 1;
        return acc;
      }, {});
      console.log('Booking Counts:', bookingCounts);

      const formattedAppointments = appointments.map((appointment) => ({
        ...appointment,
        client_count: bookingCounts[appointment.id] || 0, 
        service_name: appointment.services.name || 'No Service',
      }));

      return formattedAppointments;
    } catch (error) {
      console.error('Error fetching confirmed appointments with client count:', error);
      throw error;
    }
  },

  // fetches appointment bookings
  async getAppointmentBookings(appointmentIds) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .in('id', appointmentIds);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching appointment bookings:', error);
      throw error;
    }
  },

  // fetches all availability slots
  async getAvailabilities(practitionerId) {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('id, date, start_time, duration, name')
        .eq('practitioner_id', practitionerId);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      throw error;
    }
  },

  // fetches services
  async getServices() {
    try {
      const { data, error } = await supabase.from('services').select('id, name');
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('error getting services:', error);
      throw error;
    }
  },

  // practitioner can add availability
  async addAvailability(newSlot) {
    try {
      const { data, error } = await supabase
        .from('availability')
        .insert(newSlot)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('error adding:', error);
      throw error;
    }
  },

  // practitioner can update availability
  async updateAvailability(slotId, updatedSlot) {
    try {
      const { data, error } = await supabase
        .from('availability')
        .update(updatedSlot)
        .eq('id', slotId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('error updating:', error);
      throw error;
    }
  },

  // practitioner can delete availability
  async deleteAvailability(slotId) {
    try {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', slotId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('error deleting:', error);
      throw error;
    }
  },

  // fetches the total count of confirmed appointments per service
  async getClientCount(practitionerId) {
    try {
      const { data, error } = await supabase
        .rpc('get_client_counts', { p_practitioner_id: practitionerId });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('rpc error:', error);
      throw new Error(`Failed to fetch client counts: ${error.message}`);
    }
  },

  // fetches the total count of confirmed appointments per service
  async getClientCounts(practitionerId) {
    try {
      const appointments = await this.getConfirmedAppointmentsWithDetails(practitionerId);
      const clientCountPromises = appointments.map(apt =>
        this.getClientCountsFiltered(practitionerId, apt.service_id, apt.availability_id)
          .then(counts => ({
            appointmentId: apt.id,
            totalCount: counts.length > 0 ? counts[0].total_count : 0,
          }))
      );

      const clientCountsArray = await Promise.all(clientCountPromises);
      const clientCounts = clientCountsArray.reduce((acc, { appointmentId, totalCount }) => {
        acc[appointmentId] = totalCount;
        return acc;
      }, {});

      return clientCounts;
    } catch (error) {
      console.error('error:', error);
      throw new Error(`Failed to fetch client counts: ${error.message}`);
    }
  },

  // fetches the total count of confirmed appointments per service and availability
  async getClientCountsFiltered(practitionerId, serviceId, availabilityId) {
    try {
      const { data, error } = await supabase
        .rpc('get_client_counts_filtered', {
          p_practitioner_id: practitionerId,
          p_service_id: serviceId,
          p_availability_id: availabilityId,
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('rpc error:', error);
      throw new Error(`Failed to fetch client counts: ${error.message}`);
    }
  },
}; 