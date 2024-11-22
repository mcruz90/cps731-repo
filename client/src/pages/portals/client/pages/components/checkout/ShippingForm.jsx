import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  FormControl,
  FormHelperText,
  CircularProgress,
  FormControlLabel,
  Switch,
  Collapse,
  Alert,
  Button
} from '@mui/material';
import PropTypes from 'prop-types';
import { profileService } from '@/services/api/profile';
import { useAuth } from '@/hooks/useAuth';

const ShippingForm = ({ onSubmit, initialData }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({});
  const [formData, setFormData] = useState(initialData || {
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: ''
  });
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const fields = {
      firstName: 'First name',
      lastName: 'Last name',
      address: 'Address',
      city: 'City',
      province: 'Province',
      postalCode: 'Postal code',
      phone: 'Phone number'
    };

    Object.entries(fields).forEach(([key, label]) => {
      if (!formData[key]?.trim()) {
        newErrors[key] = `${label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await profileService.getProfile(user.id);
      
      if (profile) {
        const profileFormData = {
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          address: profile.address || '',
          city: profile.city || '',
          province: profile.province || '',
          postalCode: profile.postal_code || '',
          phone: profile.phone || ''
        };
        setProfileData(profileFormData);
        setFormData(profileFormData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id, fetchUserProfile]);

  const handleToggleAddress = useCallback((event) => {
    setUseDifferentAddress(event.target.checked);
    if (!event.target.checked) {
      setFormData(profileData);
      setErrors({});
    }
  }, [profileData]);

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

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(useDifferentAddress ? formData : profileData);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Shipping Address
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && profileData.address && (
        <FormControlLabel
          control={
            <Switch
              checked={useDifferentAddress}
              onChange={handleToggleAddress}
              color="primary"
            />
          }
          label="Ship to a different address"
          sx={{ mb: 2 }}
        />
      )}

      <Collapse in={!useDifferentAddress && !loading && profileData.address}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Default Shipping Address:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profileData.firstName} {profileData.lastName}<br />
            {profileData.address}<br />
            {profileData.city}, {profileData.province} {profileData.postalCode}<br />
            {profileData.phone}
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Use This Address
          </Button>
        </Box>
      </Collapse>

      <Collapse in={useDifferentAddress || !profileData.address}>
        <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.firstName}>
              <TextField
                required
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
              />
              {errors.firstName && (
                <FormHelperText>{errors.firstName}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.lastName}>
              <TextField
                required
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
              />
              {errors.lastName && (
                <FormHelperText>{errors.lastName}</FormHelperText>
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
            <FormControl fullWidth error={!!errors.province}>
              <TextField
                required
                name="province"
                label="Province"
                value={formData.province}
                onChange={handleChange}
                error={!!errors.province}
              />
              {errors.province && (
                <FormHelperText>{errors.province}</FormHelperText>
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
            <FormControl fullWidth error={!!errors.phone}>
              <TextField
                required
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
              />
              {errors.phone && (
                <FormHelperText>{errors.phone}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
};

export default ShippingForm;

ShippingForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

