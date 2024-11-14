// This hook is used to subscribe to different types of updates from supabase depending on the user's actions
// e.g. if they are a client booking an appointment, the practitioner may subscribe to appointment updates
// e.g. clients or practitioners may subscribe to message updates from other authorized users
// e.g. admins may subscribe to updates to reports
// e.g. staff may subscribe to inventory changes
// TODO: all of the above



import { useState, useEffect } from 'react';

export const useSubscription = (type) => {
    const [data, setData] = useState(null);
    
    useEffect(() => {
      // Subscribe to different types:

      // - Appointment updates
      if (type === 'appointment') {
        // Subscribe to appointment updates
      }
      
      // - Messages
      if (type === 'message') {
        // Subscribe to message updates
      }

      // - Notifications
      if (type === 'notification') {
        // Subscribe to notification updates
      }
      
      // - Product updates
      if (type === 'product') {
        // Subscribe to product updates
      }
    }, [type]);
  
    return data;
  };