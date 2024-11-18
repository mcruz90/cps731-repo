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
import { BookingService } from '@/services/api/booking';
import PractitionerSelection from './PractitionerSelection';
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
    notes: ''
  });

  // Navigation to have user redirected to appointments page after submitting booking
  const navigate = useNavigate();

  // Reset error when changing tabs
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
    // Automatically advance to date/time selection
    setActiveTab(1);
  };

  // DateTime Selection Handler
  const handleDateTimeSelect = (date, time, practitionerId, practitionerName) => {
    console.log('DateTime selected:', { date, time, practitionerId, practitionerName });
    setFormData(prevData => {
      const newData = {
        ...prevData,
        date: date,
        time: time,
        practitionerId: practitionerId,
        practitionerName: practitionerName
      };
      console.log('Updated formData after datetime selection:', newData);
      
      // Automatically advance to practitioner selection if both date AND time are selected
      if (date && time) {
        setActiveTab(2);
      }
      
      return newData;
    });
  };

  // Practitioner Selection Handler
  const handlePractitionerSelect = (practitioner) => {
    console.log('Practitioner selected:', practitioner);
    setFormData(prevData => ({
      ...prevData,
      practitionerId: practitioner.id,
      practitionerName: practitioner.name
    }));
    // Automatically advance to confirmation
    setActiveTab(3);
  };

  // Confirmation Handler
  const handleConfirmBooking = async (finalFormData) => {
    setLoading(true);
    try {
      const appointmentData = {
        ...finalFormData,
        client_id: user?.id // Add user ID from auth so they're connected to this specific appointment
      };
      
      await BookingService.createAppointment(appointmentData);
      setSuccess(true);
      navigate('/appointments');
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Failed to create appointment. Please try again.');
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
              label="Choose Provider" 
              {...a11yProps(2)}
              disabled={!formData.date || !formData.time} 
            />
            <Tab 
              label="Confirm Details" 
              {...a11yProps(3)}
              disabled={!formData.practitionerId} 
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
            {!formData.serviceId || !formData.date || !formData.time ? (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                Please select a service and date/time first
              </Typography>
            ) : (
              <PractitionerSelection
                serviceId={formData.serviceId}
                selectedPractitionerId={formData.practitionerId}
                selectedDate={formData.date}
                onPractitionerSelect={handlePractitionerSelect}
              />
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
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

          {/* Loading indicator */}
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