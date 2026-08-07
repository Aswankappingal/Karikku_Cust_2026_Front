// store/slices/shippingRatesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import baseUrl from '../../baseUrl';

// Async thunk for fetching shipping rates
export const fetchShippingRates = createAsyncThunk('shippingRates/fetchShippingRates', async () => {
  const response = await axios.get(`${baseUrl}/get-shipping-rates`);

  console.log("this is shipping rates response data", response.data);

  if (response.data?.success) {
    return response.data;
  }

  throw new Error('Failed to fetch shipping rates');
});

// Initial state
const initialState = {
  codCharge: 0, // COD charge from API
  shippingRates: [],
  filteredShippingRates: [],
  total: 0,
  loading: false,
  error: null,
  lastFetched: null,
  filters: {
    zones: [], // Multiple zones
    priceRanges: [], // Multiple price ranges
    weightRanges: [], // Multiple weight ranges
    isFree: 'all', // all, free, paid
    isActive: true, // true, false, all
    sortBy: 'rateName', // rateName, price-low-to-high, price-high-to-low, newest
    searchQuery: '',
  },
};

// Helper function to check if rate matches price range
const matchesPriceRange = (ratePrice, priceRange) => {
  switch (priceRange) {
    case '₹0':
      return ratePrice === 0;
    case '₹1 - ₹50':
      return ratePrice > 0 && ratePrice <= 50;
    case '₹51 - ₹100':
      return ratePrice > 50 && ratePrice <= 100;
    case '₹101 - ₹200':
      return ratePrice > 100 && ratePrice <= 200;
    case '₹200+':
      return ratePrice > 200;
    default:
      return true;
  }
};

// Helper function to check if rate matches weight range
const matchesWeightRange = (rateMinWeight, rateMaxWeight, weightRange) => {
  switch (weightRange) {
    case '0-1kg':
      return (!rateMinWeight || rateMinWeight <= 1) && (!rateMaxWeight || rateMaxWeight >= 1);
    case '1-5kg':
      return (!rateMinWeight || rateMinWeight <= 5) && (!rateMaxWeight || rateMaxWeight >= 1);
    case '5-10kg':
      return (!rateMinWeight || rateMinWeight <= 10) && (!rateMaxWeight || rateMaxWeight >= 5);
    case '10kg+':
      return !rateMaxWeight || rateMaxWeight >= 10;
    default:
      return true;
  }
};

// Helper function to apply filters
const applyFilters = (shippingRates, filters) => {
  let filtered = [...shippingRates];

  // Apply search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(rate =>
      rate.rateName.toLowerCase().includes(query) ||
      rate.description.toLowerCase().includes(query) ||
      rate.zoneId.toLowerCase().includes(query)
    );
  }

  // Apply zone filter (multiple zones)
  if (filters.zones.length > 0 && !filters.zones.includes('all')) {
    filtered = filtered.filter(rate =>
      filters.zones.includes(rate.zoneId)
    );
  }

  // Apply price range filter (multiple price ranges)
  if (filters.priceRanges.length > 0) {
    filtered = filtered.filter(rate => {
      const ratePrice = rate.price || 0;
      return filters.priceRanges.some(priceRange =>
        matchesPriceRange(ratePrice, priceRange)
      );
    });
  }

  // Apply weight range filter (multiple weight ranges)
  if (filters.weightRanges.length > 0) {
    filtered = filtered.filter(rate =>
      filters.weightRanges.some(weightRange =>
        matchesWeightRange(rate.minWeight, rate.maxWeight, weightRange)
      )
    );
  }

  // Apply free shipping filter
  if (filters.isFree && filters.isFree !== 'all') {
    filtered = filtered.filter(rate => {
      switch (filters.isFree) {
        case 'free':
          return rate.isFree === true || rate.price === 0;
        case 'paid':
          return rate.isFree === false && rate.price > 0;
        default:
          return true;
      }
    });
  }

  // Apply active status filter
  if (filters.isActive !== 'all') {
    filtered = filtered.filter(rate => rate.isActive === filters.isActive);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low-to-high':
        return (a.price || 0) - (b.price || 0);
      case 'price-high-to-low':
        return (b.price || 0) - (a.price || 0);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'rateName':
      default:
        return a.rateName.localeCompare(b.rateName);
    }
  });

  return filtered;
};

