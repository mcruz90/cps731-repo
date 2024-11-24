import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../supabaseClient'; // Import your Supabase client
import './CheckoutForm.css';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    currency: 'USD', // Default currency
  });
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!isValidEmail(formData.email)) {
        alert('Please enter a valid email address.');
        return;
      }
    if (!stripe || !elements) {
      console.error('Stripe.js has not loaded yet.');
      return;
    }
  
    const cardElement = elements.getElement(CardElement);
  
    if (!cardElement || !cardElement._complete) { // `_complete` is a Stripe property
      alert('Please complete the card details.');
      return;
    }

    try {
      // Create Payment Method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: formData.name,
          email: formData.email,
          address: {
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
          },
        },
      });

      if (error) {
        console.error('Error creating payment method:', error.message);
        return;
      }

      console.log('Payment Method created successfully:', paymentMethod);

      // Example: Simulating the amount and appointment/client IDs
      const paymentData = {
        appointment_id: 'some-appointment-id', // Replace with actual appointment ID
        client_id: 'some-client-id',         // Replace with actual client ID
        amount: 5000,                       // Amount in cents (e.g., $50.00)
        payment_method: paymentMethod.id,
        status: 'successful',
        transaction_id: paymentMethod.id,    // Using PaymentMethod ID as transaction ID for now
        created_at: new Date().toISOString(), // Add timestamp for payment
      };

      // Insert payment data into Supabase
      const { data, error: supabaseError } = await supabase
        .from('payments')
        .insert([paymentData]);

      if (supabaseError) {
        console.error('Error inserting payment into Supabase:', supabaseError.message);
      } else {
        console.log('Payment recorded in Supabase:', data);
        alert('Payment Successful!');
      }
    } catch (err) {
      console.error('Unexpected error occurred:', err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {/* Name */}
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* Address */}
      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>

      {/* City */}
      <div className="form-group">
        <label htmlFor="city">City</label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />
      </div>

      {/* State */}
      <div className="form-group">
        <label htmlFor="state">State</label>
        <input
          type="text"
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />
      </div>

      {/* Postal Code */}
      <div className="form-group">
        <label htmlFor="postalCode">Postal Code</label>
        <input
          type="text"
          id="postalCode"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          required
        />
      </div>

      {/* Country */}
      <div className="form-group">
  <label htmlFor="country">Country</label>
  <select
    id="country"
    name="country"
    value={formData.country}
    onChange={handleChange}
    required
  >
    <option value="US">United States</option>
    <option value="RU">Russia</option>
    <option value="CA">Canada</option>
    <option value="GB">United Kingdom</option>
    <option value="FR">France</option>
    <option value="DE">Germany</option>
    <option value="IN">India</option>
    <option value="AU">Australia</option>
  </select>
</div>


      {/* Currency Selection */}
      <div className="form-group">
        <label htmlFor="currency">Currency</label>
        <select
          id="currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
        >
          <option value="USD">USD - United States Dollar</option>
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="EUR">EUR - Euro</option>
        </select>
      </div>

      {/* CardElement */}
      <div className="form-group card-element-container">
        <label>Card Details</label>
        <CardElement className="card-element" />
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={!stripe || !elements}>
        Pay
      </button>
    </form>
  );
};

export default CheckoutForm;
