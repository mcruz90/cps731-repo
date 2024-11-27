// Need to separate services to follow interaction diagram: (Client -> (Auth ->) Portal -> SchedulerSystem -> AppointmentService -> PaymentGateway)
/*

const handleConfirmBooking = async (finalFormData) => {
  try {
    // Start payment process
    const paymentResult = await PaymentGateway.startPayment(formData.price);
    
    if (paymentResult.success) {
      // Register appointment
      const appointment = await AppointmentService.registerAppointment({
        ...finalFormData,
        paymentId: paymentResult.id
      });
      
      setSuccess(true);
      navigate('/appointments');
    }
  } catch (err) {
    setError('Booking failed. Please try again.');
  }
}

Interaction diagram sequence:

const bookingSequence = async () => {
  // 1. Authentication check
  if (!isAuthenticated) return;
  
  // 2. Get available services
  const services = await AppointmentService.getAvailableServices();
  
  // 3. Check scheduler
  const availability = await SchedulerSystem.getAvailability();
  
  // 4. Process payment
  const payment = await PaymentGateway.startPayment();
  
  // 5. Register appointment
  const appointment = await AppointmentService.registerAppointment();
}


*/

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import ServiceSelection from './ServiceSelection';
import DateTimeSelection from './DateTimeSelection';
import PortalLayout from '@/components/Layout/PortalLayout';
import ConfirmDetails from './ConfirmDetails';
import { useNavigate } from 'react-router-dom';


// Custom Tab Panel Component to let user toggle between each stage of the booking process
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// Helper function for accessibility props
function a11yProps(index) {
  return {
    id: `booking-tab-${index}`,
    'aria-controls': `booking-tabpanel-${index}`,
  };
}

export default function BookAppointment() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: null,
    serviceName: '',
    date: null,
    time: null,
    practitionerId: null,
    practitionerName: '',
    duration: null,
    price: null,
    notes: '',
    clientId: user?.id
  });

  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
  }, [activeTab]);

  // Service Selection Handler
  const handleServiceSelect = (service) => {
    console.log('Service selected:', service);
    setFormData(prevData => ({
      ...prevData,
      serviceId: service.id,
      serviceName: service.name,
      duration: service.duration,
      price: service.price
    }));
    setActiveTab(1);
  };

  // DateTime and Practitioner Selection Handler
  const handleDateTimeSelect = (date, time, practitionerId, practitionerName) => {
    console.log('DateTime and practitioner selected:', { date, time, practitionerId, practitionerName });
    setFormData(prevData => {
      const newData = {
        ...prevData,
        date: date,
        time: time,
        practitionerId: practitionerId,
        practitionerName: practitionerName
      };
      
      // Automatically advance to confirmation if all required data is present
      if (date && time && practitionerId) {
        setActiveTab(2);
      }
      
      return newData;
    });
  };

  // Confirmation Handler
  const handleConfirmBooking = async (result) => {
    try {
      setLoading(true);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/client/appointments');
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Select Service" {...a11yProps(0)} />
            <Tab 
              label="Choose Date & Time" 
              {...a11yProps(1)}
              disabled={!formData.serviceId} 
            />
            <Tab 
              label="Confirm Details" 
              {...a11yProps(2)}
              disabled={!formData.date || !formData.time || !formData.practitionerId} 
            />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <ServiceSelection
              onServiceSelect={handleServiceSelect}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {!formData.serviceId ? (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                Please select a service first
              </Typography>
            ) : (
              <DateTimeSelection
                onDateTimeSelect={handleDateTimeSelect}
                selectedDate={formData.date}
                selectedTime={formData.time}
                serviceId={formData.serviceId}
              />
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {!formData.serviceId || !formData.date || !formData.time || !formData.practitionerId ? (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                Please complete all previous steps first
              </Typography>
            ) : (
              <ConfirmDetails
                formData={formData}
                onConfirm={handleConfirmBooking}
                loading={loading}
                error={error}
              />
            )}
          </TabPanel>

          {/* Back button */}
          {activeTab > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
              <Button onClick={() => setActiveTab(prev => prev - 1)}>
                Back
              </Button>
            </Box>
          )}

          {/* Loading and error states */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Success message */}
          <Snackbar 
            open={success} 
            autoHideDuration={6000} 
            onClose={() => setSuccess(false)}
          >
            <Alert severity="success">
              Appointment booked successfully!
            </Alert>
          </Snackbar>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>
    </PortalLayout>
  );
}