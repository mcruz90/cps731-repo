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
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { adminService } from '@/services/api/admin';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PortalLayout from '@/components/Layout/PortalLayout';
import { useFormValidation } from '@/hooks/useFormValidation';
import FormField from '@/components/UI/FormField';

// PUT THIS ON THE BACKBURNER FOR NOW, SEND-EMAIL FUNCTIONALITY NOT IMPLEMENTED YET?? may have to ditch it
const AddUsers = () => {
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    emergencyContact: '',
    specializations: '',
    availability: '',
    startDate: '',
    sendWelcomeEmail: true,
  };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  } = useFormValidation(initialValues, {
    isStaffRegistration: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (formData) => {
    console.log('Starting form submission with data:', formData);
    setLoading(true);
    try {
      console.log('Calling adminService.createUser with:', formData);
      const result = await adminService.createUser(formData);
      console.log('User created successfully:', result);
      setSuccess(true);
      resetForm();
    } catch (err) {
      console.error('Error in handleAddUser:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
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
          
          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted, values:', values);
            handleSubmit(e, onSubmit);
          }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormField
                    name="firstName"
                    label="First Name"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.firstName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    name="lastName"
                    label="Last Name"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.lastName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    name="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={values.phone}
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
                      value={values.role}
                      onChange={handleChange}
                      label="Role"
                    >
                      <MenuItem value="practitioner">Practitioner</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.sendWelcomeEmail}
                          onChange={handleChange}
                          name="sendWelcomeEmail"
                        />
                      }
                      label="Send welcome email with login credentials"
                    />
                  </FormControl>
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
                    value={values.address}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    name="city"
                    value={values.city}
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
                      value={values.province}
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
                    value={values.postalCode}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {(values.role === 'staff' || values.role === 'practitioner') && (
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
                      value={values.startDate}
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
                      value={values.availabilityNotes}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>

                  {values.role === 'practitioner' && (
                    <Grid item xs={12}>
                      <TextField
                        label="Specializations"
                        name="specializations"
                        value={values.specializations}
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
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Staff member added successfully!
            </Alert>
          </Snackbar>

          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={() => setError(null)}
          >
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </PortalLayout>
  );
};

export default AddUsers;