// hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  loginUser,
  signupUser,
  logout,
  clearError,
  setAuthFromStorage
} from '../../store/slice/userSlice';
import { useEffect } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error
  } = useSelector((state) => state.auth);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    dispatch(setAuthFromStorage());
  }, [dispatch]);

  // Login function
  const login = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials));

      if (loginUser.fulfilled.match(result)) {
        // Login successful
        return {
          success: true,
          data: result.payload
        };
      } else {
        // Login failed
        return {
          success: false,
          error: result.payload?.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const result = await dispatch(signupUser(userData));

      if (signupUser.fulfilled.match(result)) {
        // Signup successful
        return {
          success: true,
          data: result.payload
        };
      } else {
        // Signup failed
        return {
          success: false,
          error: result.payload?.message || 'Signup failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  };

  // Logout function
  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); // Redirect to home page
  };

  // Clear error function
  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Check if user has specific permissions/roles
  const hasPermission = (permission) => {
    // Implement your permission logic here
    return user?.permissions?.includes(permission) || false;
  };

  // Get authorization header for API calls
  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Make authenticated API calls
  const apiCall = async (url, options = {}) => {
    const authHeaders = getAuthHeader();

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid, logout user
      handleLogout();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    signup,
    logout: handleLogout,
    clearError: clearAuthError,
    hasPermission,

    // Utilities
    getAuthHeader,
    apiCall,
  };
};