// store/slices/blogSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import baseUrl from '../../baseUrl';

// Async thunk for fetching blogs with authorization
export const fetchBlogs = createAsyncThunk('blogs/fetchBlogs', async () => {
 

  const response = await axios.get(`${baseUrl}/get-blog-posts`, {
 
  });

  if (response.data?.success) {
    return response.data;
  }

  throw new Error('Failed to fetch blogs');
});

// Initial state
const initialState = {
  blogs: [],
  filteredBlogs: [],
  total: 0,
  loading: false,
  error: null,
  lastFetched: null,
  filters: {
    categories: [], // Multiple categories
    sortBy: 'date', // date, title
    searchQuery: '',
  },
};

// Helper function to apply filters
const applyFilters = (blogs, filters) => {
  let filtered = [...blogs];

  // Apply search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(blog =>
      blog.title.toLowerCase().includes(query) ||
      blog.content.toLowerCase().includes(query) ||
      (blog.category && blog.category.toLowerCase().includes(query))
    );
  }

  // Apply category filter (multiple categories)
  if (filters.categories.length > 0 && !filters.categories.includes('all')) {
    filtered = filtered.filter(blog =>
      blog.category && filters.categories.includes(blog.category)
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return filtered;
};

// Blogs slice
const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    // Clear blogs
    clearBlogs: (state) => {
      state.blogs = [];
      state.filteredBlogs = [];
      state.total = 0;
      state.error = null;
    },

    // Set multiple filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredBlogs = applyFilters(state.blogs, state.filters);
    },

    // Set multiple categories
    setCategories: (state, action) => {
      state.filters.categories = action.payload;
      state.filteredBlogs = applyFilters(state.blogs, state.filters);
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredBlogs = state.blogs;
    },

    // Set search query
    setSearchQuery: (state, action) => {
      state.filters.searchQuery = action.payload;
      state.filteredBlogs = applyFilters(state.blogs, state.filters);
    },

    // Set sort by
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
      state.filteredBlogs = applyFilters(state.blogs, state.filters);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch blogs pending
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fetch blogs fulfilled
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure imageUrls is an array, default to empty array if undefined
        state.blogs = (action.payload.blogPosts || []).map(blog => ({
          ...blog,
          imageUrls: Array.isArray(blog.imageUrls) ? blog.imageUrls : [],
        }));
        state.total = state.blogs.length || 0;
        state.lastFetched = new Date().toISOString();
        state.error = null;
        state.filteredBlogs = applyFilters(state.blogs, state.filters);
      })
      // Fetch blogs rejected
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.blogs = [];
        state.filteredBlogs = [];
        state.total = 0;
      });
  },
});

// Export actions
export const {
  clearBlogs,
  setFilters,
  setCategories,
  resetFilters,
  setSearchQuery,
  setSortBy,
  clearError,
} = blogSlice.actions;

// Selectors
export const selectBlogs = (state) => state.blogs.blogs;
export const selectFilteredBlogs = (state) => state.blogs.filteredBlogs;
export const selectBlogsLoading = (state) => state.blogs.loading;
export const selectBlogsError = (state) => state.blogs.error;
export const selectBlogsTotal = (state) => state.blogs.total;
export const selectBlogsFilters = (state) => state.blogs.filters;
export const selectLastFetched = (state) => state.blogs.lastFetched;

// Export reducer
export default blogSlice.reducer;