import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const EditUserDialog = ({ open, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    city: '',
    province: '',
    postal_code: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        address: user.address || '',
        city: user.city || '',
        province: user.province || '',
        postal_code: user.postal_code || ''
      });
    }
  }, [user]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={handleChange('first_name')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={handleChange('last_name')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleChange('phone')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={handleChange('role')}
                >
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="practitioner">Practitioner</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange('city')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Province"
                value={formData.province}
                onChange={handleChange('province')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postal_code}
                onChange={handleChange('postal_code')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

EditUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default EditUserDialog;