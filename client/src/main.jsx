import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { AuthProvider } from './context/AuthProvider';

// Create a basic theme
const theme = createTheme({
  
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3', // Blue
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057', // Pink
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300,
      letterSpacing: '-0.01562em',
      lineHeight: 1.167,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
      letterSpacing: '-0.00833em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
      letterSpacing: '0em',
      lineHeight: 1.167,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 400,
      letterSpacing: '0.00735em',
      lineHeight: 1.235,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 400,
      letterSpacing: '0em',
      lineHeight: 1.334,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.0075em',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.00938em',
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.00714em',
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.00938em',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.01071em',
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02857em',
      lineHeight: 1.75,
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.03333em',
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.08333em',
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },

});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CssBaseline />
          <App />
        </AuthProvider>
      </ThemeProvider>
  </React.StrictMode>
);