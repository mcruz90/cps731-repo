import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  FormControl,
  FormHelperText,
  Button,
  Select,
  MenuItem
} from '@mui/material';
import PropTypes from 'prop-types';

// STRIPE INTEGRATION
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = ({ onSubmit, initialData, amount }) => {
  //STRIPE INTEGRATION
  const stripe = useStripe();
  const elements = useElements();


  // Form data with billing details
  const [formData, setFormData] = useState(initialData || {
    clientName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'CA',
  });

  const [errors, setErrors] = useState({});

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    try {
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: formData.clientName,
          email: formData.email,
          address: {
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
          },
        },
      });
  
      if (paymentMethodError) {
        setErrors((prev) => ({ ...prev, stripe: paymentMethodError.message }));
        return;
      }
  
      console.log('Payment Method ID:', paymentMethod.id);
      console.log('Amount:', amount);
  
      // Call the backend to process the payment
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: amount,
          billingDetails: {
            name: formData.clientName,
            email: formData.email,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.postalCode,
              country: formData.country,
            },
          },
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Payment processing error:', data);
        setErrors((prev) => ({ ...prev, stripe: data.error || 'Payment failed' }));
        return;
      }
  
      let paymentIntent = data.paymentIntent;
  
      // Check if payment requires additional action
      if (paymentIntent.status === 'requires_action') {
        // Handle additional authentication (e.g., 3D Secure)
        const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
          paymentIntent.client_secret
        );
  
        if (confirmError) {
          console.error('Error confirming card payment:', confirmError);
          setErrors((prev) => ({ ...prev, stripe: confirmError.message }));
          return;
        }
  
        paymentIntent = confirmedPaymentIntent;
      }
  
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful');
      }
  
      const chargeId = paymentIntent.latest_charge;

      console.log('payment intent details:', paymentIntent);

      if (!chargeId) {
        console.log('Payment Intent:', paymentIntent);
        throw new Error('Charge ID not found in Payment Intent');
      }

      // Call onSubmit with the Charge ID and billing details
      await onSubmit({
        paymentMethodId: paymentMethod.id,
        chargeId: chargeId,
        amount: amount,
        billingDetails: {
          name: formData.clientName,
          email: formData.email,
          address: {
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
          },
        },
      });
    } catch (err) {
      console.error('Payment processing error:', err);
      setErrors((prev) => ({ ...prev, stripe: err.message || 'An unexpected error occurred' }));
    }
  };  
  

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>

      <Grid container spacing={3}>
        {/* Billing Information */}
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.clientName}>
            <TextField
              required
              name="clientName"
              label="Name on Card"
              value={formData.clientName}
              onChange={handleChange}
              error={!!errors.clientName}
            />
            {errors.clientName && (
              <FormHelperText>{errors.clientName}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.email}>
            <TextField
              required
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
            />
            {errors.email && (
              <FormHelperText>{errors.email}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.address}>
            <TextField
              required
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
            />
            {errors.address && (
              <FormHelperText>{errors.address}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.city}>
            <TextField
              required
              name="city"
              label="City"
              value={formData.city}
              onChange={handleChange}
              error={!!errors.city}
            />
            {errors.city && (
              <FormHelperText>{errors.city}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.state}>
            <TextField
              required
              name="state"
              label="State/Province"
              value={formData.state}
              onChange={handleChange}
              error={!!errors.state}
            />
            {errors.state && (
              <FormHelperText>{errors.state}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.postalCode}>
            <TextField
              required
              name="postalCode"
              label="Postal Code"
              value={formData.postalCode}
              onChange={handleChange}
              error={!!errors.postalCode}
            />
            {errors.postalCode && (
              <FormHelperText>{errors.postalCode}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Select
              name="country"
              value={formData.country}
              onChange={handleChange}
            >
              <MenuItem value="CA">Canada</MenuItem>
              <MenuItem value="US">United States</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Card Details */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Card Information
          </Typography>
          <Box
            sx={{
              border: '1px solid',
              borderColor: errors.stripe ? 'error.main' : 'divider',
              borderRadius: 1,
              p: 2
            }}
          >
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </Box>
          {errors.stripe && (
            <FormHelperText error>{errors.stripe}</FormHelperText>
          )}
        </Grid>
      </Grid>

      <Button 
        variant="contained" 
        type="submit"
        disabled={!stripe}
        sx={{ mt: 3 }}
      >
        Confirm Payment
      </Button>
    </Box>
  );
};

PaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  amount: PropTypes.number.isRequired
};

export default PaymentForm;