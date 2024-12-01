import { supabase } from './index';
import { SchedulerSystem } from './scheduler';
import { formatDate } from '@/utils/dateUtils';
import { format } from 'date-fns';

// defines all services related to appointments
// also uses SchedulerSystem's methods for appointment scheduling--maybe redundant???? need to rethink this flow
// Available methods:
// getAll, - fetches all appointments for the logged-in client
// cancel, - cancels an appointment
// modify, - modifies an existing appointment
// getUpcoming, - fetches all upcoming appointments for the logged-in client
// createAppointment, - creates a new appointment
// getAvailableSlotsForModification, - fetches the available slots for modifying an appointment
// getAppointmentsByDateRange, - fetches the appointments by date range
// fetchPractitionerAppointments, fetchPractitionerClients


export const appointmentService = {

  // Get all appointments for the logged-in client
  getAll: async (clientId) => {
    try {
      if (!clientId) {
        throw new Error('Client ID is required');
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          notes,
          duration,
          service_id,
          practitioner_id,
          client_id,
          services!inner (
            id,
            description,
            duration,
            price
          ),
          practitioner:practitioner_id!inner (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('client_id', clientId)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;

      return data.map(appointment => ({
        ...appointment,
        date: appointment.date.split('T')[0],
        service_type: appointment.services.description,
        practitioner_name: `${appointment.practitioner.first_name} ${appointment.practitioner.last_name}`,
        notes: appointment.notes,
        duration: appointment.duration,
        practitioner_id: appointment.practitioner_id,
        service_id: appointment.service_id
      }));

    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  // Cancel an appointment
  cancel: async (appointmentId) => {
    try {
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

  // modifies an existing appointment
  modify: async (appointmentId, updates) => {
    try {
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }

      console.log('Modifying appointment:', { appointmentId, updates });

      const updatedFields = {
        date: updates.date,
        time: updates.time,
        notes: updates.notes,
        status: 'pending',
        updated_at: new Date().toISOString(),
      };

      console.log('Sending update to database:', updatedFields);

      const { data, error } = await supabase
        .from('appointments')
        .update(updatedFields)
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Appointment updated successfully:', data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error modifying appointment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get upcoming appointments
  getUpcoming: async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          notes,
          services (
            id,
            name,
            duration,
            price
          ),
          profiles:practitioner_id (
            id,
            first_name,
            last_name
          )
        `)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      return data.map(appointment => ({
        id: appointment.id,
        date: appointment.date.split('T')[0],
        time: appointment.time,
        status: appointment.status,
        service_type: appointment.services.name,
        practitioner_name: `${appointment.profiles.first_name} ${appointment.profiles.last_name}`,
        notes: appointment.notes
      }));
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw new Error(`Failed to fetch upcoming appointments: ${error.message}`);
    }
  },

  // creates an appointment
  // TODO: need to check for existing appointments on the same date and time and any other conflicts. see use case.
  createAppointment: async (appointmentData) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          status: 'confirmed',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  },

  // fetches the available slots for modifying an appointment
  // calls on SchedulerSystem's getAvailableSlots method
  getAvailableSlotsForModification: async ({
    practitionerId,
    serviceId,
    date,
    excludeAppointmentId
  }) => {
    // Validate required parameters or else this won't go through
    if (!practitionerId || !serviceId || !date) {
      throw new Error('Practitioner ID, Service ID, and Date are required');
    }

    try {
      // set format to (YYYY-MM-DD). date was not displaying properly in the frontend and setting dates two days behind.
      const formattedDate = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');

      const slots = await SchedulerSystem.getAvailableSlots(practitionerId, serviceId, formattedDate, excludeAppointmentId);
      return slots;
    } catch (error) {
      console.error('Error in getAvailableSlotsForModification:', error);
      throw new Error(`Failed to get available slots: ${error.message}`);
    }
  },

  // fetches the appointments by date range
  getAppointmentsByDateRange: async (clientId, startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          service_type:services(name),
          date,
          time,
          practitioner:profiles!appointments_practitioner_id_fkey(first_name, last_name),
          status
        `)
        .eq('client_id', clientId)
        .gte('date', formatDate(startDate))
        .lte('date', formatDate(endDate))
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;

      const transformedData = data.map((appointment) => ({
        id: appointment.id,
        sessionType: appointment.service_type.name,
        date: appointment.date,
        time: appointment.time,
        instructor: `${appointment.practitioner.first_name} ${appointment.practitioner.last_name}`,
        status: appointment.status,
      }));

      return transformedData;
    } catch (error) {
      console.error('Error fetching appointments by date range:', error);
      throw error;
    }
  },

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
          services:service_id (
            name
          ),
          profiles:practitioner_id (
            first_name,
            last_name
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
        serviceName: appt.services.name,
        practitionerName: `${appt.profiles.first_name} ${appt.profiles.last_name}`,
      }));

      return appointments;
    } catch (error) {
      console.error('Error fetching client appointments:', error);
      throw new Error(`Failed to fetch client appointments: ${error.message}`);
    }
  },

};