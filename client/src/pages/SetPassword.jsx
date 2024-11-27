// PUT ON BACKBURNER FOR NOW UNTIL SEND-EMAIL EDGE FUNCTIONS IN SUPABASE FIGURED OUT???

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Button, Typography, Alert } from '@mui/material';
import { authService } from '../services/api/auth';
import { FormField } from '../components/UI/FormField';
import { useFormValidation } from '../hooks/useFormValidation';
import { validatePassword, validateConfirmPassword } from '../utils/validation';

const SetPassword = () => {
  const [success, setSuccess] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const initialValues = {
    password: '',
    confirmPassword: ''
  };

  const validationRules = {
    password: validatePassword,
    confirmPassword: (value, formValues) => validateConfirmPassword(formValues.password, value)
  };

  const { 
    values, 
    errors, 
    handleChange,
    handleBlur, 
    handleSubmit, 
    setError 
  } = useFormValidation(initialValues, validationRules, onSubmit);

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (tokenChecked) return;

        const hashParams = new URLSearchParams(location.hash.substring(1));
        const queryParams = new URLSearchParams(location.search);
        
        console.log('Hash parameters:', Object.fromEntries(hashParams.entries()));
        console.log('Query parameters:', Object.fromEntries(queryParams.entries()));
        
        const token = hashParams.get('access_token') || 
                     queryParams.get('token') ||
                     location.hash.replace('#', '');
                     
        if (!token) {
          setError('general', 'No reset token found. Please check your email for a valid link or request a new one.');
          setTokenChecked(true);
          return;
        }

        const { error } = await authService.setSession(token);
        if (error) {
          setError('general', 'This password reset link has expired or is invalid. Please request a new link from your administrator.');
          setTokenChecked(true);
          return;
        }

        setTokenChecked(true);
      } catch (error) {
        console.error('Session check error:', error);
        if (error.message.includes('expired')) {
          setError('general', 'This password reset link has expired. Please request a new link from your administrator.');
        } else {
          setError('general', 'Unable to verify session. Please request a new password reset link.');
        }
        setTokenChecked(true);
      }
    };

    checkSession();
  }, [location, setError, tokenChecked]);

  async function onSubmit(formValues) {
    try {
      console.log('Submitting password update with:', formValues);
      await authService.updatePassword(formValues.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Password update error:', err);
      setError('general', err.message || 'Failed to update password');
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Set Your Password
        </Typography>
        
        {errors.general && (
          <Alert severity="error" sx={{ mt: 2, mb: 2, width: '100%' }}>
            {errors.general}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2, width: '100%' }}>
            Password set successfully! Redirecting...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <FormField
            name="password"
            label="New Password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(errors.password)}
            helperText={errors.password || "Password must contain at least 8 characters, including uppercase, lowercase, and numbers"}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          
          <FormField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={values.confirmPassword}
            onBlur={handleBlur}
            onChange={handleChange}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
            required
            fullWidth
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={success}
          >
            Set Password
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SetPassword;