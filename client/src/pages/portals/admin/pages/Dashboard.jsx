import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Alert,
  Box,
  Chip
} from '@mui/material';
import { Grid } from '@mui/material/Grid2';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import PortalLayout from '@/components/Layout/PortalLayout';
import { reportService } from '@/services/api/reports';
import PropTypes from 'prop-types';

const DashboardCard = ({ title, value, icon, color = 'primary', isLoading, error }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Typography color="error" variant="body2">{error}</Typography>
      ) : (
        <Typography variant="h3" color={`${color}.main`}>
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await reportService.getDashboardSummary();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Add PropTypes validation
DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

DashboardCard.defaultProps = {
  color: 'primary',
  isLoading: false,
    error: null
  };

  return (
    <PortalLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Overview of business metrics
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Today's Appointments"
            value={dashboardData?.todayAppointments || 0}
            icon={<CalendarTodayIcon color="primary" />}
            isLoading={loading}
          />
        </Grid>

        {/* Today's Revenue */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Today's Revenue"
            value={formatCurrency(dashboardData?.todayRevenue || 0)}
            icon={<AttachMoneyIcon color="success" />}
            color="success"
            isLoading={loading}
          />
        </Grid>

        {/* Cancelled Appointments */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Cancelled Today"
            value={dashboardData?.cancelledAppointments || 0}
            icon={<CancelIcon color="error" />}
            color="error"
            isLoading={loading}
          />
        </Grid>

        {/* Revenue Loss */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Potential Revenue Loss"
            value={formatCurrency(dashboardData?.potentialRevenueLoss || 0)}
            icon={<AttachMoneyIcon color="warning" />}
            color="warning"
            isLoading={loading}
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={Link}
                  to="add-users"
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                >
                  Add New User
                </Button>
                <Button
                  component={Link}
                  to="users"
                  variant="outlined"
                  startIcon={<GroupIcon />}
                >
                  Manage Users
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today&apos;s Appointments Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${dashboardData?.completedAppointments || 0} Completed`}
                  color="success"
                />
                <Chip 
                  label={`${dashboardData?.upcomingAppointments || 0} Upcoming`}
                  color="primary"
                />
                <Chip 
                  label={`${dashboardData?.cancelledAppointments || 0} Cancelled`}
                  color="error"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PortalLayout>
  );
};

export default Dashboard;