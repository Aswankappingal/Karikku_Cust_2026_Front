// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import baseUrl from '../../baseUrl';
import { isTokenExpired } from '../../utils/authUtils';

// API base URL - adjust according to your backend
// const API_BASE_URL = 'http://localhost:3001';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/login-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      // Store user data and token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));

      return data;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: 'Network error. Please check your connection.',
      });
    }
  }
);

// Async thunk for signup
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/signup-with-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: 'Network error. Please check your connection.',
      });
    }
  }
);

// Get initial state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  const userData = localStorage.getItem('userData') || localStorage.getItem('user');
  
  if (token && isTokenExpired(token)) {
    console.warn('Initial state: Token exists but is expired. Clearing storage.');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('user'); // Also remove 'user' as Navbar uses it
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  return {
    user: userData ? JSON.parse(userData) : null,
    token: token || null,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('user');
    },
    setAuthFromStorage: (state) => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userData = localStorage.getItem('userData') || localStorage.getItem('user');
      
      if (token && userData) {
        if (isTokenExpired(token)) {
          console.warn('setAuthFromStorage: Token is expired. Logging out.');
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          localStorage.removeItem('user');
        } else {
          state.token = token;
          try {
            state.user = JSON.parse(userData);
          } catch (e) {
            state.user = null;
            state.isAuthenticated = false;
            return;
          }
          state.isAuthenticated = true;
        }
      } else {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || 'Login failed';
      })
      // Signup cases
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Note: For signup, you might want to redirect to login or auto-login
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Signup failed';
      });
  },
});

export const { clearError, logout, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;