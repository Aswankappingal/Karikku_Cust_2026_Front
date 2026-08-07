// store/slices/exclusiveProductsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import baseUrl from '../../baseUrl';

// Async thunk for fetching exclusive products
export const fetchExclusiveProducts = createAsyncThunk(
  'exclusiveProducts/fetchExclusiveProducts', 
  async () => {
    console.log("🌐 Fetching from API...");

    const response = await axios.get(`${baseUrl}/get-exclusive-Products`);
    
    if (response.data?.success) {
      return response.data;
    }

    throw new Error('Failed to fetch exclusive products');
  }
);

// Initial state
const initialState = {
  products: [],
  filteredProducts: [],
  total: 0,
  loading: false,
  error: null,
  lastFetched: null,
  filters: {
    categories: [], // Multiple categories
    priceRanges: [], // Multiple price ranges
    availability: 'all', // all, in-stock, out-of-stock, low-stock
    sortBy: 'name', // name, price-low-to-high, price-high-to-low, newest
    searchQuery: '',
    dietType: [], // Veg, Non-Veg, Vegan, etc.
  },
};

// Helper function to check if product matches price range
const matchesPriceRange = (productPrice, priceRange) => {
  switch (priceRange) {
    case '₹0 - ₹100':
      return productPrice >= 0 && productPrice <= 100;
    case '₹100 - ₹300':
      return productPrice > 100 && productPrice <= 300;
    case '₹300 - ₹500':
      return productPrice > 300 && productPrice <= 500;
    case '₹500 - ₹1000':
      return productPrice > 500 && productPrice <= 1000;
    case '₹1000+':
      return productPrice > 1000;
    default:
      return true;
  }
};

// Helper function to apply filters
const applyFilters = (products, filters) => {
  let filtered = [...products];

  // Apply search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(product => 
      (product.name || '').toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query) ||
      (product.categoryName || '').toLowerCase().includes(query) ||
      (product.ingredients || '').toLowerCase().includes(query) ||
      (product.features || '').toLowerCase().includes(query)
    );
  }

  // Apply category filter (multiple categories)
  if (filters.categories.length > 0 && !filters.categories.includes('all')) {
    filtered = filtered.filter(product => 
      filters.categories.includes(product.categoryId) || 
      filters.categories.includes(product.categoryName)
    );
  }

  // Apply price range filter (multiple price ranges)
  if (filters.priceRanges.length > 0) {
    filtered = filtered.filter(product => {
      const productPrice = product.sellingPrice || product.price || 0;
      return filters.priceRanges.some(priceRange => 
        matchesPriceRange(productPrice, priceRange)
      );
    });
  }

  // Apply diet type filter
  if (filters.dietType.length > 0) {
    filtered = filtered.filter(product => 
      filters.dietType.includes(product.dietType)
    );
  }

  // Apply availability filter
  if (filters.availability && filters.availability !== 'all') {
    filtered = filtered.filter(product => {
      switch (filters.availability) {
        case 'in-stock':
          return product.availability === 'In stock';
        case 'out-of-stock':
          return product.availability === 'Out of stock';
        case 'low-stock':
          return product.availability === 'Low stock';
        default:
          return true;
      }
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low-to-high':
        return (a.sellingPrice || a.price || 0) - (b.sellingPrice || b.price || 0);
      case 'price-high-to-low':
        return (b.sellingPrice || b.price || 0) - (a.sellingPrice || a.price || 0);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'offer':
        return (b.offerPercentage || 0) - (a.offerPercentage || 0);
      case 'name':
      default:
        return (a.name || '').localeCompare(b.name || '');
    }
  });

  return filtered;
};

// Exclusive products slice
const exclusiveProductsSlice = createSlice({
  name: 'exclusiveProducts',
  initialState,
  reducers: {
    // Clear exclusive products
    clearExclusiveProducts: (state) => {
      state.products = [];
      state.filteredProducts = [];
      state.total = 0;
      state.error = null;
    },

    // Set multiple filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters immediately
      state.filteredProducts = applyFilters(state.products, state.filters);
    },

    // Set multiple categories
    setCategories: (state, action) => {
      state.filters.categories = action.payload;
      state.filteredProducts = applyFilters(state.products, state.filters);
    },

    // Set multiple price ranges
    setPriceRanges: (state, action) => {
      state.filters.priceRanges = action.payload;
      state.filteredProducts = applyFilters(state.products, state.filters);
    },

    // Set diet types
    setDietTypes: (state, action) => {
      state.filters.dietType = action.payload;
      state.filteredProducts = applyFilters(state.products, state.filters);
    },

    // Set availability filter
    setAvailability: (state, action) => {
      state.filters.availability = action.payload;
      state.filteredProducts = applyFilters(state.products, state.filters);
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredProducts = state.products;
    },

    // Set search query
    setSearchQuery: (state, action) => {
      state.filters.searchQuery = action.payload;
      state.filteredProducts = applyFilters(state.products, state.filters);
    },

    // Set sort by
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
      state.filteredProducts = applyFilters(state.products, state.filters);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch exclusive products pending
      .addCase(fetchExclusiveProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fetch exclusive products fulfilled
      .addCase(fetchExclusiveProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.total = action.payload.total || 0;
        state.lastFetched = action.payload.timestamp || new Date().toISOString();
        state.error = null;
        // Apply current filters to new products
        state.filteredProducts = applyFilters(state.products, state.filters);
      })
      // Fetch exclusive products rejected
      .addCase(fetchExclusiveProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.products = [];
        state.filteredProducts = [];
        state.total = 0;
      });
  },
});

// Export actions
export const {
  clearExclusiveProducts,
  setFilters,
  setCategories,
  setPriceRanges,
  setDietTypes,
  setAvailability,
  resetFilters,
  setSearchQuery,
  setSortBy,
  clearError,
} = exclusiveProductsSlice.actions;

// FIXED SELECTORS - Now accessing state.exclusive instead of state.exclusiveProducts
export const selectExclusiveProducts = (state) => state.exclusive.products;
export const selectFilteredExclusiveProducts = (state) => state.exclusive.filteredProducts;
export const selectExclusiveProductsLoading = (state) => state.exclusive.loading;
export const selectExclusiveProductsError = (state) => state.exclusive.error;
export const selectExclusiveProductsTotal = (state) => state.exclusive.total;
export const selectExclusiveProductsFilters = (state) => state.exclusive.filters;
export const selectExclusiveProductsLastFetched = (state) => state.exclusive.lastFetched;

// Export reducer
export default exclusiveProductsSlice.reducer;