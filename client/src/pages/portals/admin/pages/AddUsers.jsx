import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Card, 
  CardContent, 
  Typography, 
  Alert, 
  Snackbar,
  Grid,
  Divider
} from '@mui/material';
import { adminService } from '@/services/api/admin';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddUsers = () => {
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    
    // Address Information
    address: '',
    city: '',
    province: '',
    postalCode: '',
    
    // Professional Information
    emergencyContact: '',
    specializations: '', 
    availability: '',
    startDate: '',
    
    // Additional Settings
    sendWelcomeEmail: true,
    requirePasswordChange: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await adminService.createUser(formData);
      console.log('User created successfully:', result);
      
      setSuccess(true);
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        emergencyContact: '',
        specializations: '',
        availability: '',
        startDate: '',
        sendWelcomeEmail: true,
        requirePasswordChange: true
      });
    } catch (err) {
      console.error('Error in handleAddUser:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/admin"
          startIcon={<ArrowBackIcon />}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Add New Staff Member
          </Typography>
          
          <form onSubmit={handleAddUser}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Role"
                    >
                      <MenuItem value="practitioner">Practitioner</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Temporary Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Address Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Street Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Province</InputLabel>
                    <Select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      label="Province"
                    >
                      <MenuItem value="ON">Ontario</MenuItem>
                      <MenuItem value="BC">British Columbia</MenuItem>
                      <MenuItem value="QC">Quebec</MenuItem>
                      <MenuItem value="AB">Alberta</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Postal Code"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {(formData.role === 'staff' || formData.role === 'practitioner') && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Professional Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Date"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Availability Notes"
                      name="availabilityNotes"
                      value={formData.availabilityNotes}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>

                  {formData.role === 'practitioner' && (
                    <Grid item xs={12}>
                      <TextField
                        label="Specializations"
                        name="specializations"
                        value={formData.specializations}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={2}
                        helperText="Enter specializations separated by commas"
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              size="large"
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? 'Adding Staff Member...' : 'Add Staff Member'}
            </Button>
          </form>

          <Snackbar 
            open={success} 
            autoHideDuration={6000} 
            onClose={() => setSuccess(false)}
          >
            <Alert severity="success">
              Staff member added successfully!
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
        </CardContent>
      </Card>
    </>
  );
};

export default AddUsers;