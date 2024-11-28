import React from 'react';
import PropTypes from 'prop-types';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';

// List to display only confirmed upcoming appointments
const AppointmentList = ({ appointments, readOnly }) => {
  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status.toLowerCase() === 'confirmed'
  );

  if (confirmedAppointments.length === 0) {
    return (
      <Typography variant="body1">
        No confirmed appointments to display.
      </Typography>
    );
  }

  return (
    <List>
      {confirmedAppointments.map((appointment) => {
        const formattedDate = new Date(appointment.date).toLocaleDateString();

        return (
          <React.Fragment key={appointment.id}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                !readOnly && (
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => {
                        console.log(`Edit appointment ${appointment.id}`);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="cancel"
                      onClick={() => {
                        console.log(`Cancel appointment ${appointment.id}`);
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )
              }
            >
              <ListItemText
                primary={`${appointment.sessionType} with ${appointment.instructor}`}
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Date:</strong> {formattedDate}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Time:</strong> {appointment.time}
                    </Typography>
                    {appointment.notes && (
                      <Typography variant="body2" color="textSecondary">
                        <strong>Notes:</strong> {appointment.notes}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      <strong>Status:</strong> {appointment.status}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        );
      })}
    </List>
  );
};

AppointmentList.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      sessionType: PropTypes.string.isRequired,
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
      time: PropTypes.string.isRequired,
      instructor: PropTypes.string.isRequired,
      notes: PropTypes.string,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  readOnly: PropTypes.bool,
};

export default AppointmentList;
