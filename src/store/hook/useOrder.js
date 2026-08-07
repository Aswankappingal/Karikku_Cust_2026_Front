// src/hooks/useOrders.js
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useCallback } from 'react';
import {
  fetchOrders,
  refreshOrders,
  fetchOrdersAfterPlacement,
  fetchOrderDetails,
  cancelOrder,
  clearOrdersError,
  setOrderFilters,
  clearSelectedOrder,
  updateOrderStatusLocally,
  clearOrdersCache,
  forceClearOrders,
  addNewOrderOptimistically,
  initializeFromCache
} from '../slice/OrderSlice';




export const useOrders = () => {
  const dispatch = useDispatch();
  const {
    orders,
    selectedOrder,
    loading,
    refreshing,
    error,
    totalOrders,
    actionLoading,
    filters,
    lastFetched,
    isInitialized
  } = useSelector((state) => state.orders);



  useEffect(() => {

    console.log("orders daatasssss", orders);


  }, [])


  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem('authToken');
  }, []);

  // Initialize from cache on mount
  useEffect(() => {
    if (isAuthenticated() && !isInitialized && orders.length === 0) {
      dispatch(initializeFromCache());
    }
  }, [dispatch, isAuthenticated, isInitialized, orders.length]);

  // Fetch orders on mount or when explicitly called
  const fetchUserOrders = useCallback(() => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, clearing orders');
      dispatch(forceClearOrders());
      return;
    }
    dispatch(fetchOrders());
  }, [dispatch, isAuthenticated]);

  // Refresh orders (bypass cache)
  const refreshUserOrders = useCallback(() => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, cannot refresh orders');
      return;
    }
    dispatch(refreshOrders());
  }, [dispatch, isAuthenticated]);

  // Fetch orders after placing a new order
  const fetchOrdersAfterNewOrder = useCallback(() => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, cannot fetch after order placement');
      return;
    }
    dispatch(fetchOrdersAfterPlacement());
  }, [dispatch, isAuthenticated]);

  // Get specific order details
  const getOrderDetails = useCallback(async (orderId) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await dispatch(fetchOrderDetails(orderId));
      if (result.type === 'orders/fetchOrderDetails/fulfilled') {
        return { success: true, order: result.payload };
      }
      return { success: false, error: result.payload };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch, isAuthenticated]);

  // Cancel an order
  const cancelUserOrder = useCallback(async (orderId) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await dispatch(cancelOrder(orderId));
      if (result.type === 'orders/cancelOrder/fulfilled') {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch, isAuthenticated]);

  // Add new order optimistically (call this after successful order placement)
  const addNewOrder = useCallback((orderData) => {
    dispatch(addNewOrderOptimistically(orderData));
    // Also fetch fresh data to ensure consistency
    setTimeout(() => {
      dispatch(fetchOrdersAfterPlacement());
    }, 1000);
  }, [dispatch]);

  // Set filters
  const updateFilters = useCallback((newFilters) => {
    dispatch(setOrderFilters(newFilters));
  }, [dispatch]);

  // Clear selected order
  const clearOrder = useCallback(() => {
    dispatch(clearSelectedOrder());
  }, [dispatch]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch(clearOrdersError());
  }, [dispatch]);

  // Clear cache
  const clearCache = useCallback(() => {
    dispatch(clearOrdersCache());
  }, [dispatch]);

  // Force clear all orders (for logout)
  const clearAllOrders = useCallback(() => {
    dispatch(forceClearOrders());
  }, [dispatch]);

  // Update order status optimistically
  const updateOrderStatus = useCallback((orderId, status) => {
    dispatch(updateOrderStatusLocally({ orderId, status }));
  }, [dispatch]);

  // Filter and sort orders based on current filters
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    let filtered = [...orders];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => {
        const orderStatus = typeof order.status === 'number'
          ? order.status
          : order.status?.toString().toLowerCase();
        const filterStatus = filters.status.toLowerCase();

        // Handle numeric status codes
        if (typeof orderStatus === 'number') {
          const statusMap = { 0: 'pending', 1: 'processing', 2: 'shipped', 3: 'delivered', 4: 'cancelled' };
          return statusMap[orderStatus] === filterStatus;
        }

        return orderStatus === filterStatus;
      });
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;

      switch (filters.dateRange) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }

      if (cutoffDate) {
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= cutoffDate;
        });
      }
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'amount_high':
          const amountB = b.pricing?.finalTotal || b.pricing?.total || b.payment?.amount || 0;
          const amountA = a.pricing?.finalTotal || a.pricing?.total || a.payment?.amount || 0;
          return amountB - amountA;
        case 'amount_low':
          const amountA2 = a.pricing?.finalTotal || a.pricing?.total || a.payment?.amount || 0;
          const amountB2 = b.pricing?.finalTotal || b.pricing?.total || b.payment?.amount || 0;
          return amountA2 - amountB2;
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return filtered;
  }, [orders, filters]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status) => {
    if (!orders || orders.length === 0) {
      return [];
    }

    return orders.filter(order => {
      const orderStatus = typeof order.status === 'number'
        ? order.status
        : order.status?.toString().toLowerCase();
      const targetStatus = status.toLowerCase();

      // Handle numeric status codes
      if (typeof orderStatus === 'number') {
        const statusMap = { 0: 'pending', 1: 'processing', 2: 'shipped', 3: 'delivered', 4: 'cancelled' };
        return statusMap[orderStatus] === targetStatus;
      }

      return orderStatus === targetStatus;
    });
  }, [orders]);

  // Get order statistics
  const orderStats = useMemo(() => {
    const stats = {
      total: orders?.length || 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalAmount: 0,
      averageAmount: 0
    };

    if (!orders || orders.length === 0) {
      return stats;
    }

    orders.forEach(order => {
      let status = 'pending'; // default

      if (typeof order.status === 'number') {
        const statusMap = { 0: 'pending', 1: 'processing', 2: 'shipped', 3: 'delivered', 4: 'cancelled' };
        status = statusMap[order.status] || 'pending';
      } else if (order.status) {
        status = order.status.toString().toLowerCase();
      }

      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }

      const orderAmount = order.pricing?.finalTotal || order.pricing?.total || order.payment?.amount || 0;
      stats.totalAmount += orderAmount;
    });

    stats.averageAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;
    stats.totalAmount = Math.round(stats.totalAmount * 100) / 100;
    stats.averageAmount = Math.round(stats.averageAmount * 100) / 100;

    return stats;
  }, [orders]);

  // Check if data is stale (older than 5 minutes)
  const isDataStale = useMemo(() => {
    if (!lastFetched) return true;
    const fiveMinutes = 5 * 60 * 1000;
    return (Date.now() - new Date(lastFetched).getTime()) > fiveMinutes;
  }, [lastFetched]);

  // Find order by ID
  const findOrderById = useCallback((orderId) => {
    if (!orders || orders.length === 0) {
      return null;
    }
    return orders.find(order =>
      order.id === orderId ||
      order.orderId === orderId ||
      order.orderNumber === orderId
    );
  }, [orders]);

  // Get recent orders (last 10)
  const recentOrders = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 10);
  }, [orders]);

  // Auto-fetch orders on mount only if authenticated and no orders exist
  useEffect(() => {
    if (isAuthenticated() && !isInitialized && orders.length === 0) {
      fetchUserOrders();
    }
  }, [isAuthenticated, isInitialized, orders.length, fetchUserOrders]);

  // Listen for auth state changes and clear orders on logout
  useEffect(() => {
    const checkAuthStatus = () => {
      if (!isAuthenticated() && (orders.length > 0 || isInitialized)) {
        console.log('User logged out, clearing orders');
        dispatch(forceClearOrders());
      }
    };

    // Check auth status periodically
    const interval = setInterval(checkAuthStatus, 1000);

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated, orders.length, isInitialized]);

  return {
    // Orders data
    orders: filteredOrders,
    allOrders: orders || [],
    selectedOrder,
    recentOrders,
    totalOrders,
    orderStats,

    // Loading states
    loading,
    refreshing,
    isLoadingDetails: actionLoading?.fetchDetails || false,
    isCancelling: actionLoading?.cancel || false,

    // Error state
    error,
    hasError: !!error,

    // Data state
    isEmpty: !orders || orders.length === 0,
    isDataStale,
    lastFetched,
    isInitialized,
    isAuthenticated: isAuthenticated(),

    // Filters
    filters,

    // Actions
    fetchOrders: fetchUserOrders,
    refreshOrders: refreshUserOrders,
    fetchOrdersAfterPlacement: fetchOrdersAfterNewOrder,
    getOrderDetails,
    cancelOrder: cancelUserOrder,
    addNewOrder,
    updateFilters,
    clearSelectedOrder: clearOrder,
    clearError,
    clearCache,
    clearAllOrders,
    updateOrderStatus,

    // Helper functions
    getOrdersByStatus,
    findOrderById,

    // Filter presets
    showPendingOrders: () => updateFilters({ status: 'pending' }),
    showDeliveredOrders: () => updateFilters({ status: 'delivered' }),
    showCancelledOrders: () => updateFilters({ status: 'cancelled' }),
    showAllOrders: () => updateFilters({ status: 'all' }),
    showRecentFirst: () => updateFilters({ sortBy: 'newest' }),
    showOldestFirst: () => updateFilters({ sortBy: 'oldest' }),
    showHighestAmount: () => updateFilters({ sortBy: 'amount_high' }),
    showLowestAmount: () => updateFilters({ sortBy: 'amount_low' })
  };
};