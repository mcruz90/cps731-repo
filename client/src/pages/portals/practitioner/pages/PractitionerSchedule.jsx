import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '@/hooks/useAuth';
import { practitionerService } from '@/services/api/practitioner';
import AppointmentDetailsModal from './components/AppointmentDetailsModal';
import AddAvailabilityDialog from './components/dialogs/AddAvailabilityDialog';
import EditAvailabilityDialog from './components/dialogs/EditAvailabilityDialog';
import ActionConfirmDialog from './components/dialogs/ActionConfirmDialog';
import AvailabilityDetailsModal from './components/AvailabilityDetailsModal';
import Tooltip from '@mui/material/Tooltip';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const CalendarContainer = styled(Box)(({ theme }) => ({
  '& .fc-toolbar': {
    backgroundColor: '#ffffff',
    color: theme.palette.primary.contrastText,
    border: 'none',
  },
  '& .fc-button': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.contrastText,
    border: 'none',
    borderRadius: theme.shape.borderRadius,
    padding: '6px 12px',
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    textTransform: theme.typography.button.textTransform,
    letterSpacing: theme.typography.button.letterSpacing,
    transition: 'background-color 0.3s, transform 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
      transform: 'translateY(-2px)',
    },
  },
  '& .fc-event.fc-event-start': {
    fontSize: '0.7rem',
  },
}));

