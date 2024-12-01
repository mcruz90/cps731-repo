import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/api/profile';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Alert,
  Snackbar,
  CircularProgress 
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PortalLayout from '@/components/Layout/PortalLayout';

export default function Profile() {
  console.log('Profile component rendering');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    province: '',
    postalCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      console.log('fetchProfile starting, user:', user);
      
      try {
        if (!user?.id) {
          console.log('No user ID available');
          return;
        }

        console.log('Calling profileService.getProfile');
        const profileData = await profileService.getProfile(user.id);
        console.log('Profile data received:', profileData);

        if (!isMounted) {
          console.log('Component unmounted, skipping state update');
          return;
        }

        if (profileData) {
          setFormData({
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            phone: profileData.phone || '',
            email: user.email || '',
            address: profileData.address || '',
            city: profileData.city || '',
            province: profileData.province || '',
            postalCode: profileData.postal_code || ''
          });
          console.log('Form data updated');
        } else {
          console.log('No profile data received');
          setError('No profile data found');
        }
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updatedProfile = await profileService.updateProfile(user.id, formData);
      console.log('Profile updated:', updatedProfile);
      setSuccess(true);
      
      setFormData(prev => ({
        ...prev,
        firstName: updatedProfile.first_name || '',
        lastName: updatedProfile.last_name || '',
        phone: updatedProfile.phone || '',
        address: updatedProfile.address || '',
        city: updatedProfile.city || '',
        province: updatedProfile.province || '',
        postalCode: updatedProfile.postal_code || ''
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading profile...</Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <PortalLayout>
      <Box>
        <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Profile Settings
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                type="email"
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </form>

        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success">
            Profile updated successfully!
          </Alert>
        </Snackbar>

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
        >
          <Alert severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Paper>
      </Box>
    </PortalLayout>
  );
}