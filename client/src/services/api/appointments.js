import axios from 'axios';
import { supabase } from './index';

const API_URL = 'http://localhost:5000/api';

export const fetchPractitionerAppointments = async (practitionerId) => {
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
        )
      `)
      .eq('practitioner_id', practitionerId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching practitioner appointments:', error);
    throw error;
  }
};

export const appointmentService = {
  // Get appointment details for a specific client and appointment
  getAppointmentDetails: async (clientId, appointmentId) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          service_id,
          practitioner_id,
          client_id,
          appointment_date,
          start_time,
          duration,
          status,
          notes,
          services (
            name,
            price,
            duration
          ),
          profiles:practitioner_id (
            first_name,
            last_name,
            role
          )
        `)
        .eq('id', appointmentId)
        .eq('client_id', clientId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      throw new Error(`Failed to fetch appointment details: ${error.message}`);
    }
  },

  // Get all appointments for a client
  getClientAppointments: async (clientId) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            duration
          ),
          profiles:practitioner_id (
            first_name,
            last_name
          )
        `)
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client appointments:', error);
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }
  },

  // Modify an existing appointment
  modifyAppointment: async (appointmentId, modifiedData) => {
    try {
      // First check if the appointment exists and belongs to the client
      const { data: existingAppointment, error: checkError } = await supabase
        .from('appointments')
        .select('id, client_id')
        .eq('id', appointmentId)
        .single();

      if (checkError || !existingAppointment) {
        throw new Error('Appointment not found or access denied');
      }

      // Update the appointment with modified data
      const { data, error } = await supabase
        .from('appointments')
        .update({
          practitioner_id: modifiedData.practitionerId,
          appointment_date: modifiedData.date,
          start_time: modifiedData.time,
          notes: modifiedData.notes,
          status: 'modified',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error modifying appointment:', error);
      throw new Error(`Failed to modify appointment: ${error.message}`);
    }
  },

  // Get upcoming appointments with more details
  getUpcomingAppointments: async (clientId) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            duration,
            price
          ),
          profiles:practitioner_id (
            first_name,
            last_name
          )
        `)
        .eq('client_id', clientId)
        .neq('status', 'cancelled')
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw new Error(`Failed to fetch upcoming appointments: ${error.message}`);
    }
  },

  // Cancel an appointment with validation
  cancelAppointment: async (appointmentId, clientId) => {
    try {
      // Verify the appointment belongs to the client
      const { data: appointment, error: checkError } = await supabase
        .from('appointments')
        .select('id, status, appointment_date')
        .eq('id', appointmentId)
        .eq('client_id', clientId)
        .single();

      if (checkError || !appointment) {
        throw new Error('Appointment not found or access denied');
      }

      // Check if appointment is in the future
      if (new Date(appointment.appointment_date) < new Date()) {
        throw new Error('Cannot cancel past appointments');
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Client cancelled'
        })
        .eq('id', appointmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw new Error(`Failed to cancel appointment: ${error.message}`);
    }
  },

  // Create an appointment with validation
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
  }
};