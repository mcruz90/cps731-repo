import { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
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
  Alert as MuiAlert,
  CircularProgress
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
import Autocomplete from '@mui/material/Autocomplete';
import PaymentForm from '@/pages/portals/client/pages/components/checkout/PaymentForm';
import { PaymentGateway } from '@/services/api/payment';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { authService } from '@/services/api/auth';
import { format, parseISO } from 'date-fns';

// fix this later. need this for now so stripe doesn't get recreated on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const getAppointmentDateTime = (appointment) => {
  const dateTimeString = `${appointment.date}T${appointment.time}`;
  return parseISO(dateTimeString);
};

const Appointments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modifyingAppointment, setModifyingAppointment] = useState(null);
  const [modifiedData, setModifiedData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  const session = authService.getCurrentSession();
  const accessToken = session?.access_token;

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();


  // options: 'success' | 'error' | 'warning' | 'info'
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', 
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Fee handling state variables
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [feeAppointment, setFeeAppointment] = useState(null);
  const [feeAction, setFeeAction] = useState(null);
  const [feePaymentError, setFeePaymentError] = useState(null);
  const [feePaymentLoading, setFeePaymentLoading] = useState(false);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      const data = await appointmentService.getAll(user.id);

      const now = new Date();

      const upcoming = data.filter(appointment => {
        const appDateTime = getAppointmentDateTime(appointment);
        return appDateTime >= now && appointment.status !== 'cancelled';
      });

      const past = data.filter(appointment => {
        const appDateTime = getAppointmentDateTime(appointment);
        return appDateTime < now || appointment.status === 'cancelled';
      });

      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = (appointment) => {
    const now = new Date();
    const appointmentDateTime = getAppointmentDateTime(appointment);
    const diffInHours = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      setFeeAppointment(appointment);
      setFeeAction('cancel');
      setFeeDialogOpen(true);
    } else {
      setSelectedAppointment(appointment);
    }
  };

  // Handle confirmation of cancellation (outside 24 hours)
  const handleConfirmCancel = async () => {
    try {
      // refund og appointment
      const refundResult = await PaymentGateway.refundAppointmentPayment(selectedAppointment.id);

      if (refundResult.success) {
        await appointmentService.cancel(selectedAppointment.id);
        setSnackbar({
          open: true,
          message: 'Appointment canceled successfully. The original payment has been refunded.',
          severity: 'success',
        });
      } else {
        
        setSnackbar({
          open: true,
          message: 'Failed to refund the original appointment payment. Please contact support.',
          severity: 'warning',
        });
      }
      fetchAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred. Please try again.',
        severity: 'error',
      });
    }
  };

  
  const handleModify = async (appointment) => {
    try {
      
      if (!appointment || appointment.nativeEvent) {
        console.error('Invalid appointment data received:', appointment);
        setSnackbar({
          open: true,
          message: 'Cannot modify appointment: Invalid appointment data',
          severity: 'error'
        });
        return;
      }

      
      if (!appointment.practitioner_id || !appointment.service_id || !appointment.date || !appointment.time) {
        console.error('Missing required appointment details:', appointment);
        setSnackbar({
          open: true,
          message: 'Cannot modify appointment: Missing required details',
          severity: 'error'
        });
        return;
      }

      const now = new Date();
      const appointmentDateTime = getAppointmentDateTime(appointment);
      const diffInHours = (appointmentDateTime - now) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        setFeeAppointment(appointment);
        setFeeAction('modify');
        setFeeDialogOpen(true);
      } else {
        await openModifyDialog(appointment);
      }
    } catch (error) {
      console.error('Error in handleModify:', error);
      setSnackbar({
        open: true,
        message: `Error modifying appointment: ${error.message}`,
        severity: 'error'
      });
    }
  };

  
  const handleFeeConfirm = () => {
    setFeeDialogOpen(false);
    setPaymentDialogOpen(true);
  };

  const handleFeeCancel = () => {
    setFeeDialogOpen(false);
    setFeeAppointment(null);
    setFeeAction(null);
  };

  // cancel/mod with the fee
  const handleFeePaymentSubmit = async (paymentData) => {
    setFeePaymentLoading(true);
    setFeePaymentError(null);
    try {

      const billingDetails = {
        ...paymentData.billingDetails,
        email: user.email,
      };

      console.log('Payment Data:', paymentData);
      console.log('Billing Details:', billingDetails);
    
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentData.paymentMethodId,
          amount: 50,
          currency: 'CAD',
          email: paymentData.email,
          billingDetails: paymentData.billingDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Payment processing error:', data);
        setFeePaymentError(data.error || 'Payment failed');
        setSnackbar({
          open: true,
          message: 'Failed to process the cancellation fee. Please try again.',
          severity: 'error',
        });
        return;
      }

      let paymentIntent = data.paymentIntent;

      // Check if payment requires additional action--need to think of something if this doesn't say 'success'
      if (paymentIntent.status === 'requires_action') {
        const stripe = await stripePromise;
        const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
          paymentIntent.client_secret
        );

        if (confirmError) {
          console.error('Error confirming card payment:', confirmError);
          setFeePaymentError(confirmError.message);
          setSnackbar({
            open: true,
            message: 'Failed to confirm the payment. Please try again.',
            severity: 'error',
          });
          return;
        }

        paymentIntent = confirmedPaymentIntent;
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful');
      }

      const chargeId = paymentIntent.latest_charge;

      if (!chargeId) {
        console.log('Payment Intent:', paymentIntent);
        throw new Error('Charge ID not found in Payment Intent');
      }

      console.log('Charge ID for fee payment:', chargeId);

      
      const paymentRecordResult = await PaymentGateway.processPayment(
        {
          chargeId: chargeId, 
          amount: 50, 
          currency: 'CAD',
          clientId: user.id,
          appointmentId: feeAppointment.id,
        },
        feeAppointment.id
      );

      if (!paymentRecordResult.success) {
        throw new Error(paymentRecordResult.error || 'Failed to record payment');
      }

      console.log('Cancellation fee payment recorded:', paymentRecordResult.payment);

      
      const refundResult = await PaymentGateway.refundAppointmentPayment(feeAppointment.id);

      if (refundResult.success) {
        
        if (feeAction === 'cancel') {
          await appointmentService.cancel(feeAppointment.id);
          setSnackbar({
            open: true,
            message: 'Appointment canceled successfully. A $50 fee has been charged, and the original payment has been refunded.',
            severity: 'success',
          });
        } else if (feeAction === 'modify') {
          
          await appointmentService.modify(feeAppointment.id, modifiedData);
          setSnackbar({
            open: true,
            message: 'Appointment modified successfully. A $50 fee has been charged, and the original payment has been refunded.',
            severity: 'success',
          });
        }
        
        fetchAppointments();
        setFeeAppointment(null);
        setFeeAction(null);
      } else {
        
        setFeePaymentError(refundResult.error);
        setSnackbar({
          open: true,
          message: 'Payment processed, but failed to refund the original appointment payment. Please contact support.',
          severity: 'warning',
        });
      }

    } catch (error) {
      console.error('Error processing fee payment and refund:', error);
      setFeePaymentError(error.message);
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred. Please try again.',
        severity: 'error',
      });
    } finally {
      setFeePaymentLoading(false);
      setPaymentDialogOpen(false);
      setFeeAppointment(null);
      setFeeAction(null);
    }
  };

  const openModifyDialog = async (appointment) => {
    try {
      
      console.log('Appointment data:', {
        practitionerId: appointment.practitioner_id,
        serviceId: appointment.service_id,
        date: appointment.date,
        time: appointment.time,
        appointmentData: appointment
      });

      if (!appointment.practitioner_id) {
        throw new Error('Practitioner ID is missing');
      }
      if (!appointment.service_id) {
        throw new Error('Service ID is missing');
      }
      if (!appointment.date) {
        throw new Error('Appointment date is missing');
      }
      if (!appointment.time) {
        throw new Error('Appointment time is missing');
      }

      setLoadingSlots(true);
      setSlotError(null);

      // Format the date to ISO string format (YYYY-MM-DD) -- there was an issue with dates being displayed two days behind for some reason
      const formattedDate = format(parseISO(appointment.date), 'yyyy-MM-dd');

      const availableSlots = await appointmentService.getAvailableSlotsForModification({
        practitionerId: appointment.practitioner_id,
        serviceId: appointment.service_id,
        date: formattedDate,
        excludeAppointmentId: appointment.id
      });

      setAvailableSlots(availableSlots);
      setModifyingAppointment(appointment);
      setModifiedData({
        date: formattedDate, 
        time: appointment.time,
        notes: appointment.notes || ''
      });
    } catch (error) {
      console.error('Error opening modify dialog:', error);
      setSlotError(`Unable to load available time slots: ${error.message}`);
      setSnackbar({
        open: true,
        message: `Failed to open modification dialog: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = async (newDate) => {
    try {
      if (!modifyingAppointment?.practitioner_id || !modifyingAppointment?.service_id) {
        throw new Error('Missing appointment details');
      }

      setLoadingSlots(true);
      setSlotError(null);

      const formattedDate = format(newDate, 'yyyy-MM-dd');

      const availableSlots = await appointmentService.getAvailableSlotsForModification({
        practitionerId: modifyingAppointment.practitioner_id,
        serviceId: modifyingAppointment.service_id,
        date: formattedDate,
        excludeAppointmentId: modifyingAppointment.id
      });

      setAvailableSlots(availableSlots);
      setModifiedData(prev => ({ ...prev, date: formattedDate }));
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Unable to load available time slots for selected date');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Gets the color of the appt status
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  // Checks if the appointment date is in the past to prevent modifications
  const isAppointmentPast = (appointmentDate, appointmentTime) => {
    const today = new Date();
    const appDateTime = getAppointmentDateTime({ date: appointmentDate, time: appointmentTime });
    return appDateTime < today;
  };

  // Check if the appointment can be modified based on its status and date.
  const canModifyAppointment = (appointment) => {
    return !isAppointmentPast(appointment.date, appointment.time) && appointment.status !== 'cancelled';
  };

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
                const formattedDate = format(parseISO(appointment.date), 'MMM dd, yyyy');
                return (
                  <TableRow
                    key={appointment.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      opacity: isAppointmentPast(appointment.date, appointment.time) ? 0.6 : 1,
                      backgroundColor: isAppointmentPast(appointment.date, appointment.time) ? 'action.hover' : 'inherit'
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {appointment.service_type}
                    </TableCell>
                    <TableCell>
                      <Box>
                        {formattedDate}
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
                              onClick={() => handleModify(appointment)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel Appointment">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancel(appointment)}
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

  // SAVE CHANGES
  const handleSaveChanges = async () => {
    if (!modifyingAppointment) {
      console.error('No appointment is being modified.');
      setSnackbar({
        open: true,
        message: 'No appointment is selected for modification.',
        severity: 'error',
      });
      return;
    }

    try {
      setLoadingSlots(true); 

      const updatedAppointment = {
        date: modifiedData.date,
        time: modifiedData.time,
        notes: modifiedData.notes,
      };

      console.log('Submitting modified appointment:', {
        appointmentId: modifyingAppointment.id,
        updatedData: updatedAppointment,
      });

      const result = await appointmentService.modify(modifyingAppointment.id, updatedAppointment);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Appointment modified successfully.',
          severity: 'success',
        });
        fetchAppointments();
        setModifyingAppointment(null);
      } else {
        throw new Error(result.error || 'Failed to modify appointment.');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setSnackbar({
        open: true,
        message: `Error saving changes: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setLoadingSlots(false);
    }
  };

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
            {selectedAppointment && parseISO(selectedAppointment.date).toLocaleDateString()}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAppointment(null)}>
            No, Keep It
          </Button>
          <Button
            onClick={handleConfirmCancel}
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
                value={modifiedData.date ? parseISO(modifiedData.date) : null}
                onChange={(newDate) => {
                  if (newDate) {
                    handleDateChange(newDate);
                    setModifiedData((prev) => ({
                      ...prev,
                      date: format(newDate, 'yyyy-MM-dd'),
                    }));
                  }
                }}
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
              onClick={handleSaveChanges}
              variant="contained"
              disabled={!modifiedData.date || !modifiedData.time}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* Fee Confirmation Dialog */}
      <Dialog
        open={feeDialogOpen}
        onClose={handleFeeCancel}
      >
        <DialogTitle>Cancellation/Modification Fee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are attempting to {feeAction === 'cancel' ? 'cancel' : 'modify'} your appointment within 24 hours of its scheduled time.
            A cancellation fee of <strong>$50</strong> will apply. Do you wish to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFeeCancel}>No, Go Back</Button>
          <Button 
            onClick={handleFeeConfirm} 
            variant="contained" 
            color="error"
          >
            Yes, Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fee Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process Cancellation/Modification Fee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please confirm the payment of <strong>$50</strong> to proceed with your {feeAction === 'cancel' ? 'cancellation' : 'modification'}.
          </DialogContentText>
          <Elements stripe={stripePromise}>
            <PaymentForm 
              onSubmit={handleFeePaymentSubmit}
              amount={50}
              initialData={{
                clientName: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`,
                email: user?.email || '',
                address: user?.profile?.address || '',
                city: user?.profile?.city || '',
                state: user?.profile?.state || '',
                postalCode: user?.profile?.postalCode || '',
                country: user?.profile?.country || 'CA',
                currency: 'CAD',
              }}
            />
          </Elements>
          {feePaymentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {feePaymentError}
            </Alert>
          )}
          {feePaymentLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

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