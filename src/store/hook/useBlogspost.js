// hooks/useBlogs.js
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBlogs,
  setFilters,
  setCategories,
  setSortBy,
  resetFilters,
  setSearchQuery,
  clearBlogs,
  clearError,
  selectBlogs,
  selectFilteredBlogs,
  selectBlogsLoading,
  selectBlogsError,
  selectBlogsTotal,
  selectBlogsFilters,
  selectLastFetched,
} from '../slice/blogspostSlice';

const useBlogs = (options = {}) => {
  const {
    autoFetch = true,
    refetchInterval = null,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const dispatch = useDispatch();

  // Selectors
  const blogs = useSelector(selectBlogs);
  const filteredBlogs = useSelector(selectFilteredBlogs);
  const loading = useSelector(selectBlogsLoading);
  const error = useSelector(selectBlogsError);
  const total = useSelector(selectBlogsTotal);
  const filters = useSelector(selectBlogsFilters);
  const lastFetched = useSelector(selectLastFetched);

  // Check if data is stale
  const isStale = useMemo(() => {
    if (!lastFetched) return true;
    return Date.now() - new Date(lastFetched).getTime() > staleTime;
  }, [lastFetched, staleTime]);

  // Fetch blogs function
  const refetch = useCallback(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  // Update sort by
  const updateSortBy = useCallback((sortBy) => {
    dispatch(setSortBy(sortBy));
  }, [dispatch]);

  // Update search query
  const updateSearchQuery = useCallback((query) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  // Update multiple categories
  const updateCategories = useCallback((categories) => {
    dispatch(setCategories(categories));
  }, [dispatch]);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Clear blogs
  const clearAllBlogs = useCallback(() => {
    dispatch(clearBlogs());
  }, [dispatch]);

  // Clear error
  const clearBlogsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Get unique categories from blogs
  const availableCategories = useMemo(() => {
    const categories = new Set();
    blogs.forEach(blog => {
      if (blog.category) {
        categories.add(blog.category);
      }
    });
    return Array.from(categories);
  }, [blogs]);

  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch && (blogs.length === 0 || isStale)) {
      refetch();
    }
  }, [autoFetch, blogs.length, isStale, refetch]);

  // Refetch interval effect
  useEffect(() => {
    if (!refetchInterval) return;

    const intervalId = setInterval(() => {
      if (isStale) {
        refetch();
      }
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [refetchInterval, isStale, refetch]);

  

  return {
    // Data
    blogs,
    filteredBlogs,
    total,
    filters,
    lastFetched,
    isStale,
    availableCategories,
    
    // State
    loading,
    error,
    
    // Actions
    refetch,
    updateSortBy,
    updateSearchQuery,
    updateCategories,
    resetAllFilters,
    clearAllBlogs,
    clearBlogsError,
  };
};

export default useBlogs;