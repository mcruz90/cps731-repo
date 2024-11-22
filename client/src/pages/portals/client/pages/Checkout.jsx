import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Divider,
  Alert
} from '@mui/material';
import PortalLayout from '@/components/Layout/PortalLayout';
import ShippingForm from './components/checkout/ShippingForm';
import PaymentForm from './components/checkout/PaymentForm';
import OrderSummary from './components/checkout/OrderSummary';
import { cartService } from '@/services/api/cart';
import { orderService } from '@/services/api/order';

const steps = ['Shipping', 'Payment', 'Review'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [shippingData, setShippingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCartItems = useCallback(async () => {
    try {
      const items = await cartService.getCartItems();
      if (items.length === 0) {
        navigate('/client/cart');
        return;
      }
      setCartItems(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleShippingSubmit = (data) => {
    setShippingData(data);
    handleNext();
  };

  const handlePaymentSubmit = (data) => {
    setPaymentData(data);
    handleNext();
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      await orderService.createOrder({
        items: cartItems,
        shipping: shippingData,
        payment: paymentData
      });
      
      // Clear cart after successful order
      await cartService.clearCart();
      
      // Navigate to order confirmation
      navigate('/client/order-confirmation');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <ShippingForm onSubmit={handleShippingSubmit} />;
      case 1:
        return <PaymentForm onSubmit={handlePaymentSubmit} />;
      case 2:
        return (
          <OrderSummary 
            cartItems={cartItems}
            shippingData={shippingData}
            paymentData={paymentData}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return <PortalLayout>Loading checkout...</PortalLayout>;
  }

  return (
    <PortalLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handlePlaceOrder : handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </PortalLayout>
  );
};

export default Checkout;