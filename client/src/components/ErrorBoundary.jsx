import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import PropTypes from 'prop-types';

// ERROR BOUNDARY for the application
// Apparently this is good practice in a react app to have an all encompassing error boundary to catch errors and display a fallback UI
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }
  
  // Update state to display fallback UI on next render
  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error };
  }

  // Log the error to the console
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error">
          <AlertTitle>Something went wrong.</AlertTitle>
          An unexpected error occurred. Please try again later.
        </Alert>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

