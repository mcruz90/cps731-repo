import { supabaseAdmin as supabase } from './adminClient';

export const reportService = {

  // Dashboard Summary - updated to show weekly metrics
  async getDashboardSummary() {
    try {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          status,
          services:services!appointments_service_id_fkey (
            price
          )
        `)
        .gte('date', startOfWeek.toISOString().split('T')[0]);

      console.log('Fetched dashboard summary data:', data);

      if (error) throw error;

      const summary = {
        weeklyAppointments: data.length,
        weeklyRevenue: data
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.services?.price || 0), 0),
        weeklyCancellations: data
          .filter(a => a.status === 'cancelled').length,
        weeklyRevenueLoss: data
          .filter(a => a.status === 'cancelled')
          .reduce((sum, a) => sum + (a.services?.price || 0), 0)
      };

      return summary;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  // Appointment Reports: statistics and revenue analysis
  async getAppointmentReports(type, filters = {}) {
    const { startDate, endDate, practitionerId, serviceId, status } = filters;

    try {
      console.log(`Fetching appointment reports: Type ${type}`, filters);

      let query = supabase
        .from('appointments')
        .select(`
          id,
          status,
          date,
          time,
          duration,
          notes,
          client_id,
          practitioner_id,
          service_id,
          availability_id,
          services:services!appointments_service_id_fkey (
            id,
            name,
            price
          ),
          profiles:profiles!appointments_practitioner_id_fkey (
            id,
            first_name,
            last_name
          )
        `);

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('date', endDate.toISOString().split('T')[0]);
      }
      if (practitionerId) {
        query = query.eq('practitioner_id', practitionerId);
      }
      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }
      if (status && status !== '') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('Fetched appointment reports data:', data);

      if (type === 0) {
        
        const statisticsMap = {};

        data.forEach((appointment) => {
          const serviceType = appointment.services.name;
          if (!statisticsMap[serviceType]) {
            statisticsMap[serviceType] = {
              serviceType,
              totalAppointments: 0,
              completed: 0,
              cancelled: 0,
            };
          }
          statisticsMap[serviceType].totalAppointments += 1;
          if (appointment.status === 'completed') {
            statisticsMap[serviceType].completed += 1;
          } else if (appointment.status === 'cancelled') {
            statisticsMap[serviceType].cancelled += 1;
          }
        });

        // stats stuff
        const statistics = Object.values(statisticsMap);
        return { statistics };
      } else if (type === 1) {
        
        // revenue stuff
        const totalRevenue = data.reduce((acc, appointment) => {
          return acc + (Number(appointment.services?.price) || 0);
        }, 0);

        return { revenue: [totalRevenue] };
      }

      throw new Error('Invalid report type specified.');
    } catch (error) {
      console.error('Error fetching appointment reports:', error);
      throw error;
    }
  },

  // Availability Reports
  async getAvailabilityReports(practitionerId = null) {
    try {
      let query = supabase
        .from('availability_reports')
        .select('*');

      if (practitionerId) {
        query = query.eq('practitioner_id', practitionerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching availability reports:', error);
      throw error;
    }
  },

  // Service Analytics--what services are available and how many appointments are scheduled for each? need to figure this out...
  async getServiceAnalytics(serviceId = null) {
    try {
      let query = supabase
        .from('service_analytics')
        .select('*');

      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching service analytics:', error);
      throw error;
    }
  },

  async getFilteredReports({
    startDate,
    endDate,
    practitionerId,
    serviceId,
    status
  }) {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          services:services!appointments_service_id_fkey (
            id,
            name,
            price
          ),
          practitioner:profiles!appointments_practitioner_id_fkey (
            first_name,
            last_name
          ),
          client:profiles!appointments_client_id_fkey (
            first_name,
            last_name
          )
        `);

      if (startDate) {
        const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
        query = query.gte('date', formattedStartDate);
      }
      
      if (endDate) {
        const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
        query = query.lte('date', formattedEndDate);
      }

      if (practitionerId) query = query.eq('practitioner_id', practitionerId);
      if (serviceId) query = query.eq('service_id', serviceId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching filtered reports:', error);
      throw error;
    }
  },

  async getPractitioners() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'practitioner');

      if (error) throw error;
      console.log('Fetched practitioners:', data);
      return data;
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      throw error;
    }
  },

  async getServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name')
        .eq('active', true);

      if (error) throw error;
      console.log('Fetched services:', data);
      return data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
};