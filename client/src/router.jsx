import { Navigate } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';

// Portals
import ClientPortal from './pages/portals/client/pages';
import PractitionerPortal from './pages/portals/practitioner/pages';
import AdminPortal from './pages/portals/admin/pages';
import StaffPortal from './pages/portals/staff/pages';

// Components
import { ProtectedRoute } from './components/Routes/ProtectedRoute';

export const routes = [
  // Public Routes
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/about',
    element: <About />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  
  // Protected Routes
  {
    path: '/client/*',
    element: <ProtectedRoute allowedRoles={['client']}><ClientPortal /></ProtectedRoute>
  },
  {
    path: '/practitioner/*',
    element: <ProtectedRoute allowedRoles={['practitioner']}><PractitionerPortal /></ProtectedRoute>
  },
  {
    path: '/admin/*',
    element: <ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>
  },
  {
    path: '/staff/*',
    element: <ProtectedRoute allowedRoles={['staff']}><StaffPortal /></ProtectedRoute>
  },
  
  // Catch all route
  {
    path: '*',
    element: <Navigate to="/" />
  }
];