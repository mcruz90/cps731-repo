import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2D3B45', 
      light: '#4A5A66',
      dark: '#1E282F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7BB0D4',
      light: '#A7C7E7',
      dark: '#5B8FB9',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FBFF', 
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3B45', 
      secondary: '#5A6B76',
      disabled: '#A0AEC0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 300, 
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 300,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.7,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30, // Rounded buttons
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(123, 176, 212, 0.25)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px rgba(123, 176, 212, 0.2)',
          backgroundColor: '#2D3B45',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#1E282F',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#7BB0D4',
          color: '#7BB0D4',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#5B8FB9',
            color: '#5B8FB9',
          },
        },
        text: {
          color: '#2D3B45', 
          '&:hover': {
            color: '#7BB0D4', 
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(123, 176, 212, 0.15)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: 'rgba(123, 176, 212, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(123, 176, 212, 0.3)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(123, 176, 212, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(123, 176, 212, 0.1)',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#2D3B45', 
          textDecoration: 'none',
          fontWeight: 500,
          '&:hover': {
            color: '#7BB0D4', 
            textDecoration: 'none',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(123, 176, 212, 0.1)',
    '0 4px 8px rgba(123, 176, 212, 0.15)',
    '0 8px 16px rgba(123, 176, 212, 0.2)',
  ],
});