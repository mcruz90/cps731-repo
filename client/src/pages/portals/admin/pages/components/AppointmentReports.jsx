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
  Tab
} from '@mui/material';
import { reportService } from '@/services/api/reports';

// Admin can pull reports on appointment statistics and revenue
function AppointmentReports() {
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointment reports based on the active tab (0: Statistics, 1: Revenue)
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const reportType = activeTab;

      // filter criteria here. maybe add stuff here later?? or is this overkill?
      const filters = {
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-31'),
        practitionerId: null,
        serviceId: null,
        status: null
      };

      console.log('Applying filters:', filters);

      const data = await reportService.getAppointmentReports(reportType, filters);

      console.log('Report data received:', data);

      setReportData(data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to fetch report data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleTabChange = (event, newValue) => {
    console.log(`Tab changed to: ${newValue}`);
    setActiveTab(newValue);
  };

  const renderReportContent = () => {
    if (loading) {
      return <CircularProgress />;
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (!reportData) {
      return <Typography>No data available.</Typography>;
    }

    if (activeTab === 0) {
      // Appointment Statistics
      const { statistics } = reportData;

      if (!statistics || !Array.isArray(statistics)) {
        return <Typography>Invalid statistics data.</Typography>;
      }

      return statistics.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service Type</TableCell>
              <TableCell>Total Appointments</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Cancelled</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statistics.map((stat, index) => (
              <TableRow key={index}>
                <TableCell>{stat.serviceType}</TableCell>
                <TableCell>{stat.totalAppointments}</TableCell>
                <TableCell>{stat.completed}</TableCell>
                <TableCell>{stat.cancelled}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography>No statistics available for the selected filters.</Typography>
      );
    } else if (activeTab === 1) {
      // Revenue Analysis
      const { revenue } = reportData;

      if (!revenue || !Array.isArray(revenue)) {
        return <Typography>Invalid revenue data.</Typography>;
      }

      return revenue.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Total Revenue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {revenue.map((rev, index) => (
              <TableRow key={index}>
                <TableCell>${rev.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography>No revenue data available for the selected filters.</Typography>
      );
    }

    return <Typography>Invalid Report Type.</Typography>;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Appointment Reports
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
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