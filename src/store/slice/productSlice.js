// store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import baseUrl from '../../baseUrl';

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  // Fetch from API directly
  const response = await axios.get(`${baseUrl}/getAllProducts`);

  console.log("this is response data", response.data);

  if (response.data?.success) {
    return response.data;
  }

  throw new Error('Failed to fetch products');
});

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
    colors: [], // Multiple colors
    availability: 'all', // all, in-stock, out-of-stock, low-stock
    sortBy: 'name', // name, price-low-to-high, price-high-to-low, newest
    searchQuery: '',
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

// Helper function to check if product has matching colors
const hasMatchingColors = (product, selectedColors) => {
  if (!product.variantCombinations || product.variantCombinations.length === 0) {
    return false;
  }

  return product.variantCombinations.some(variant =>
    selectedColors.some(selectedColor =>
      variant.color && variant.color.toLowerCase() === selectedColor.toLowerCase()
    )
  );
};

// Helper function to apply filters
const applyFilters = (products, filters) => {
  let filtered = [...products];

  // Apply search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.categoryName.toLowerCase().includes(query)
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

  // Apply colors filter (multiple colors)
  if (filters.colors.length > 0) {
    filtered = filtered.filter(product =>
      hasMatchingColors(product, filters.colors)
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
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filtered;
};

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Clear products
    clearProducts: (state) => {
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

    // Set multiple colors
    setColors: (state, action) => {
      state.filters.colors = action.payload;
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
      // Fetch products pending
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fetch products fulfilled
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.total = action.payload.total || 0;
        state.lastFetched = new Date().toISOString(); // Set current timestamp
        state.error = null;
        // Apply current filters to new products
        state.filteredProducts = applyFilters(state.products, state.filters);
      })
      // Fetch products rejected
      .addCase(fetchProducts.rejected, (state, action) => {
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
  clearProducts,
  setFilters,
  setCategories,
  setPriceRanges,
  setColors,
  resetFilters,
  setSearchQuery,
  setSortBy,
  clearError,
} = productsSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectFilteredProducts = (state) => state.products.filteredProducts;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsTotal = (state) => state.products.total;
export const selectProductsFilters = (state) => state.products.filters;
export const selectLastFetched = (state) => state.products.lastFetched;

// Export reducer
export default productsSlice.reducer;