import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  FormControl,
  FormHelperText,
  InputAdornment,
  Button
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import PropTypes from 'prop-types';

const PaymentForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const validateForm = () => {
    const newErrors = {};

    // Card Name validation
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    // Card Number validation
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardNumberClean)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    // Expiry Date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (!/^\d\d\/\d\d$/.test(formData.expiryDate) ||
          parseInt(month) < 1 || 
          parseInt(month) > 12 ||
          (parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth))) {
        newErrors.expiryDate = 'Please enter a valid future expiry date (MM/YY)';
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      const paymentData = {
        cardName: formData.cardName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryDate: formData.expiryDate,
      };
      console.log('Submitting payment data:', paymentData);
      onSubmit(paymentData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>

      <Grid container spacing={3}>
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
          <FormControl fullWidth error={!!errors.cardNumber}>
            <TextField
              required
              name="cardNumber"
              label="Card Number"
              value={formData.cardNumber}
              onChange={handleChange}
              error={!!errors.cardNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardIcon />
                  </InputAdornment>
                ),
              }}
            />
            {errors.cardNumber && (
              <FormHelperText>{errors.cardNumber}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.expiryDate}>
            <TextField
              required
              name="expiryDate"
              label="Expiry Date"
              value={formData.expiryDate}
              onChange={handleChange}
              error={!!errors.expiryDate}
              placeholder="MM/YY"
            />
            {errors.expiryDate && (
              <FormHelperText>{errors.expiryDate}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.cvv}>
            <TextField
              required
              name="cvv"
              label="CVV"
              value={formData.cvv}
              onChange={handleChange}
              error={!!errors.cvv}
              type="password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />
            {errors.cvv && (
              <FormHelperText>{errors.cvv}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
      <Button 
        variant="contained" 
        onClick={handleSubmit}
        sx={{ mt: 2 }}
      >
        Confirm Payment Details
      </Button>
    </Box>
  );
};

export default PaymentForm;

PaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object
};
