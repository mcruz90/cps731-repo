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
  Alert,
} from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PortalLayout from '@/components/Layout/PortalLayout';
import ShippingForm from './components/checkout/ShippingForm';
import PaymentForm from './components/checkout/PaymentForm';
import OrderSummary from './components/checkout/OrderSummary';
import { cartService } from '@/services/api/cart';
import { orderService } from '@/services/api/order';
import { PaymentGateway } from '@/services/api/payment';
import { authService } from '@/services/api/auth';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// steps in checkout process
const steps = ['Shipping', 'Payment', 'Review'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [shippingData, setShippingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const session = authService.getCurrentSession();
  const accessToken = session?.access_token;

  // fetches the cart items from the database
  // useCallback to prevent unnecessary re-renders
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

  // fetches the cart items from the database
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // handles the submission of the shipping data
  const handleShippingSubmit = (data) => {
    console.log('Shipping data received:', data);
    setShippingData(data);
    setActiveStep(1);
  };

  // checks if the user can proceed to the next step
  const canProceedToNext = () => {
    switch (activeStep) {
      case 0:
        return shippingData !== null;
      case 1:
        return paymentData !== null;
      case 2:
        return true;
      default:
        return false;
    }
  };

  // handles the click on the next button
  const handleNext = () => {
    if (canProceedToNext()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // handles the click on the back button
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // validates payment details and stores in paymentData state for now until order is submitted by client
  const handlePaymentSubmit = async (paymentDetails) => {
    try {
      setLoading(true);
      setError(null);
  
      if (!paymentDetails.paymentMethodId) {
        throw new Error('Payment method ID is missing');
      }
  
      const totalAmount = cartItems.reduce((sum, item) => 
        sum + (item.quantity * item.products.price), 0
      );
  
      // Call the Edge Function to process the payment
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/process-product-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentDetails.paymentMethodId,
          amount: totalAmount,
          currency: paymentDetails.currency || 'CAD',
          email: paymentDetails.email,
          billingDetails: paymentDetails.billingDetails || {},
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Payment processing error:', data);
        setError(data.error || 'Payment failed');
        return;
      }
  
      // Payment succeeded, store payment data
      const paymentIntent = data.paymentIntent;
      const chargeId = paymentIntent.charges?.data[0]?.id;
  
      if (!chargeId) {
        throw new Error('Charge ID not found in Payment Intent');
      }
  
      const paymentInfo = {
        chargeId,
        amount: totalAmount,
        currency: paymentDetails.currency || 'CAD',
        billingDetails: paymentIntent.charges?.data[0]?.billing_details || {},
      };
  
      setPaymentData(paymentInfo);
      setActiveStep(2);
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  // PaymentGateway processes payment, then order is created upon client confirmation of order details and successful payment
  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      // Use collected data from state as it's collected from checkout workflow
      const shipping = shippingData;
      const payment = paymentData;
      const items = cartItems;
  
      // Process the payment record in the database
      const paymentResult = await PaymentGateway.processProductPayment(
        {
          chargeId: payment.chargeId,
          amount: payment.amount,
          currency: payment.currency,
          billingDetails: payment.billingDetails,
        },
        null 
      );
  
      if (!paymentResult.success) {
        setError(paymentResult.error || 'Failed to process payment. Please try again.');
        return;
      }
  
      // Create the order, now that payment is processed
      const order = await orderService.createOrder({
        items,
        shipping,
        paymentId: paymentResult.payment.id, // Associate payment with order
      });
  
      console.log('Order placed successfully:', order);
  
      // Redirect to order confirmation page
      navigate('/client/order-confirmation', {
        state: { orderId: order.id },
      });
      console.log('Redirecting to order confirmation page...');
    } catch (error) {
      console.error('Order creation error:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the appropriate step content based on the active step as the user progresses through the checkout process
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <ShippingForm 
          onSubmit={handleShippingSubmit} 
          initialData={shippingData} 
        />;
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('card')}
                sx={{ mr: 2 }}
              >
                Pay with Card
              </Button>
              <Button
                variant={paymentMethod === 'paypal' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('paypal')}
              >
                Pay with PayPal
              </Button>
            </Box>

            {paymentMethod === 'card' && (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  onSubmit={handlePaymentSubmit}
                  amount={cartItems.reduce((sum, item) => sum + (item.quantity * item.products.price), 0)}
                  loading={loading}
                />
              </Elements>
            )}

            {paymentMethod === 'paypal' && (
              <Typography>PayPal integration here</Typography>
            )}
          </Box>
        );
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

  if (loading && activeStep === 0) {
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
          
          {activeStep < 2 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceedToNext() || loading}
            >
              Next
            </Button>
          )}
          
          {activeStep === 2 && (
            <Button onClick={handlePlaceOrder} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </Button>
          )}
        </Box>
      </Paper>
    </PortalLayout>
  );
};

export default Checkout;