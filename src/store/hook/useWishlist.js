// hooks/useWishlist.js
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getWishlist,
  clearError,
  clearSuccess,
  resetWishlist
} from '../slice/whishlistSlice';

const useWishlist = () => {
  const dispatch = useDispatch();
  
  const {
    items,
    totalItems,
    loading,
    error,
    success,
    lastFetched
  } = useSelector((state) => state.wishlist);

  // Auto-fetch wishlist on mount if not fetched recently
  useEffect(() => {
    const shouldFetch = !lastFetched || (Date.now() - lastFetched > 5 * 60 * 1000); // 5 minutes
    if (shouldFetch && !loading) {
      dispatch(getWishlist());
    }
  }, [dispatch, lastFetched, loading]);

  // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    try {
      const result = await dispatch(getWishlist()).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      throw error;
    }
  }, [dispatch]);

  // Refresh wishlist data (force refetch)
  const refreshWishlist = useCallback(async () => {
    try {
      const result = await dispatch(getWishlist()).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to refresh wishlist:', error);
      throw error;
    }
  }, [dispatch]);

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId) => {
    return items.some(item => item.productId === productId);
  }, [items]);

  // Get specific wishlist item
  const getWishlistItem = useCallback((productId) => {
    return items.find(item => item.productId === productId);
  }, [items]);

  // Get wishlist items by category (if product has category)
  const getItemsByCategory = useCallback((category) => {
    return items.filter(item => 
      item.product && item.product.category === category
    );
  }, [items]);

  // Get recently added items (last 7 days)
  const getRecentlyAdded = useCallback((days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return items.filter(item => {
      const addedDate = new Date(item.addedAt);
      return addedDate >= cutoffDate;
    });
  }, [items]);

  // Get total wishlist value
  const getTotalValue = useCallback(() => {
    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + parseFloat(price);
    }, 0).toFixed(2);
  }, [items]);

  // Clear error manually
  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear success status
  const clearSuccessStatus = useCallback(() => {
    dispatch(clearSuccess());
  }, [dispatch]);

  // Reset wishlist state
  const resetWishlistState = useCallback(() => {
    dispatch(resetWishlist());
  }, [dispatch]);

  return {
    // State
    items,
    totalItems,
    loading,
    error,
    success,
    isEmpty: totalItems === 0,
    lastFetched,
    
    // Actions
    fetchWishlist,
    refreshWishlist,
    
    // Utilities
    isInWishlist,
    getWishlistItem,
    getItemsByCategory,
    getRecentlyAdded,
    getTotalValue,
    
    // State management
    clearError: clearErrorMessage,
    clearSuccess: clearSuccessStatus,
    resetWishlist: resetWishlistState,
  };
};

export default useWishlist;