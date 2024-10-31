import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';

// Public pages
import Home from '@/pages/Home';
import About from '@/pages/About';
import Login from '@/pages/Login';

// Portal routes for different user roles
import ClientPortal from '@/portals/client';
import PractitionerPortal from '@/portals/practitioner';
import AdminPortal from '@/portals/admin';
import StaffPortal from '@/portals/staff';

// Protected route wrapper so only logged in users can access the routes
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          {/* Home, About, Login pages are accessible to all users */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />

          {/* Protected portal routes start here */}

          {/* Client-specific portal routes */}
          <Route
            path="/client/*"
            element={
              <ProtectedRoute role="client">
                <ClientPortal />
              </ProtectedRoute>
            }
          />

          {/* Practitioner-specific portal routes */}
          <Route
            path="/practitioner/*"
            element={
              <ProtectedRoute role="practitioner">
                <PractitionerPortal />
              </ProtectedRoute>
            }
          />

          {/* Admin-specific portal routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminPortal />
              </ProtectedRoute>
            }
          />

          {/* Staff-specific portal routes */}
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute role="staff">
                <StaffPortal />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;