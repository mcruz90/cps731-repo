import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CancelIcon from '@mui/icons-material/Cancel';
import PortalLayout from '@/components/Layout/PortalLayout';
import { reportService } from '@/services/api/reports';
import RefreshIcon from '@mui/icons-material/Refresh';
import AppointmentReports from './components/AppointmentReports';
import { Link } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Cache constants to prevent constant re-renders (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;
const CACHE_KEY = 'dashboardData';

// Helper function to handle cache
const getCachedData = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < CACHE_DURATION) {
    return data;
  }
  
  localStorage.removeItem(CACHE_KEY);
  return null;
};

// Memoize the DashboardCard component to prevent unnecessary re-renders -- need to do this for performance -- console logs keep saying this is rerendering
const DashboardCard = React.memo(function DashboardCard({ title, value, icon, color = 'primary', isLoading, error }) {
  return (
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
});

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(() => getCachedData());
  const [loading, setLoading] = useState(!dashboardData);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(!document.hidden);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // attempt to cache stuff here. consider doing it for other pages too.
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      // If we have cached data, use it
      const cachedData = getCachedData();
      if (cachedData) {
        setDashboardData(cachedData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await reportService.getDashboardSummary();
        
        if (isMounted) {
          setDashboardData(data);
          
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only fetch if the tab is visible and we don't have valid cached data
    if (isVisible && !getCachedData()) {
      fetchDashboardData();
    }

    return () => {
      isMounted = false;
    };
  }, [isVisible]); 

  // Update the dashboard metrics to show weekly data
  const dashboardMetrics = useMemo(() => ({
    weeklyAppointments: dashboardData?.weeklyAppointments || 0,
    weeklyRevenue: formatCurrency(dashboardData?.weeklyRevenue || 0),
    weeklyCancellations: dashboardData?.weeklyCancellations || 0,
    weeklyRevenueLoss: formatCurrency(dashboardData?.weeklyRevenueLoss || 0)
  }), [dashboardData, formatCurrency]);

  // Add refresh function
  const handleRefresh = useCallback(async () => {
    localStorage.removeItem(CACHE_KEY);
    try {
      setLoading(true);
      const data = await reportService.getDashboardSummary();
      setDashboardData(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PortalLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Weekly Overview
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            onClick={handleRefresh}
            disabled={loading}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
          <Button
            component={Link}
            to="/admin/reports"
            variant="contained"
            startIcon={<AssessmentIcon />}
          >
            View Full Reports
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Weekly Appointments */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Appointments This Week"
            value={dashboardMetrics.weeklyAppointments}
            icon={<CalendarTodayIcon color="primary" />}
            isLoading={loading}
          />
        </Grid>

        {/* Weekly Revenue */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Revenue This Week"
            value={dashboardMetrics.weeklyRevenue}
            icon={<AttachMoneyIcon color="success" />}
            color="success"
            isLoading={loading}
          />
        </Grid>

        {/* Weekly Cancellations */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Cancellations This Week"
            value={dashboardMetrics.weeklyCancellations}
            icon={<CancelIcon color="error" />}
            color="error"
            isLoading={loading}
          />
        </Grid>

        {/* Weekly Revenue Loss */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Weekly Revenue Loss"
            value={dashboardMetrics.weeklyRevenueLoss}
            icon={<AttachMoneyIcon color="warning" />}
            color="warning"
            isLoading={loading}
          />
        </Grid>

        {/* Appointment Reports */}
        <Grid item xs={12}>
          <AppointmentReports />
        </Grid>
      </Grid>
    </PortalLayout>
  );
};

export default Dashboard;


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
