import { api } from './index';


// get all appointments
// cancel an appointment
// reschedule an appointment
export const appointmentsService = {
  getAppointments: () => api.get('/api/v1/appointments'),
  cancelAppointment: (id) => api.delete(`/api/v1/appointments/${id}`),
  rescheduleAppointment: (id, data) => api.put(`/api/v1/appointments/${id}`, data),

};