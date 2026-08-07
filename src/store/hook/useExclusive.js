// hooks/useExclusiveProducts.js
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExclusiveProducts,
  setFilters,
  setCategories,
  setPriceRanges,
  setDietTypes,
  setAvailability,
  resetFilters,
  setSearchQuery,
  setSortBy,
  clearExclusiveProducts,
  clearError,
  selectExclusiveProducts,
  selectFilteredExclusiveProducts,
  selectExclusiveProductsLoading,
  selectExclusiveProductsError,
  selectExclusiveProductsTotal,
  selectExclusiveProductsFilters,
  selectExclusiveProductsLastFetched,
} from '../slice/ExclusiveSlice';

const useExclusiveProducts = (options = {}) => {
  const {
    autoFetch = true,
    refetchInterval = null,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const dispatch = useDispatch();

  // Selectors
  const products = useSelector(selectExclusiveProducts);
  const filteredProducts = useSelector(selectFilteredExclusiveProducts);
  const loading = useSelector(selectExclusiveProductsLoading);
  const error = useSelector(selectExclusiveProductsError);
  const total = useSelector(selectExclusiveProductsTotal);
  const filters = useSelector(selectExclusiveProductsFilters);
  const lastFetched = useSelector(selectExclusiveProductsLastFetched);

  // Check if data is stale
  const isStale = useMemo(() => {
    if (!lastFetched) return true;
    return Date.now() - new Date(lastFetched).getTime() > staleTime;
  }, [lastFetched, staleTime]);

  // Fetch exclusive products function
  const refetch = useCallback(() => {
    dispatch(fetchExclusiveProducts());
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

  // Update diet types
  const updateDietTypes = useCallback((dietTypes) => {
    dispatch(setDietTypes(dietTypes));
  }, [dispatch]);

  // Update availability
  const updateAvailability = useCallback((availability) => {
    dispatch(setAvailability(availability));
  }, [dispatch]);

  // Update filters from sidebar
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

    // Handle diet types
    if (sidebarFilters.dietType && Array.isArray(sidebarFilters.dietType)) {
      newFilters.dietType = sidebarFilters.dietType;
    }

    // Handle availability
    if (sidebarFilters.availability) {
      newFilters.availability = sidebarFilters.availability;
    }

    dispatch(setFilters(newFilters));
  }, [dispatch]);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Clear products
  const clearAllProducts = useCallback(() => {
    dispatch(clearExclusiveProducts());
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

  // Get unique diet types from products
  const availableDietTypes = useMemo(() => {
    const dietTypes = new Set();
    products.forEach(product => {
      if (product.dietType) {
        dietTypes.add(product.dietType);
      }
    });
    return Array.from(dietTypes);
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

  // Get availability statistics
  const availabilityStats = useMemo(() => {
    const stats = {
      total: products.length,
      inStock: 0,
      outOfStock: 0,
      lowStock: 0,
    };

    products.forEach(product => {
      switch (product.availability) {
        case 'In stock':
          stats.inStock++;
          break;
        case 'Out of stock':
          stats.outOfStock++;
          break;
        case 'Low stock':
          stats.lowStock++;
          break;
      }
    });

    return stats;
  }, [products]);

  // Get products with offers
  const productsWithOffers = useMemo(() => {
    return products.filter(product => 
      product.offerPercentage && product.offerPercentage > 0
    );
  }, [products]);

  // Get products by category
  const productsByCategory = useMemo(() => {
    const categoryMap = {};
    products.forEach(product => {
      const category = product.categoryName || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push(product);
    });
    return categoryMap;
  }, [products]);

  // Get featured products (high offers or new products)
  const featuredProducts = useMemo(() => {
    return products
      .filter(product => 
        product.offerPercentage > 20 || 
        new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      )
      .slice(0, 6);
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

  // Get product by ID
  const getProductById = useCallback((productId) => {
    return products.find(product => product.id === productId || product.productId === productId);
  }, [products]);

  // Search products
  const searchProducts = useCallback((query) => {
    updateSearchQuery(query);
  }, [updateSearchQuery]);

useEffect(() => {
  console.log("🛒 products from Redux:", products);
  console.log("🧹 filteredProducts from Redux:", filteredProducts);
}, [products, filteredProducts]);
  

  return {
    // Data
    products,
    filteredProducts,
    total,
    filters,
    lastFetched,
    isStale,
    availableCategories,
    availableDietTypes,
    priceStats,
    availabilityStats,
    productsWithOffers,
    productsByCategory,
    featuredProducts,
    
    // State
    loading,
    error,
    
    // Actions
    refetch,
    updateSortBy,
    updateSearchQuery,
    updateCategories,
    updatePriceRanges,
    updateDietTypes,
    updateAvailability,
    updateFiltersFromSidebar,
    resetAllFilters,
    clearAllProducts,
    clearProductsError,
    getProductById,
    searchProducts,
  };
};

export default useExclusiveProducts;