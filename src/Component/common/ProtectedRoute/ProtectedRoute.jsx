import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isTokenExpired } from '../../../utils/authUtils';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const reduxAuthState = useSelector((state) => state.auth?.isAuthenticated);

  // ✅ Check localStorage for authentication state
  const checkAuthFromStorage = () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const user = localStorage.getItem('user') || localStorage.getItem('userData');
      
      if (token && isTokenExpired(token)) {
        console.warn('ProtectedRoute: Token expired. Clearing storage.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('user');
        return false;
      }
      
      return !!(token && user);
    } catch (error) {
      console.error('Error checking auth from storage:', error);
      return false;
    }
  };

  const [localAuthState, setLocalAuthState] = useState(() => checkAuthFromStorage());
  
  useEffect(() => {
    const isAuth = checkAuthFromStorage();
    setLocalAuthState(isAuth);
  }, []);

  const isAuthenticated = reduxAuthState || localAuthState;

  // ✅ Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location, showLogin: true }} replace />;
  }

  return children;
};

export default ProtectedRoute;
