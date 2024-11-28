import { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '@/components/Layout/PortalLayout';
import { appointmentService } from '@/services/api/appointments';
import { useAuth } from '@/hooks/useAuth';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';

const Appointments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modifyingAppointment, setModifyingAppointment] = useState(null);
  const [modifiedData, setModifiedData] = useState({
    date: null,
    time: null,
    notes: ''
  });
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // State for Snackbar
  // options: 'success' | 'error' | 'warning' | 'info'
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', 
  });

  // Function to handle closing the Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!user) return;
  
    try {
      setError(null);
      const data = await appointmentService.getAll(user.id);
  
      // Separate appointments into upcoming and past
      const today = new Date().toLocaleString();
  
      const upcoming = data.filter(appointment => {
        const appDate = new Date(appointment.date).toLocaleString();
        return appDate >= today && appointment.status !== 'cancelled';
      });
  
      const past = data.filter(appointment => {
        const appDate = new Date(appointment.date).toLocaleString();
        return appDate < today || appointment.status === 'cancelled';
      });
  
      // Set state for upcoming and past appointments
      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // fetch appointments when the component mounts
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // cancel appointment
  const handleCancel = async (appointmentId) => {
    try {
      await appointmentService.cancel(appointmentId);
      fetchAppointments();
        setSelectedAppointment(null);
      // show success Snackbar
      setSnackbar({
        open: true,
        message: 'Appointment canceled successfully.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError('Failed to cancel appointment. Please try again.');
      // Show error Snackbar
      setSnackbar({
        open: true,
        message: 'Failed to cancel appointment. Please try again.',
        severity: 'error',
      });
    }
  };
  // modify appointment
  const handleModify = async () => {
    try {
      if (!modifyingAppointment) return;

      // Prepare the updates
      const updates = {
        date: modifiedData.date.toISOString().split('T')[0],
        time: modifiedData.time,
        notes: modifiedData.notes,
      };

      await appointmentService.modify(modifyingAppointment.id, updates);
      fetchAppointments();
      setModifyingAppointment(null);
      setModifiedData({ date: null, time: null, notes: '' });

      // Show success Snackbar
      setSnackbar({
        open: true,
        message: 'Appointment modified successfully.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error modifying appointment:', error);
      setError('Failed to modify appointment. Please try again.');
      // Show error Snackbar
      setSnackbar({
        open: true,
        message: 'Failed to modify appointment. Please try again.',
        severity: 'error',
      });
    }
  };

  // opens the modification dialog
  const openModifyDialog = async (appointment) => {
    setModifyingAppointment(appointment);
    setModifiedData({
      date: new Date(appointment.date),
      time: appointment.time,
      notes: appointment.notes || ''
    });

    // Fetch available slots for the practitioner and service
    setLoadingSlots(true);
    setSlotError(null);
    try {
      const slots = await appointmentService.getAvailableSlotsForModification(
        appointment.practitioner_id,
        appointment.service_id,
        appointment.date
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setSlotError('Failed to fetch available slots. Please try a different date.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // handles the change in the date
  const handleDateChange = async (newDate) => {
    setModifiedData(prev => ({ ...prev, date: newDate, time: null }));
    setLoadingSlots(true);
    setSlotError(null);
    try {
      const slots = await appointmentService.getAvailableSlotsForModification(
        modifyingAppointment.practitioner_id,
        modifyingAppointment.service_id,
        newDate.toISOString().split('T')[0]
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setSlotError('Failed to fetch available slots. Please try a different date.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // gets the color of the status
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  // checks if the appointment date is in the past to prevent modifications
  const isAppointmentPast = (appointmentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appDate = new Date(appointmentDate);
    appDate.setHours(0, 0, 0, 0);
    return appDate < today;
  };

  // Check if the appointment can be modified based on its status and date.
  const canModifyAppointment = (appointment) => {
    return !isAppointmentPast(appointment.date) && appointment.status !== 'cancelled';
  };

    // Function to render appointments table
    const renderAppointmentsTable = (appointmentsList, title) => (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          {title}
        </Typography>
        {appointmentsList.length === 0 ? (
          <Typography variant="body1">No appointments to display.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label={`${title.toLowerCase()} table`}>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Practitioner</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointmentsList.map((appointment) => {
                  const formattedDate = new Date(appointment.date);
                  const isPast = isAppointmentPast(formattedDate);
                  return (
                    <TableRow
                      key={appointment.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        opacity: isPast ? 0.6 : 1,
                        backgroundColor: isPast ? 'action.hover' : 'inherit'
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {appointment.service_type}
                      </TableCell>
                      <TableCell>
                        <Box>
                          {formattedDate.toLocaleDateString()}
                          <br />
                          <Typography variant="body2" color="text.secondary">
                            {appointment.time}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{appointment.practitioner_name}</TableCell>
                      <TableCell>
                        <Chip label={appointment.status} color={getStatusColor(appointment.status)} />
                      </TableCell>
                      <TableCell>
                        {appointment.notes || '-'}
                      </TableCell>
                      <TableCell align="right">
                        {canModifyAppointment(appointment) && (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Modify Appointment">
                              <IconButton
                                size="small"
                                onClick={() => openModifyDialog(appointment)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Appointment">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setSelectedAppointment(appointment)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );

  return (
    <PortalLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          My Appointments
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/client/appointments/book')}
        >
          Book New Appointment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          {/* Upcoming Appointments Section */}
          {renderAppointmentsTable(upcomingAppointments, 'All Upcoming Appointments')}

          {/* Past Appointments Section */}
          {renderAppointmentsTable(pastAppointments, 'Past and Cancelled Appointments')}
        </>
      )}

      {/* Cancellation Dialog */}
      <Dialog
        open={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your appointment on{' '}
            {selectedAppointment && new Date(selectedAppointment.date).toLocaleDateString()}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAppointment(null)}>
            No, Keep It
          </Button>
          <Button 
            onClick={() => handleCancel(selectedAppointment.id)}
            color="error"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modification Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog
          open={!!modifyingAppointment}
          onClose={() => setModifyingAppointment(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Modify Appointment</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <DatePicker
                label="New Date"
                value={modifiedData.date}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              />

              {loadingSlots ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              ) : slotError ? (
                <Alert severity="error">{slotError}</Alert>
              ) : availableSlots.length === 0 ? (
                <Alert severity="info">No available slots on this date. Please choose another date.</Alert>
              ) : (
                <Autocomplete
                  options={availableSlots}
                  getOptionLabel={(option) => option.time}
                  value={availableSlots.find(slot => slot.time === modifiedData.time) || null}
                  onChange={(event, newValue) => {
                    setModifiedData(prev => ({ ...prev, time: newValue ? newValue.time : null }));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Available Time" variant="outlined" />
                  )}
                  isOptionEqualToValue={(option, value) => option.time === value.time}
                  disabled={!modifiedData.date}
                />
              )}

              <TextField
                label="Notes"
                multiline
                rows={4}
                value={modifiedData.notes}
                onChange={(e) => setModifiedData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModifyingAppointment(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleModify}
              variant="contained"
              disabled={!modifiedData.date || !modifiedData.time}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </PortalLayout>
  );
};

export default Appointments;