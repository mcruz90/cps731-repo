import { useState } from 'react';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Typography, Alert, Snackbar } from '@mui/material';
import { adminService } from '@/services/api/admin';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddUsers = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userRole: '',
    password: ''
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
        userName: '',
        userEmail: '',
        userRole: '',
        password: ''
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
          <Typography variant="h6" gutterBottom>
            Add User with Elevated Role
          </Typography>
          
          <form onSubmit={handleAddUser}>
            <TextField
              label="Full Name"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              type="email"
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Role</InputLabel>
              <Select
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                label="Role"
              >
                <MenuItem value="practitioner">Practitioner</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Adding User...' : 'Add User'}
            </Button>
          </form>

          <Snackbar 
            open={success} 
            autoHideDuration={6000} 
            onClose={() => setSuccess(false)}
          >
            <Alert severity="success">
              User added successfully!
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