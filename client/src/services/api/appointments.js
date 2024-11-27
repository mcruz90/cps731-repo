import { supabase } from './index';
import { SchedulerSystem } from './scheduler';
import { formatDate } from '@/utils/dateUtils';

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
        .order('date', { ascending: true });

      if (error) throw error;

      // transforms the data to match the calling component's expectations in the AppointmentList component
      return data.map(appointment => ({
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
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

      // sets the status to 'pending' upon modification
      // TODO: maybe practitioners should be able to modify the status of an appointment to confirm the modification? too extra???
      const updatedFields = {
        ...updates,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(updatedFields)
        .eq('id', appointmentId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error modifying appointment:', error);
      throw error;
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
        date: appointment.date,
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
  // TODO: need to check for existing appointments on the same date and time and any other conflicts
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
  getAvailableSlotsForModification: async (practitionerId, serviceId, date) => {
    try {
      const slots = await SchedulerSystem.getAvailableSlots(practitionerId, serviceId, date);
      return slots;
    } catch (error) {
      console.error('Error in getAvailableSlotsForModification:', error);
      throw error;
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

      // Transform data to match AppointmentList's expected prop structure
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
  }
};