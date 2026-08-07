import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import baseUrl from '../../../baseUrl';

// Async thunk for fetching the logged-in user's details
export const fetchLoginedUser = createAsyncThunk(
  'user/fetchLoginedUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${baseUrl}/user-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.user;
    } catch (error) {
      // Handle specific error types
      if (error.response?.status === 401) {
        // Token expired or unauthorized
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
      }
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);


// User slice definition
const userSlice = createSlice({
  name: 'user',
  initialState: {
    loginedUser: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoginedUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLoginedUser.fulfilled, (state, action) => {
        state.loginedUser = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchLoginedUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch user';
      });
  },
});

export default userSlice.reducer;