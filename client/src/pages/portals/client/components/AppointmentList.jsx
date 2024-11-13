// TODO: Add appointment list component here
// TODO: connect to appointments.jsx to display actual appointment data
// TODO: add reschedule and cancel functionality
// TODO: add expanded view component/library/etc and such when appointment is selected
// TODO: add messaging functionality to display messages between client and practitioner
import { useState } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { AppointmentStatus } from '@/components/UI/AppointmentStatus';
import { Button } from '@/components/Button';
import './AppointmentList.css';
import PropTypes from 'prop-types';


// fyi, each prop accepted by AppointmentList is defined below
// appointments: Array<{
//     id: string;
//     sessionType: string;
//     date: string;
//     time: string;
//     instructor/practitioner: string;
//     status: 'upcoming' | 'completed' | 'cancelled';
// }>


const AppointmentList = ({ 
    appointments = [],
    onCancelAppointment = () => {},
    onReschedule = () => {} }) => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);


  const bookSession = () => {
    window.location.href = '/book';
  }

  const handleCancel = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      onCancelAppointment(appointmentId);
    }
  };

  return (
    <div className="appointment-list">
      {appointments?.length === 0 ? (
        <div className="empty-state">
          <p>No appointments scheduled</p>
          <Button 
            variant="primary" 
            onClick={bookSession}
          >
            Book a Session
          </Button>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments?.map((appointment) => (
            <div 
              key={appointment.id} 
              className="appointment-card"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <div className="appointment-header">
                <h3>{appointment.sessionType}</h3>
                <AppointmentStatus status={appointment.status} />
              </div>
              
              <div className="appointment-details">
                <p>
                  <strong>Date: </strong>
                  {formatDate(appointment.date)}
                </p>
                <p>
                  <strong>Time: </strong>
                  {appointment.time}
                </p>
                <p>
                  <strong>Instructor: </strong>
                  {appointment.instructor}
                </p>
              </div>

              <div className="appointment-actions">
                {appointment.status === 'upcoming' && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReschedule(appointment.id);
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(appointment.id);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Use a Modal or some other expanded view component/library/etc and such when appointment is selected ??? */}
      {selectedAppointment && (
        <div className="appointment-modal">

          {/* Need to render appointment details here */}
          <Button onClick={() => setSelectedAppointment(null)}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;

// PropTypes
AppointmentList.propTypes = {
  appointments: PropTypes.array.isRequired,
  onCancelAppointment: PropTypes.func.isRequired,
  onReschedule: PropTypes.func.isRequired
};
