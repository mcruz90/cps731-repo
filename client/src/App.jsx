import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from './hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';

// Portals
import ClientPortal from './pages/portals/client/pages'
import PractitionerPortal from './pages/portals/practitioner/pages';
import AdminPortal from './pages/portals/admin/pages';
import StaffPortal from './pages/portals/staff/pages';

// Layout
import Navbar from './components/Navbar/Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole, loadingState } = useAuth();
  
  console.log('ProtectedRoute evaluation:', {
    path: window.location.pathname,
    isAuthenticated,
    userRole,
    loadingState,
    hasAccess: allowedRoles.includes(userRole)
  });

  // Only show loading when auth or profile is loading
  if (loadingState.auth || loadingState.profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check access after loading is complete
  if (!isAuthenticated || !allowedRoles.includes(userRole)) {
    console.log('Access denied:', { isAuthenticated, userRole, allowedRoles });
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};

function App() {
  console.log('App is rendering');
  const { isAuthenticated, userRole } = useAuth();
  
  console.log('Auth state:', { 
    isAuthenticated, 
    userRole,
    currentPath: window.location.pathname
  });

  return (
    <Router>
      <Navbar />
      <Routes>
          {/* Public Routes */}
          <Route exact path="/" element={<Home />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/client/*"
            element={
              (() => {
                console.log('Client route matched:', {
                  path: window.location.pathname,
                  isAuthenticated,
                  userRole,
                  matched: true
                });
                return (
                  <ProtectedRoute allowedRoles={['client']}>
                    <ClientPortal />
                  </ProtectedRoute>
                );
              })()
            }
          />

          <Route
            path="/practitioner/*"
            element={
              <ProtectedRoute allowedRoles={['practitioner']}>
                <PractitionerPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/*"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffPortal />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={
            (() => {
              console.log('Catch-all route hit:', {
                path: window.location.pathname,
                isAuthenticated,
                userRole,
                matched: false
              });
              return <Navigate to="/" />;
            })()
          } />
        </Routes>
    </Router>
  );
}

export default App;