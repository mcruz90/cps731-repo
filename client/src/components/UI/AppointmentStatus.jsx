// TODO: Add appointment status styling
// TODO: CONNECT TO SUPABASE
// TODO: RENDER APPOINTMENT STATUS IN CLIENT AND PRACTITIONER PORTALS

import './AppointmentStatus.css';
import PropTypes from 'prop-types';

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

AppointmentStatus.propTypes = {
  status: PropTypes.string.isRequired,
};
