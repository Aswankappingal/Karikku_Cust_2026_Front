// hooks/useProducts.js
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts,
  setFilters,
  setCategories,
  setPriceRanges,
  setColors,
  resetFilters,
  setSearchQuery,
  setSortBy,
  clearProducts,
  clearError,
  selectProducts,
  selectFilteredProducts,
  selectProductsLoading,
  selectProductsError,
  selectProductsTotal,
  selectProductsFilters,
  selectLastFetched,
} from '../slice/productSlice';

const useProducts = (options = {}) => {
  const {
    autoFetch = true,
    refetchInterval = null,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const dispatch = useDispatch();

  // Selectors
  const products = useSelector(selectProducts);
  const filteredProducts = useSelector(selectFilteredProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const total = useSelector(selectProductsTotal);
  const filters = useSelector(selectProductsFilters);
  const lastFetched = useSelector(selectLastFetched);

  // Check if data is stale
  const isStale = useMemo(() => {
    if (!lastFetched) return true;
    return Date.now() - new Date(lastFetched).getTime() > staleTime;
  }, [lastFetched, staleTime]);

  // Fetch products function
  const refetch = useCallback(() => {
    dispatch(fetchProducts());
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

  // Update multiple price ranges
  const updatePriceRanges = useCallback((priceRanges) => {
    dispatch(setPriceRanges(priceRanges));
  }, [dispatch]);

  // Update multiple colors
  const updateColors = useCallback((colors) => {
    dispatch(setColors(colors));
  }, [dispatch]);

  // Update filters from sidebar (for backward compatibility)
  const updateFiltersFromSidebar = useCallback((sidebarFilters) => {
    const newFilters = {};

    // Handle multiple categories
    if (sidebarFilters.categories && Array.isArray(sidebarFilters.categories)) {
      newFilters.categories = sidebarFilters.categories;
    }

    // Handle multiple price ranges
    if (sidebarFilters.price && Array.isArray(sidebarFilters.price)) {
      newFilters.priceRanges = sidebarFilters.price;
    }

    // Handle multiple colors
    if (sidebarFilters.colors && Array.isArray(sidebarFilters.colors)) {
      newFilters.colors = sidebarFilters.colors;
    }

    dispatch(setFilters(newFilters));
  }, [dispatch]);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Clear products
  const clearAllProducts = useCallback(() => {
    dispatch(clearProducts());
  }, [dispatch]);

  // Clear error
  const clearProductsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const categories = new Set();
    products.forEach(product => {
      if (product.categoryName) {
        categories.add(product.categoryName);
      }
    });
    return Array.from(categories);
  }, [products]);

  // Get unique colors from products
  const availableColors = useMemo(() => {
    const colors = new Set();
    products.forEach(product => {
      if (product.variantCombinations && Array.isArray(product.variantCombinations)) {
        product.variantCombinations.forEach(variant => {
          if (variant.color) {
            colors.add(variant.color);
          }
        });
      }
    });
    return Array.from(colors);
  }, [products]);

  // Get price range statistics
  const priceStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const prices = products.map(p => p.sellingPrice || p.price || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
    };
  }, [products]);

  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch && (products.length === 0 || isStale)) {
      refetch();
    }
  }, [autoFetch, products.length, isStale, refetch]);

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
    products,
    filteredProducts,
    total,
    filters,
    lastFetched,
    isStale,
    availableCategories,
    availableColors,
    priceStats,
    
    // State
    loading,
    error,
    
    // Actions
    refetch,
    updateSortBy,
    updateSearchQuery,
    updateCategories,
    updatePriceRanges,
    updateColors,
    updateFiltersFromSidebar,
    resetAllFilters,
    clearAllProducts,
    clearProductsError,
  };
};

export default useProducts;