const PractitionerSchedule = () => {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('both');
  const [availabilityDetailsOpen, setAvailabilityDetailsOpen] = useState(false);
  const [clientCounts, setClientCounts] = useState({});

  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await practitionerService.getServices();
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const fetchClientCounts = async () => {
      try {
        const counts = await practitionerService.getClientCounts(user.id);
        setClientCounts(counts);
        console.log('Booking Counts:', counts);
      } catch (error) {
        console.error('Error fetching client counts:', error);
      }
    };

    fetchClientCounts();
  }, [user.id]);

  const computeEndTime = (timeStr, durationMinutes) => {
    
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, seconds, 0);
    start.setMinutes(start.getMinutes() + durationMinutes);
   
    const endHours = start.getHours().toString().padStart(2, '0');
    const endMinutes = start.getMinutes().toString().padStart(2, '0');
    const endSeconds = start.getSeconds().toString().padStart(2, '0');
    return `${endHours}:${endMinutes}:${endSeconds}`;
  };

  // Fetch appointments and availability based on filter and refresh
  useEffect(() => {
    const loadData = async () => {
      try {
        let availabilityData = [];
        let appointmentsData = [];

        if (filter === 'availability' || filter === 'both') {
          availabilityData = await practitionerService.getAvailability(user.id);
        }

        if (filter === 'appointment' || filter === 'both') {
          appointmentsData = await practitionerService.getConfirmedAppointmentsWithDetails(user.id);
          console.log('Appointments Data:', appointmentsData);
        }

        const formattedAvailability = availabilityData.map((slot) => ({
          id: `availability-${slot.id}`,
          title: slot.name || 'Availability',
          start: `${slot.date}T${slot.start_time}`,
          end: `${slot.date}T${computeEndTime(slot.start_time, slot.duration)}`,
          color: '#28a745',
          eventType: 'availability',
          extendedProps: {
            serviceName: slot.name || 'Availability',
            duration: slot.duration,
            service_id: slot.service_id,
            availability_id: slot.id, 
          },
        }));

        const appointmentIds = appointmentsData.map((apt) => apt.id);
        console.log('Appointment IDs:', appointmentIds);

        const bookingCounts = appointmentsData.reduce((acc, apt) => {
          acc[apt.id] = clientCounts[apt.id] || 0;
          return acc;
        }, {});
        console.log('Booking Counts:', bookingCounts);

        const formattedAppointments = appointmentsData.map((appointment) => ({
          id: `appointment-${appointment.id}`,
          title: `${appointment.service_name} (${bookingCounts[appointment.id] || 0})`,
          start: `${appointment.date}T${appointment.time}`,
          end: `${appointment.date}T${computeEndTime(appointment.time, appointment.duration)}`,
          color: '#1976D2',
          eventType: 'appointment',
          extendedProps: {
            serviceName: appointment.service_name || 'Service',
            clientName: appointment.client_name || 'No Client',
            clientEmail: appointment.client_email || '',
            service_id: appointment.service_id,
            availability_id: appointment.availability_id,
            clientCount: bookingCounts[appointment.id] || 0,
            time: appointment.time,
            duration: appointment.duration,
          },
        }));

        let mergedEvents = [];
        if (filter === 'availability') {
          mergedEvents = [...formattedAvailability];
        } else if (filter === 'appointment') {
          mergedEvents = [...formattedAppointments];
        } else if (filter === 'both') {
          mergedEvents = [...formattedAvailability, ...formattedAppointments];
        }

        console.log('Merged Events:', mergedEvents);

        setEvents(mergedEvents);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [filter, user.id, refresh, clientCounts]);

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  // Handle event click to open details modal
  const handleEventClick = (clickInfo) => {
    const { event } = clickInfo;
    const { extendedProps } = event;
    if (event.extendedProps.eventType === 'appointment') {
      setSelectedAppointment({
        id: event.id.replace('appointment-', ''),
        serviceName: extendedProps.serviceName,
        clientName: extendedProps.clientName,
        clientEmail: extendedProps.clientEmail,
        service_id: extendedProps.service_id,
        availability_id: extendedProps.availability_id,
        time: extendedProps.time,
        duration: extendedProps.duration,
        clientCount: extendedProps.clientCount,
      });
      setModalOpen(true);
      console.log('Selected Appointment:', selectedAppointment);
    }
    // Handle AVAILABILITY clicks in the calendar
    else if (event.extendedProps.eventType === 'availability') {
      setSelectedSlot({
        id: event.id.replace('availability-', ''),
        name: extendedProps.serviceName,
        date: event.startStr.split('T')[0],
        start_time: event.startStr.split('T')[1],
        duration: extendedProps.duration,
        service_id: extendedProps.service_id,
      });
      setAvailabilityDetailsOpen(true);
    }
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleEditAvailability = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteAvailability = () => {
    setDeleteDialogOpen(true);
  };

  const triggerRefresh = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <CalendarContainer>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <FormControl variant="outlined" size="small">
          <InputLabel id="filter-label">Filter</InputLabel>
          <Select labelId="filter-label" value={filter} onChange={handleFilterChange} label="Filter">
            <MenuItem value="both">Both</MenuItem>
            <MenuItem value="availability">Availability</MenuItem>
            <MenuItem value="appointment">Appointments</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
          Add Availability
        </Button>
      </Box>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={(eventInfo) => {
          const { event } = eventInfo;
          const { title, extendedProps, eventType } = event;
          const tooltipTitle =
            eventType === 'appointment'
              ? `${extendedProps.serviceName} - ${extendedProps.clientName} (${extendedProps.clientEmail})`
              : `Availability: ${extendedProps.serviceName}`;
          return (
            <Tooltip title={tooltipTitle} arrow>
              <Box
                sx={{
                  backgroundColor: event.backgroundColor,
                  color: '#FFFFFF',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{title}</span>
                {eventType === 'availability' && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlot({
                        id: event.id.replace('availability-', ''),
                        name: extendedProps.serviceName,
                        date: event.startStr.split('T')[0],
                        start_time: event.startStr.split('T')[1],
                        duration: extendedProps.duration,
                        service_id: extendedProps.service_id,
                      });
                      setDeleteDialogOpen(true);
                    }}
                    sx={{ ml: 1, color: 'white' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Tooltip>
          );
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        height="auto"
        eventClick={handleEventClick}
      />
      {/* Availability Details Modal */}
      {selectedSlot && (
        <AvailabilityDetailsModal
          open={availabilityDetailsOpen}
          onClose={() => setAvailabilityDetailsOpen(false)}
          availability={selectedSlot}
          onEdit={handleEditAvailability}
          onDelete={handleDeleteAvailability}
        />
      )}
      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          appointment={selectedAppointment}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}
      {/* Add Availability Dialog */}
      <AddAvailabilityDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={async (newSlot) => {
          try {
            newSlot.practitioner_id = user.id;
            await practitionerService.addAvailability(newSlot);
            triggerRefresh();
            setAddDialogOpen(false);
          } catch (error) {
            console.error('Error adding availability:', error);
          }
        }}
        services={services}
      />
      {/* Edit Availability Dialog */}
      {selectedSlot && (
        <EditAvailabilityDialog
          open={editDialogOpen}
          slot={selectedSlot}
          onClose={() => setEditDialogOpen(false)}
          onSave={async (updatedSlot) => {
            try {
              await practitionerService.updateAvailability(updatedSlot.id, updatedSlot);
              triggerRefresh();
              setEditDialogOpen(false);
            } catch (error) {
              console.error('Error updating availability:', error);
            }
          }}
          services={services}
        />
      )}
      {/* Action Confirm Dialog */}
      <ActionConfirmDialog
        open={deleteDialogOpen}
        action="delete"
        item={selectedSlot}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          try {
            await practitionerService.deleteAvailability(selectedSlot.id);
            triggerRefresh();
            setDeleteDialogOpen(false);
          } catch (error) {
            console.error('Error deleting availability:', error);
          }
        }}
      />
    </CalendarContainer>
  );
};

export default PractitionerSchedule;