import PropTypes from 'prop-types';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// filters the users based on the role, city, phone, and status
const UserFilters = ({ users, filters, setFilters, setFilteredUsers }) => {
  const handleFilterChange = (field) => (event) => {
    const newFilters = {
      ...filters,
      [field]: event.target.value
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters) => {
    let filtered = [...users];

    if (currentFilters.role) {
      filtered = filtered.filter(user => user.role === currentFilters.role);
    }
    if (currentFilters.city) {
      filtered = filtered.filter(user => 
        user.city?.toLowerCase().includes(currentFilters.city.toLowerCase())
      );
    }
    if (currentFilters.phone) {
      filtered = filtered.filter(user => 
        user.phone?.includes(currentFilters.phone)
      );
    }
    if (currentFilters.status === 'active') {
      filtered = filtered.filter(user => user.is_active);
    } else if (currentFilters.status === 'inactive') {
      filtered = filtered.filter(user => !user.is_active);
    }

    setFilteredUsers(filtered);
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={filters.role}
            label="Role"
            onChange={handleFilterChange('role')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="client">Client</MenuItem>
            <MenuItem value="practitioner">Practitioner</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="City"
          value={filters.city}
          onChange={handleFilterChange('city')}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Phone"
          value={filters.phone}
          onChange={handleFilterChange('phone')}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={handleFilterChange('status')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

UserFilters.propTypes = {
  users: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  setFilteredUsers: PropTypes.func.isRequired
};

export default UserFilters;