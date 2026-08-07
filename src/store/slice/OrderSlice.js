// src/store/slices/ordersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import baseUrl from '../../baseUrl';

// Get token from localStorage (for API calls only)
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// Thunk to fetch orders
export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue, getState }) => {
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.log('❌ User not authenticated, skipping fetch');
      return [];
    }

    const state = getState();
    const existingOrders = state.orders.orders;

    // If we already have orders and they're recent, return them
    const lastFetched = state.orders.lastFetched;
    const oneMinute = 60 * 1000; // 1 minute in milliseconds

    if (existingOrders.length > 0 && lastFetched &&
      (Date.now() - new Date(lastFetched).getTime()) < oneMinute) {
      console.log('📦 Using recent orders from Redux store');
      return existingOrders;
    }

    console.log('🌐 Fetching orders from API...');

    const response = await axios.get(`${baseUrl}/orders`, {
      headers: getAuthHeaders(),
      timeout: 10000 // 10 second timeout
    });

    if (response.data?.success) {
      console.log('✅ Orders fetched successfully:', response.data.orders?.length || 0, 'orders');
      return response.data.orders || [];
    }

    throw new Error(response.data?.message || 'Failed to fetch orders');
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return rejectWithValue(
      error.response?.data?.message || error.message || 'Failed to fetch orders'
    );
  }
});

// Thunk to refresh orders (bypass cache)
export const refreshOrders = createAsyncThunk('orders/refreshOrders', async (_, { rejectWithValue }) => {
  try {
    if (!isAuthenticated()) {
      console.log('❌ User not authenticated, cannot refresh');
      return [];
    }

    console.log('🔄 Refreshing orders from API...');

    const response = await axios.get(`${baseUrl}/orders`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });

    if (response.data?.success) {
      const orders = response.data.orders || [];
      console.log('✅ Orders refreshed successfully:', orders.length, 'orders');
      return orders;
    }

    throw new Error(response.data?.message || 'Failed to refresh orders');
  } catch (error) {
    console.error('❌ Error refreshing orders:', error);
    return rejectWithValue(
      error.response?.data?.message || error.message || 'Failed to refresh orders'
    );
  }
});

// Thunk to fetch orders after placing a new order
export const fetchOrdersAfterPlacement = createAsyncThunk(
  'orders/fetchOrdersAfterPlacement',
  async (_, { rejectWithValue }) => {
    try {
      if (!isAuthenticated()) {
        return [];
      }

      console.log('🔄 Fetching orders after new order placement...');

      const response = await axios.get(`${baseUrl}/orders`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });

      if (response.data?.success) {
        const orders = response.data.orders || [];
        console.log('✅ Orders fetched after placement:', orders.length, 'orders');
        return orders;
      }

      throw new Error(response.data?.message || 'Failed to fetch orders after placement');
    } catch (error) {
      console.error('❌ Error fetching orders after placement:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch orders after placement'
      );
    }
  }
);

// Thunk to get single order details
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      if (!isAuthenticated()) {
        return rejectWithValue('User not authenticated');
      }

      console.log(`🔍 Fetching details for order: ${orderId}`);

      const response = await axios.get(`${baseUrl}/orders/${orderId}`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });

      if (response.data?.success) {
        return response.data.order;
      }

      throw new Error(response.data?.message || 'Failed to fetch order details');
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch order details'
      );
    }
  }
);

// Thunk to cancel order
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      if (!isAuthenticated()) {
        return rejectWithValue('User not authenticated');
      }

      console.log(`❌ Cancelling order: ${orderId}`);

      const response = await axios.post(`${baseUrl}/orders/${orderId}/cancel`, {}, {
        headers: getAuthHeaders(),
        timeout: 10000
      });

      if (response.data?.success) {
        return { orderId, ...response.data };
      }

      throw new Error(response.data?.message || 'Failed to cancel order');
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to cancel order'
      );
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    selectedOrder: null,
    loading: false,
    refreshing: false,
    error: null,
    totalOrders: 0,
    actionLoading: {
      fetchDetails: false,
      cancel: false
    },
    filters: {
      status: 'all', // all, pending, processing, shipped, delivered, cancelled
      dateRange: 'all', // all, week, month, year
      sortBy: 'newest' // newest, oldest, amount_high, amount_low
    },
    lastFetched: null,
    isInitialized: false // Track if orders have been loaded at least once
  },
  reducers: {
    // Clear orders error
    clearOrdersError: (state) => {
      state.error = null;
    },

    // Set filters
    setOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear selected order
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },

    // Update order status locally (for optimistic updates)
    updateOrderStatusLocally: (state, action) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
        state.orders[orderIndex].updatedAt = new Date().toISOString();
      }
    },

    // Add new order to the beginning of the list (for optimistic updates)
    addNewOrderOptimistically: (state, action) => {
      const newOrder = action.payload;
      // Check if order already exists
      const existingOrderIndex = state.orders.findIndex(order =>
        order.id === newOrder.id || order.orderId === newOrder.orderId
      );

      if (existingOrderIndex === -1) {
        state.orders.unshift(newOrder);
        state.totalOrders += 1;
      }
    },

    // Clear orders cache
    clearOrdersCache: (state) => {
      state.lastFetched = null;
    },

    // Force clear orders (for logout, etc.)
    forceClearOrders: (state) => {
      state.orders = [];
      state.selectedOrder = null;
      state.totalOrders = 0;
      state.error = null;
      state.lastFetched = null;
      state.isInitialized = false;
      state.loading = false;
      state.refreshing = false;
    },

    // Initialize orders (no cache to load from)
    initializeFromCache: (state) => {
      // Just mark as initialized
      state.isInitialized = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        // Only show loading if we don't have existing orders
        if (state.orders.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.totalOrders = action.payload.length;
        state.lastFetched = new Date().toISOString();
        state.isInitialized = true;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't clear existing orders on error, just mark as stale
      })

      // Refresh orders
      .addCase(refreshOrders.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshOrders.fulfilled, (state, action) => {
        state.refreshing = false;
        state.orders = action.payload;
        state.totalOrders = action.payload.length;
        state.lastFetched = new Date().toISOString();
        state.isInitialized = true;
      })
      .addCase(refreshOrders.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload;
      })

      // Fetch orders after placement
      .addCase(fetchOrdersAfterPlacement.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(fetchOrdersAfterPlacement.fulfilled, (state, action) => {
        state.refreshing = false;
        state.orders = action.payload;
        state.totalOrders = action.payload.length;
        state.lastFetched = new Date().toISOString();
        state.isInitialized = true;
      })
      .addCase(fetchOrdersAfterPlacement.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload;
      })

      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.actionLoading.fetchDetails = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.actionLoading.fetchDetails = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.actionLoading.fetchDetails = false;
        state.error = action.payload;
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.actionLoading.cancel = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionLoading.cancel = false;
        const { orderId } = action.payload;

        // Update the order status in the list
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'cancelled';
          state.orders[orderIndex].updatedAt = new Date().toISOString();
        }

        // Update selected order if it's the same one
        if (state.selectedOrder && state.selectedOrder.id === orderId) {
          state.selectedOrder.status = 'cancelled';
          state.selectedOrder.updatedAt = new Date().toISOString();
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.actionLoading.cancel = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearOrdersError,
  setOrderFilters,
  clearSelectedOrder,
  updateOrderStatusLocally,
  clearOrdersCache,
  forceClearOrders,
  addNewOrderOptimistically,
  initializeFromCache
} = ordersSlice.actions;

export default ordersSlice.reducer;