import PropTypes from 'prop-types';
import { TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';

const UserFilters = ({ users, filters, setFilters, setFilteredUsers, isPractitionerView }) => {
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  
    let filteredResults = [...users];

    // apply filters
    if (newFilters.role && !isPractitionerView) {
      filteredResults = filteredResults.filter(user => user.role === newFilters.role);
    }
    if (newFilters.city) {
      filteredResults = filteredResults.filter(user => 
        user.city?.toLowerCase().includes(newFilters.city.toLowerCase())
      );
    }
    if (newFilters.specializations) {
      filteredResults = filteredResults.filter(user => 
        user.specializations?.toLowerCase().includes(newFilters.specializations.toLowerCase())
      );
    }
    if (newFilters.startDateFrom) {
      filteredResults = filteredResults.filter(user => 
        new Date(user.created_at) >= newFilters.startDateFrom
      );
    }
    if (newFilters.startDateTo) {
      filteredResults = filteredResults.filter(user => 
        new Date(user.created_at) <= newFilters.startDateTo
      );
    }
    if (newFilters.status) {
      if (newFilters.status.toLowerCase() === 'active') {
        filteredResults = filteredResults.filter(user => user.is_active === true || user.is_active == null);
      } else if (newFilters.status.toLowerCase() === 'inactive') {
        filteredResults = filteredResults.filter(user => user.is_active === false);
      }
    }

    
    console.log('Filtered results:', filteredResults);
    setFilteredUsers(filteredResults);
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3 }} fullWidth>
      {!isPractitionerView && (

      <Grid item xs={12} sm={6} md={3}>
      <FormControl fullWidth sx={{ minWidth: 150 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={filters.role}
          label="Role"
          defaultValue="All Roles"
          maxWidth
          onChange={(e) => handleFilterChange('role', e.target.value)}
        >
          <MenuItem value="">All Roles</MenuItem>
          <MenuItem value="client">Client</MenuItem>
          <MenuItem value="practitioner">Practitioner</MenuItem>
          <MenuItem value="staff">Staff</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </FormControl>
      </Grid>

        
      )}

      <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth  sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  defaultValue="All Statuses"
                  maxWidth
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="City"
          value={filters.city}
          onChange={(e) => handleFilterChange('city', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Phone"
          value={filters.phone}
          onChange={(e) => handleFilterChange('phone', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Button variant="contained" color="primary" onClick={() => handleFilterChange('reset', '')}>Reset Filters</Button>
      </Grid>
    </Grid>
  );
};

UserFilters.propTypes = {
  users: PropTypes.array.isRequired,
  filters: PropTypes.shape({
    role: PropTypes.string,
    city: PropTypes.string,
    phone: PropTypes.string,
    specializations: PropTypes.string,
    startDateFrom: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.string
    ]),
    startDateTo: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.string
    ]),
    status: PropTypes.string
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  setFilteredUsers: PropTypes.func.isRequired,
  isPractitionerView: PropTypes.bool
};


export default UserFilters;