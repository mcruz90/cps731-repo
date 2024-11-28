import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Navbar from './components/Navbar/Navbar';
import { routes } from './router';
import SetPassword from './pages/SetPassword';
import ErrorBoundary from './components/ErrorBoundary';
import { SnackbarProvider } from 'notistack';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ErrorBoundary>
        <SnackbarProvider maxSnack={3}>
          <Router>
            <Navbar />
            <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
              />
            ))}
            <Route path="/set-password" element={<SetPassword />} />
          </Routes>
          </Router>
        </SnackbarProvider>
      </ErrorBoundary>
    </LocalizationProvider>
  );
}

export default App;