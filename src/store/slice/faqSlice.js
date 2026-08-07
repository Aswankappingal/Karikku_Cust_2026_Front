// src/store/slices/faqSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import baseUrl from '../../baseUrl';

// Thunk to fetch FAQ categories with FAQs
export const fetchFaqCategoriesWithFaqs = createAsyncThunk(
  'faqs/fetchFaqCategoriesWithFaqs', 
  async () => {
    const localData = localStorage.getItem('faqCategoriesWithFaqs');

    if (localData) {
      // Return cached data first
      return JSON.parse(localData);
    }

    // If no local data, fetch from API
    const response = await axios.get(`${baseUrl}/faq-categories-with-faqs`);

    if (response.data?.success) {
      localStorage.setItem('faqCategoriesWithFaqs', JSON.stringify(response.data.data));
      return response.data.data;
    }

    throw new Error('Failed to fetch FAQ categories with FAQs');
  }
);

// Thunk to fetch FAQs by category ID
export const fetchFaqsByCategory = createAsyncThunk(
  'faqs/fetchFaqsByCategory', 
  async (categoryId) => {
    const cacheKey = `faqs_category_${categoryId}`;
    const localData = localStorage.getItem(cacheKey);

    if (localData) {
      // Return cached data first
      return JSON.parse(localData);
    }

    // If no local data, fetch from API
    const response = await axios.get(`${baseUrl}/faqs/${categoryId}`);

    if (response.data?.success) {
      const categoryData = {
        category: response.data.category,
        faqs: response.data.faqs,
        totalFAQs: response.data.totalFAQs
      };
      localStorage.setItem(cacheKey, JSON.stringify(categoryData));
      return categoryData;
    }

    throw new Error('Failed to fetch FAQs for category');
  }
);

const faqSlice = createSlice({
  name: 'faqs',
  initialState: {
    categoriesWithFaqs: [],
    currentCategoryData: null,
    loading: false,
    categoryLoading: false,
    error: null,
    categoryError: null
  },
  reducers: {
    clearFaqs: (state) => {
      state.categoriesWithFaqs = [];
      state.currentCategoryData = null;
      // Clear all FAQ related data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('faqs_category_') || key === 'faqCategoriesWithFaqs') {
          localStorage.removeItem(key);
        }
      });
    },
    clearCurrentCategoryData: (state) => {
      state.currentCategoryData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch FAQ Categories with FAQs
      .addCase(fetchFaqCategoriesWithFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqCategoriesWithFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.categoriesWithFaqs = action.payload;
      })
      .addCase(fetchFaqCategoriesWithFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch FAQs by Category
      .addCase(fetchFaqsByCategory.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchFaqsByCategory.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.currentCategoryData = action.payload;
      })
      .addCase(fetchFaqsByCategory.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.error.message;
      });
  }
});

export const { clearFaqs, clearCurrentCategoryData } = faqSlice.actions;
export default faqSlice.reducer;