// TODO: only admin can add elevated user roles (e.g. staff, admin)--this needs to be done here and updated in supabase
import { Typography } from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';
import { userService } from '@/services/api/users';
import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Chip, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Grid from '@mui/material/Grid2';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState({
    role: '',
    city: '',
    phone: ''
  });

  // Get unique cities for filter dropdown
  const uniqueCities = [...new Set(users.map(user => user.city).filter(Boolean))];
  
  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(users.map(user => user.role).filter(Boolean))];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Apply filters whenever filters or users change
  useEffect(() => {
    let result = users;

    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }

    if (filters.city) {
      result = result.filter(user => user.city === filters.city);
    }

    if (filters.phone) {
      result = result.filter(user => 
        user.phone && user.phone.toLowerCase().includes(filters.phone.toLowerCase())
      );
    }

    setFilteredUsers(result);
    setPage(0);
  }, [filters, users]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      city: '',
      phone: ''
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'practitioner':
        return 'primary';
      case 'staff':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                {uniqueRoles.map(role => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>City</InputLabel>
              <Select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                label="City"
              >
                <MenuItem value="">All Cities</MenuItem>
                {uniqueCities.map(city => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              name="phone"
              label="Phone Number"
              value={filters.phone}
              onChange={handleFilterChange}
              placeholder="Search phone..."
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography 
                color="primary" 
                sx={{ cursor: 'pointer' }}
                onClick={clearFilters}
              >
                Clear Filters
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>City</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>
                      {`${user.first_name} ${user.last_name}`}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.city || 'N/A'}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </PortalLayout>
  );
};

export default Users;