// Shipping rates slice
const shippingRatesSlice = createSlice({
  name: 'shippingRates',
  initialState,
  reducers: {
    // Clear shipping rates
    clearShippingRates: (state) => {
      state.shippingRates = [];
      state.filteredShippingRates = [];
      state.total = 0;
      state.codCharge = 0;
      state.error = null;
    },

    // Set multiple filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters immediately
      state.filteredShippingRates = applyFilters(state.shippingRates, state.filters);
    },

    // Set multiple zones
    setZones: (state, action) => {
      state.filters.zones = action.payload;
      state.filteredShippingRates = applyFilters(state.shippingRates, state.filters);
    },

    // Set multiple price ranges
    setPriceRanges: (state, action) => {
      state.filters.priceRanges = action.payload;
      state.filteredShippingRates = applyFilters(state.shippingRates, state.filters);
    },

    // Set multiple weight ranges
    setWeightRanges: (state, action) => {
      state.filters.weightRanges = action.payload;
      state.filteredShippingRates = applyFilters(state.shippingRates, state.filters);
    },

    // Set free shipping filter
    setIsFree: (state, action) => {
      state.filters.isFree = action.payload;
      state.filteredShippingRates = applyFilters(state.shippingRates, state.filters);
    },

    // Set active status filter
    setIsActive: (state, action) => {
      state.filters.isActive = action.payload;
      state.filteredShippingRates = applyFilters(state.shippingRates, state.filters);
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredShippingRates = state.shippingRates;
    },

    // Set search query
    setSearchQuery: (state, action) => {
      state.filters.searchQuery = action.payload;
      state.filteredShippingRates = applyFilters(state.shippingRates, state.filters);
    },

    // Set sort by
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
      state.filteredShippingRates = applyFilters(state.shippingRates, state.filters);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shipping rates pending
      .addCase(fetchShippingRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fetch shipping rates fulfilled
      .addCase(fetchShippingRates.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingRates = action.payload.shippingRates || [];
        state.codCharge = action.payload.codCharge || 0; // Store COD charge
        state.total = action.payload.total || 0;
        state.lastFetched = new Date().toISOString();
        state.error = null;
        // Apply current filters to new shipping rates
        state.filteredShippingRates = applyFilters(state.shippingRates, state.filters);
      })
      // Fetch shipping rates rejected
      .addCase(fetchShippingRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.shippingRates = [];
        state.filteredShippingRates = [];
        state.codCharge = 0;
        state.total = 0;
      });
  },
});

// Export actions
export const {
  clearShippingRates,
  setFilters,
  setZones,
  setPriceRanges,
  setWeightRanges,
  setIsFree,
  setIsActive,
  resetFilters,
  setSearchQuery,
  setSortBy,
  clearError,
} = shippingRatesSlice.actions;

// Selectors
export const selectShippingRates = (state) => state.shippingRates.shippingRates;
export const selectFilteredShippingRates = (state) => state.shippingRates.filteredShippingRates;
export const selectShippingRatesLoading = (state) => state.shippingRates.loading;
export const selectShippingRatesError = (state) => state.shippingRates.error;
export const selectShippingRatesTotal = (state) => state.shippingRates.total;
export const selectShippingRatesFilters = (state) => state.shippingRates.filters;
export const selectShippingRatesLastFetched = (state) => state.shippingRates.lastFetched;
export const selectCodCharge = (state) => state.shippingRates.codCharge; // NEW: Selector for COD charge

// Export reducer
export default shippingRatesSlice.reducer;