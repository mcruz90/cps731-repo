// TODO: add currency formatting and conversion (specificy three currencies that are accepted)

import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { format } from 'date-fns';

// PAYPAL INTEGRATION
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// STRIPE INTEGRATION
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './components/checkout/PaymentForm';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

import { PaymentGateway } from '@/services/api/payment';
import { BookingService } from '@/services/api/booking';

export default function ConfirmDetails({ 
  formData,
  onConfirm,
  loading,
  error 
}) {
  const [notes, setNotes] = useState(formData.notes || '');

  // PAYMENT/STRIPE INTEGRATION
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const handlePaymentSubmit = async (paymentData) => {
    try {
      // First create the appointment
      const appointmentResult = await BookingService.createAppointmentWithPayment(formData);
      
      if (!appointmentResult.success) {
        throw new Error(appointmentResult.error);
      }

      // Then process the payment with the appointment ID
      const paymentResult = await PaymentGateway.processPayment(
        {
          ...paymentData,
          amount: formData.price,
          clientId: formData.clientId,
          serviceName: formData.serviceName
        },
        appointmentResult.appointment.id
      );
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }

      // Update appointment status to confirmed
      await BookingService.updateAppointmentStatus(appointmentResult.appointment.id, 'confirmed');

      // Call parent's onConfirm with both results
      await onConfirm({
        success: true,
        appointment: appointmentResult.appointment,
        payment: paymentResult.payment
      });

    } catch (error) {
      console.error('Error in payment/booking process:', error);
      throw new Error(`Booking failed: ${error.message}`);
    }
  };

  const handleInitialConfirm = () => {
    setPaymentStep(true);
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  return (
    <Box>
      {!paymentStep ? (
        <Box component="form" onSubmit={handleInitialConfirm}>
          <Typography variant="h6" gutterBottom>
            Confirm Booking Details
          </Typography>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              {/* Service Details */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Service
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary={formData.serviceName}
                      secondary={`Duration: ${formData.duration} minutes`}
                    />
                  </ListItem> 
                </List>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Date and Time */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Date & Time
                </Typography>
                <List dense>
                <ListItem>
                <ListItemText 
                  primary={formData.date ? format(formData.date, 'EEEE, MMMM d, yyyy') : 'Not selected'}
                  secondary={formData.time ? format(new Date(`2000-01-01T${formData.time}`), 'h:mm a') : 'Not selected'}
                    />
                  </ListItem>
                </List>
              </Grid>

              {/* Practitioner */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Healthcare Provider
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary={formData.practitionerName}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Additional Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Add any special requests or notes for your appointment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  variant="outlined"
                />
              </Grid>

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">
                    {error}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Booking Summary */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light' }}>
            <Typography variant="subtitle1" color="primary.contrastText" gutterBottom>
              Booking Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  color: 'primary.contrastText'
                }}>
                  <Typography variant="body1">
                    {formData.serviceName}
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(formData.price || 0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              Proceed to Payment
            </Button>
          </Box>
        </Box>
      ) : (
        // STRIPE INTEGRATION - PAYMENT FORM
        <Box>
          <Typography variant="h6" gutterBottom>
            Payment Information
          </Typography>

        {/* Payment method selection */}
        <Box sx={{ mb: 3 }}>
            <Button
              variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('card')}
              sx={{ mr: 2 }}
            >
              Pay with Card
            </Button>
            <Button
              variant={paymentMethod === 'paypal' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('paypal')}
            >
              Pay with PayPal
            </Button>
          </Box>

          {paymentMethod === 'card' && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                onSubmit={handlePaymentSubmit}
                amount={formData.price}
                loading={loading}
              />
            </Elements>
          )}

          {/* PAYPAL INTEGRATION -- need to fix this and make sure it works with payment flow like Stripe does */}
          {paymentMethod === 'paypal' && (
                  <PayPalScriptProvider
                    options={{
                      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
                      currency: 'USD',
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Pay with PayPal
                    </Typography>
                    <PayPalButtons
                      style={{ layout: 'vertical' }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: formData.price, 
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then((details) => {
                          console.log('Transaction completed by: ', details.payer.name.given_name);
                          alert('Payment Successful!');
                        });
                      }}
                      onError={(err) => {
                        console.error('PayPal Checkout Error: ', err);
                        alert('Payment could not be completed. Please try again.');
                      }}
                    />
                  </PayPalScriptProvider>
                )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}

ConfirmDetails.propTypes = {
  formData: PropTypes.shape({
    serviceId: PropTypes.string.isRequired,
    serviceName: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date),
    time: PropTypes.string,
    duration: PropTypes.number,
    price: PropTypes.number,
    practitionerId: PropTypes.string,
    practitionerName: PropTypes.string,
    notes: PropTypes.string,
    clientId: PropTypes.string.isRequired
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string
};