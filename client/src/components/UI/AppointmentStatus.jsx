// AppointmentStatus.jsx component

import './AppointmentStatus.css';

const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];

export const AppointmentStatus = ({ status }) => {
  return (
    <>
        <div className={`appointment-status ${status}`}>

            {status === statuses.includes(status) && (
                <div className={status}>{status}</div>
            )}

        </div>
        
    </>
  );
};
