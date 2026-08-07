// store/slices/categoriesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import baseUrl from '../../baseUrl';

// Async thunk for fetching categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 100, search = '', parentCategory = null } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        ...(parentCategory && { parentCategory })
      });

      const response = await fetch(`${baseUrl}/get-categories?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch categories');
      }

      return {
        categories: data.categories || [],
        pagination: data.pagination,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status || 500,
      });
    }
  }
);

// Async thunk for fetching products by category
export const fetchProductsByCategory = createAsyncThunk(
  'categories/fetchProductsByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseUrl}/getProductsByCategory/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      return {
        products: data.products || [],
        categoryId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status || 500,
      });
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  categoryProducts: {}, // Store products by category ID
  selectedCategory: null,
  loading: false,
  productsLoading: false,
  error: null,
  productsError: null,
  lastFetched: null,
  pagination: null,
  searchQuery: '',
};

// Categories slice
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Clear categories
    clearCategories: (state) => {
      state.categories = [];
      state.categoryProducts = {};
      state.error = null;
      state.selectedCategory = null;
    },

    // Set selected category
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },

    // Set search query
    setCategoriesSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    // Clear error
    clearCategoriesError: (state) => {
      state.error = null;
      state.productsError = null;
    },

    // Clear category products
    clearCategoryProducts: (state, action) => {
      const categoryId = action.payload;
      if (categoryId) {
        delete state.categoryProducts[categoryId];
      } else {
        state.categoryProducts = {};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.pagination = action.payload.pagination;
        state.lastFetched = action.payload.timestamp;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          message: 'Failed to fetch categories',
          status: 500,
        };
      })
      
      // Fetch products by category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.productsLoading = false;
        const { products, categoryId } = action.payload;
        state.categoryProducts[categoryId] = products;
        state.productsError = null;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload || {
          message: 'Failed to fetch products',
          status: 500,
        };
      });
  },
});

// Export actions
export const {
  clearCategories,
  setSelectedCategory,
  setCategoriesSearchQuery,
  clearCategoriesError,
  clearCategoryProducts,
} = categoriesSlice.actions;

// Selectors
export const selectCategories = (state) => state.categories.categories;
export const selectCategoryProducts = (state) => state.categories.categoryProducts;
export const selectSelectedCategory = (state) => state.categories.selectedCategory;
export const selectCategoriesLoading = (state) => state.categories.loading;
export const selectProductsLoading = (state) => state.categories.productsLoading;
export const selectCategoriesError = (state) => state.categories.error;
export const selectProductsError = (state) => state.categories.productsError;
export const selectCategoriesPagination = (state) => state.categories.pagination;
export const selectCategoriesSearchQuery = (state) => state.categories.searchQuery;
export const selectCategoriesLastFetched = (state) => state.categories.lastFetched;

// Export reducer
export default categoriesSlice.reducer;