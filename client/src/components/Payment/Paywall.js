import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './Payment/CheckoutForm'; 
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';


const stripePromise = loadStripe('your-stripe-publishable-key'); //Add My key

const App = () => {
  const [paymentMethod, setPaymentMethod] = useState(null); 

  return (
    <div>
      <h1>Select a Payment Method</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={() => setPaymentMethod('card')}>Pay with Card</button>
        <button onClick={() => setPaymentMethod('paypal')}>Pay with PayPal</button>
      </div>

      {paymentMethod === 'card' && (
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}

      {paymentMethod === 'paypal' && (
        <PayPalScriptProvider
          options={{
            'client-id': 'your-paypal-client-id', // Addl PayPal client ID
            currency: 'USD',
          }}
        >
          <h2>Pay with PayPal</h2>
          <PayPalButtons
            style={{ layout: 'vertical' }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: '50.00', 
                    },
                  },
                ],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then((details) => {
                console.log('Transaction completed by: ', details.payer.name.given_name);
                alert('Payment Successful!');
              });
            }}
            onError={(err) => {
              console.error('PayPal Checkout Error: ', err);
              alert('Payment could not be completed. Please try again.');
            }}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
};

export default App;
