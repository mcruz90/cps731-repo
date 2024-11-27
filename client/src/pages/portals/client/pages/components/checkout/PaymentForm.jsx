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

const PaymentForm = ({ onSubmit, initialData }) => {
  //STRIPE INTEGRATION
  const stripe = useStripe();
  const elements = useElements();

  // Form data with billing details
  const [formData, setFormData] = useState(initialData || {
    cardName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'CA',
    currency: 'CAD'
  });

  const [errors, setErrors] = useState({});

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Name is required';
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
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: formData.cardName,
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

      if (error) {
        setErrors(prev => ({ ...prev, stripe: error.message }));
        return;
      }

      await onSubmit({
        paymentMethodId: paymentMethod.id,
        currency: formData.currency,
        billingDetails: {
          name: formData.cardName,
          email: formData.email,
          address: {
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
          },
        }
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrors(prev => ({ ...prev, stripe: 'An unexpected error occurred' }));
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
          <FormControl fullWidth error={!!errors.cardName}>
            <TextField
              required
              name="cardName"
              label="Name on Card"
              value={formData.cardName}
              onChange={handleChange}
              error={!!errors.cardName}
            />
            {errors.cardName && (
              <FormHelperText>{errors.cardName}</FormHelperText>
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
  initialData: PropTypes.object
};

export default PaymentForm;