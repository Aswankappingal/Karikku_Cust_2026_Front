// hooks/useShippingRates.js
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchShippingRates,
  setFilters,
  setZones,
  setPriceRanges,
  setWeightRanges,
  setIsFree,
  setIsActive,
  resetFilters,
  setSearchQuery,
  setSortBy,
  clearShippingRates,
  clearError,
  selectShippingRates,
  selectFilteredShippingRates,
  selectShippingRatesLoading,
  selectShippingRatesError,
  selectShippingRatesTotal,
  selectShippingRatesFilters,
  selectShippingRatesLastFetched,
  selectCodCharge, // ✅ NEW: Import COD charge selector
} from '../slice/shippingRatesSlice';

const useShippingRates = (options = {}) => {
  const {
    autoFetch = true,
    refetchInterval = null,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const dispatch = useDispatch();

  // Selectors
  const shippingRates = useSelector(selectShippingRates);
  const filteredShippingRates = useSelector(selectFilteredShippingRates);
  const loading = useSelector(selectShippingRatesLoading);
  const error = useSelector(selectShippingRatesError);
  const total = useSelector(selectShippingRatesTotal);
  const filters = useSelector(selectShippingRatesFilters);
  const lastFetched = useSelector(selectShippingRatesLastFetched);
  const codCharge = useSelector(selectCodCharge); // ✅ NEW: Get COD charge from state

  // Check if data is stale
  const isStale = useMemo(() => {
    if (!lastFetched) return true;
    return Date.now() - new Date(lastFetched).getTime() > staleTime;
  }, [lastFetched, staleTime]);

  // Fetch shipping rates function
  const refetch = useCallback(() => {
    dispatch(fetchShippingRates());
  }, [dispatch]);

  // Update sort by
  const updateSortBy = useCallback((sortBy) => {
    dispatch(setSortBy(sortBy));
  }, [dispatch]);

  // Update search query
  const updateSearchQuery = useCallback((query) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  // Update multiple zones
  const updateZones = useCallback((zones) => {
    dispatch(setZones(zones));
  }, [dispatch]);

  // Update multiple price ranges
  const updatePriceRanges = useCallback((priceRanges) => {
    dispatch(setPriceRanges(priceRanges));
  }, [dispatch]);

  // Update multiple weight ranges
  const updateWeightRanges = useCallback((weightRanges) => {
    dispatch(setWeightRanges(weightRanges));
  }, [dispatch]);

  // Update free shipping filter
  const updateIsFree = useCallback((isFree) => {
    dispatch(setIsFree(isFree));
  }, [dispatch]);

  // Update active status filter
  const updateIsActive = useCallback((isActive) => {
    dispatch(setIsActive(isActive));
  }, [dispatch]);

  // Update filters from sidebar (for backward compatibility)
  const updateFiltersFromSidebar = useCallback((sidebarFilters) => {
    const newFilters = {};

    // Handle multiple zones
    if (sidebarFilters.zones && Array.isArray(sidebarFilters.zones)) {
      newFilters.zones = sidebarFilters.zones;
    }

    // Handle multiple price ranges
    if (sidebarFilters.priceRanges && Array.isArray(sidebarFilters.priceRanges)) {
      newFilters.priceRanges = sidebarFilters.priceRanges;
    }

    // Handle multiple weight ranges
    if (sidebarFilters.weightRanges && Array.isArray(sidebarFilters.weightRanges)) {
      newFilters.weightRanges = sidebarFilters.weightRanges;
    }

    // Handle free shipping filter
    if (sidebarFilters.isFree !== undefined) {
      newFilters.isFree = sidebarFilters.isFree;
    }

    // Handle active status filter
    if (sidebarFilters.isActive !== undefined) {
      newFilters.isActive = sidebarFilters.isActive;
    }

    dispatch(setFilters(newFilters));
  }, [dispatch]);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Clear shipping rates
  const clearAllShippingRates = useCallback(() => {
    dispatch(clearShippingRates());
  }, [dispatch]);

  // Clear error
  const clearShippingRatesError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Get unique zones from shipping rates
  const availableZones = useMemo(() => {
    const zones = new Set();
    shippingRates.forEach(rate => {
      if (rate.zoneId) {
        zones.add(rate.zoneId);
      }
    });
    return Array.from(zones);
  }, [shippingRates]);

  // Get price range statistics
  const priceStats = useMemo(() => {
    if (shippingRates.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const prices = shippingRates.map(rate => rate.price || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
    };
  }, [shippingRates]);

  // Get weight range statistics
  const weightStats = useMemo(() => {
    if (shippingRates.length === 0) return { minWeight: 0, maxWeight: 0 };
    
    const weights = shippingRates.filter(rate => rate.minWeight !== null && rate.maxWeight !== null);
    if (weights.length === 0) return { minWeight: 0, maxWeight: 0 };
    
    const minWeights = weights.map(rate => rate.minWeight || 0);
    const maxWeights = weights.map(rate => rate.maxWeight || 0);
    
    return {
      minWeight: Math.min(...minWeights),
      maxWeight: Math.max(...maxWeights)
    };
  }, [shippingRates]);

  // Get free vs paid shipping counts
  const shippingTypeStats = useMemo(() => {
    const freeCount = shippingRates.filter(rate => rate.isFree || rate.price === 0).length;
    const paidCount = shippingRates.length - freeCount;
    
    return {
      free: freeCount,
      paid: paidCount,
      total: shippingRates.length
    };
  }, [shippingRates]);

  // Get active vs inactive counts
  const activeStats = useMemo(() => {
    const activeCount = shippingRates.filter(rate => rate.isActive).length;
    const inactiveCount = shippingRates.length - activeCount;
    
    return {
      active: activeCount,
      inactive: inactiveCount,
      total: shippingRates.length
    };
  }, [shippingRates]);

  // Find cheapest and most expensive rates
  const rateExtremes = useMemo(() => {
    if (shippingRates.length === 0) return { cheapest: null, mostExpensive: null };
    
    const sortedByPrice = [...shippingRates].sort((a, b) => (a.price || 0) - (b.price || 0));
    
    return {
      cheapest: sortedByPrice[0],
      mostExpensive: sortedByPrice[sortedByPrice.length - 1]
    };
  }, [shippingRates]);

  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch && (shippingRates.length === 0 || isStale)) {
      refetch();
    }
  }, [autoFetch, shippingRates.length, isStale, refetch]);

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
    shippingRates,
    filteredShippingRates,
    total,
    filters,
    lastFetched,
    isStale,
    availableZones,
    priceStats,
    weightStats,
    shippingTypeStats,
    activeStats,
    rateExtremes,
    codCharge, // ✅ NEW: Include COD charge in return value (available to all components using this hook)
    
    // State
    loading,
    error,
    
    // Actions
    refetch,
    updateSortBy,
    updateSearchQuery,
    updateZones,
    updatePriceRanges,
    updateWeightRanges,
    updateIsFree,
    updateIsActive,
    updateFiltersFromSidebar,
    resetAllFilters,
    clearAllShippingRates,
    clearShippingRatesError,
  };
};

export default useShippingRates;