// src/store/slices/bannerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import baseUrl from '../../../baseUrl';

// Thunk to fetch banners
export const fetchBanners = createAsyncThunk('banners/fetchBanners', async () => {
  const response = await axios.get(`${baseUrl}/home-banners`);

  if (response.data?.success) {
    return response.data.banners;
  }

  throw new Error('Failed to fetch banners');
});

const bannerSlice = createSlice({
  name: 'banners',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {
    clearBanners: (state) => {
      state.data = [];
      localStorage.removeItem('banners');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearBanners } = bannerSlice.actions;
export default bannerSlice.reducer;
