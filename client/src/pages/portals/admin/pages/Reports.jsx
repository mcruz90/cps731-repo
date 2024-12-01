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
  Alert,
  Snackbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { reportService } from '@/services/api/reports';
import PortalLayout from '@/components/Layout/PortalLayout';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    
    const fetchFilterOptions = async () => {
      try {
        console.log('Fetching practitioners and services for filters');
        const [practitionersData, servicesData] = await Promise.all([
          reportService.getPractitioners(),
          reportService.getServices()
        ]);
        console.log('Fetched practitioners:', practitionersData);
        console.log('Fetched services:', servicesData);
        setPractitioners(practitionersData);
        setServices(servicesData);
      } catch (err) {
        console.error('Error fetching filter options:', err);
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
      console.log('Applying filters:', filters);
      setLoading(true);
      const data = await reportService.getFilteredReports(filters);
      console.log('Filtered reports data:', data);
      setReportData(data);
      setError(null);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError(err.message);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!reportData || reportData.length === 0) {
      alert('No data available to export.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Detailed Report', 14, 22);

    doc.setFontSize(11);
    doc.text('Filters:', 14, 30);
    const filterTexts = [];
    if (filters.startDate) {
      filterTexts.push(`Start Date: ${filters.startDate.toLocaleDateString()}`);
    }
    if (filters.endDate) {
      filterTexts.push(`End Date: ${filters.endDate.toLocaleDateString()}`);
    }
    if (filters.practitionerId) {
      const practitioner = practitioners.find(p => p.id === filters.practitionerId);
      const practitionerName = practitioner ? `${practitioner.first_name} ${practitioner.last_name}` : 'Unknown';
      filterTexts.push(`Practitioner: ${practitionerName}`);
    }
    if (filters.serviceId) {
      const service = services.find(s => s.id === filters.serviceId);
      const serviceName = service ? service.name : 'Unknown';
      filterTexts.push(`Service: ${serviceName}`);
    }
    if (filters.status) {
      filterTexts.push(`Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`);
    }

    doc.text(filterTexts, 14, 35);

    // Table Headers
    const tableColumn = ["Date", "Service", "Practitioner", "Client", "Status", "Price"];
    const tableRows = [];

    // Table Rows
    reportData.forEach(appointment => {
      const appointmentDate = new Date(appointment.date).toLocaleDateString();
      const serviceName = appointment.services?.name || 'N/A';
      const practitionerName = `${appointment.practitioner?.first_name || ''} ${appointment.practitioner?.last_name || ''}`.trim() || 'N/A';
      const clientName = `${appointment.client?.first_name || ''} ${appointment.client?.last_name || ''}`.trim() || 'N/A';
      const status = appointment.status || 'N/A';
      const price = `$${appointment.services?.price?.toFixed(2) || '0.00'}`;

      const row = [appointmentDate, serviceName, practitionerName, clientName, status, price];
      tableRows.push(row);
    });

    // Add AutoTable
    doc.autoTable({
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      alternateRowStyles: { fillColor: [238, 238, 238] },
      margin: { horizontal: 14 },
      theme: 'striped'
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    const date = new Date();
    const dateStr = date.toLocaleDateString();
    doc.text(`Report generated on ${dateStr}`, 14, pageHeight - 10);

    // Save PDF
    doc.save('detailed_report.pdf');
    setOpenSnackbar(true);
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
                    <TableCell>{appointment.services?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {`${appointment.practitioner?.first_name || ''} ${appointment.practitioner?.last_name || ''}`.trim() || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {`${appointment.client?.first_name || ''} ${appointment.client?.last_name || ''}`.trim() || 'N/A'}
                    </TableCell>
                    <TableCell>{appointment.status || 'N/A'}</TableCell>
                    <TableCell align="right">
                      ${appointment.services?.price?.toFixed(2) || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No report data to display.
          </Typography>
        )}

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          message="Report exported successfully!"
        />
      </Box>
    </PortalLayout>
  );
};

export default Reports;