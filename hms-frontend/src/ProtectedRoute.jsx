import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasAccess, setHasAccess] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    console.log('[PROTECTED_ROUTE] Checking authentication...');
    console.log('[PROTECTED_ROUTE] Location:', location.pathname);
    console.log('[PROTECTED_ROUTE] User:', user ? 'EXISTS' : 'MISSING');
    console.log('[PROTECTED_ROUTE] Token:', token ? 'EXISTS' : 'MISSING');
    console.log('[PROTECTED_ROUTE] Role:', userRole || 'MISSING');
    console.log('[PROTECTED_ROUTE] Required Role:', requiredRole || 'ANY');

    if (user && token && userRole) {
      console.log('[PROTECTED_ROUTE] ✓ User authenticated with role:', userRole);
      setIsAuthenticated(true);
      
      // Check if route requires specific role
      if (requiredRole && userRole !== requiredRole) {
        console.warn(`[PROTECTED_ROUTE] ✗ Role mismatch! Expected ${requiredRole}, got ${userRole}`);
        setHasAccess(false);
      } else {
        console.log('[PROTECTED_ROUTE] ✓ Role check passed');
        setHasAccess(true);
      }
    } else {
      console.warn('[PROTECTED_ROUTE] ✗ No valid authentication found');
      setIsAuthenticated(false);
      setHasAccess(false);
    }
  }, [requiredRole, location.pathname]);

  if (isAuthenticated === null || hasAccess === null) {
    return null;
  }

  if (!isAuthenticated) {
    console.log('[PROTECTED_ROUTE] Not authenticated - redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess) {
    const userRole = localStorage.getItem('userRole');
    console.log(`[PROTECTED_ROUTE] Role check failed - redirecting to appropriate dashboard for role: ${userRole}`);
    
    // Redirect to user's dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (userRole === 'doctor') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (userRole === 'patient') {
      return <Navigate to="/patient-dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
