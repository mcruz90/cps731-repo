import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { reportService } from '@/services/api/reports';

function AppointmentReports() {
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedService, setExpandedService] = useState(null);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportService.getAppointmentReports(activeTab);
      setReportData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleAccordionChange = (serviceType) => (event, isExpanded) => {
    setExpandedService(isExpanded ? serviceType : null);
  };

  const renderAppointmentDetails = (appointments) => {
    if (!appointments?.length) {
      return <Typography color="text.secondary">No appointment details available</Typography>;
    }

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Practitioner</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                {new Date(appointment.date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {`${appointment.profiles.first_name} ${appointment.profiles.last_name}`}
              </TableCell>
              <TableCell>
                <Typography
                  color={
                    appointment.status === 'completed'
                      ? 'success.main'
                      : appointment.status === 'cancelled'
                      ? 'error.main'
                      : 'text.primary'
                  }
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                ${appointment.services.price.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderReportContent = () => {
    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!reportData) return <Alert severity="info">No data available</Alert>;

    // Render the appropriate report content based on the active tab
    switch (activeTab) {
      // Appointment Statistics
      case 0:
        return (
          <Box>
            {reportData.statistics?.map((row) => (
              <Accordion
                key={row.serviceType}
                expanded={expandedService === row.serviceType}
                onChange={handleAccordionChange(row.serviceType)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pr: 2 
                  }}>
                    <Typography variant="subtitle1">{row.serviceType}</Typography>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Typography>
                        Total: {row.totalAppointments}
                      </Typography>
                      <Typography color="success.main">
                        Completed: {row.completed}
                      </Typography>
                      <Typography color="error.main">
                        Cancelled: {row.cancelled}
                      </Typography>
                      <Typography color="primary.main">
                        Revenue: ${row.revenue.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {expandedService === row.serviceType && 
                    renderAppointmentDetails(row.appointments)}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );
      // Revenue Analysis
      case 1:
        return (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Appointments</TableCell>
                <TableCell align="right">Avg. Revenue/Appointment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.revenue?.map((row) => (
                <TableRow key={row.period}>
                  <TableCell>{row.period}</TableCell>
                  <TableCell align="right">${row.revenue.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.appointments}</TableCell>
                  <TableCell align="right">${row.averageRevenue.toFixed(2)}</TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={4} align="center">No revenue data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        );

      default:
        return <Alert severity="warning">Invalid report type</Alert>;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Appointment Reports
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Appointment Statistics" />
          <Tab label="Revenue Analysis" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {renderReportContent()}
        </Box>
      </CardContent>
    </Card>
  );
}

export default AppointmentReports;