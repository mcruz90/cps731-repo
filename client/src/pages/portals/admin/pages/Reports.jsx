import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { reportService } from '@/services/api/reports';
import PortalLayout from '@/components/Layout/PortalLayout';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    practitionerId: '',
    serviceId: '',
    status: ''
  });
  const [practitioners, setPractitioners] = useState([]);
  const [services, setServices] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    // Fetch practitioners and services for filter dropdowns
    const fetchFilterOptions = async () => {
      try {
        const [practitionersData, servicesData] = await Promise.all([
          reportService.getPractitioners(),
          reportService.getServices()
        ]);
        setPractitioners(practitionersData);
        setServices(servicesData);
      } catch {
        setError('Failed to load filter options');
      }
    };
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (field) => (date) => {
    setFilters(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const data = await reportService.getFilteredReports(filters);
      setReportData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Export data to PDF or CSV HERE
  };

  return (
    <PortalLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Detailed Reports
        </Typography>
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={handleDateChange('startDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={handleDateChange('endDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Practitioner"
                  value={filters.practitionerId}
                  onChange={handleFilterChange('practitionerId')}
                >
                  <MenuItem value="">All Practitioners</MenuItem>
                  {practitioners.map((practitioner) => (
                    <MenuItem key={practitioner.id} value={practitioner.id}>
                      {`${practitioner.first_name} ${practitioner.last_name}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Service"
                  value={filters.serviceId}
                  onChange={handleFilterChange('serviceId')}
                >
                  <MenuItem value="">All Services</MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={handleApplyFilters}
                  sx={{ mr: 2 }}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportData}
                >
                  Export Data
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <CircularProgress />
        ) : reportData ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Practitioner</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {new Date(appointment.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{appointment.services?.name}</TableCell>
                    <TableCell>
                      {`${appointment.practitioner?.first_name || ''} ${appointment.practitioner?.last_name || ''}`}
                    </TableCell>
                    <TableCell>
                      {`${appointment.client?.first_name || ''} ${appointment.client?.last_name || ''}`}
                    </TableCell>
                    <TableCell>{appointment.status}</TableCell>
                    <TableCell align="right">
                      ${appointment.services?.price?.toFixed(2) || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Box>
    </PortalLayout>
  );
};

export default Reports;