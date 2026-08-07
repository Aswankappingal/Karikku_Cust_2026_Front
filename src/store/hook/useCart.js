// src/hooks/useCart.js
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useCallback } from 'react';
import {
  fetchCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  forceClearCart,
  clearCartError,
  updateLocalQuantity,
  calculateTotals,
  placeOrderAndClearCart,
  clearOrderData
} from '../slice/cartSlice'; // Make sure the path is correct

// Helper function to generate cart item key
const createCartItemKey = (productId, variantCombination) => {
  if (!variantCombination) return productId;
  return `${productId}|${variantCombination.variantId}`;
};

export const useCart = () => {
  const dispatch = useDispatch();
  const {
    items,
    loading,
    error,
    totalItems,
    totalAmount,
    actionLoading,
    lastOrder,
    orderPricingDetails
  } = useSelector((state) => state.cart);

  const fetchCart = useCallback(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // Add item to cart with variants
  const handleAddToCart = useCallback(async (productId, quantity = 1, variantCombination = null, sellingPrice = null) => {
    try {
      const result = await dispatch(addToCart({ productId, quantity, variantCombination, sellingPrice }));
      if (result.type === 'cart/addToCart/fulfilled') {
        dispatch(fetchCartItems());
        return { success: true };
      }
      return { success: false, error: result.payload };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);


  // Update item quantity with variants
  const updateQuantity = useCallback(async (productId, quantity, variantCombination = null) => {
    try {
      dispatch(updateLocalQuantity({ productId, quantity, variantCombination }));

      const result = await dispatch(updateCartItemQuantity({ productId, quantity, variantCombination }));
      if (result.type === 'cart/updateCartItemQuantity/rejected') {
        dispatch(fetchCartItems());
        return { success: false, error: result.payload };
      }
      return { success: true };
    } catch (error) {
      dispatch(fetchCartItems());
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Remove item from cart with variants
  const removeItem = useCallback(async (productId, variantCombination = null) => {
    try {
      const result = await dispatch(removeFromCart({ productId, variantCombination }));
      if (result.type === 'cart/removeFromCart/fulfilled') {
        return { success: true };
      }
      return { success: false, error: result.payload };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Clear entire cart via API
  const clearEntireCart = useCallback(async () => {
    try {
      console.log('Attempting to clear cart via API...');
      const result = await dispatch(clearCart());

      if (clearCart.fulfilled.match(result)) {
        console.log('Cart cleared successfully via API');
        return { success: true, method: 'api' };
      } else if (clearCart.rejected.match(result)) {
        console.error('Cart API failed:', result.payload);
        return { success: false, error: result.payload, method: 'api_failed' };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Force clear function for immediate clearing (local only)
  const forceCartClear = useCallback(() => {
    console.log('Force clearing cart locally...');
    dispatch(forceClearCart());
    return { success: true, method: 'force' };
  }, [dispatch]);

  // Updated place order function with proper API structure
  const handlePlaceOrder = useCallback(async (orderData) => {
    try {
      console.log('=== PREPARING ORDER FOR BACKEND API ===');

      // Helper function to prepare items for the backend API
      const prepareOrderItems = (items) => {
        return items.map((item, index) => {
          const productId = item.productId || item.id || item._id;
          if (!productId) {
            console.warn(`Item ${index} missing ID:`, item);
          }

          return {
            productId: productId || `temp_id_${index}`,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price || 0),
            originalPrice: parseFloat(item.originalPrice || item.price || 0),
            gstRate: parseFloat(item.gstRate || 0),
            variant: item.variant || null,
            productName: (item.productName || 'Unknown Product').toString(),
            productImage: (item.productImage || '').toString(),
            unit: (item.unit || 'pcs').toString()
          };
        }).filter(item => item.productId && !item.productId.startsWith('temp_id_'));
      };

      // Prepare the order data in the format expected by your backend
      const preparedOrderData = {
        // Transform items to match backend structure
        items: prepareOrderItems(orderData.items),

        // Delivery Address - match backend field names
        deliveryAddress: {
          fullName: orderData.deliveryAddress.fullName,
          phone: orderData.deliveryAddress.phone,
          email: orderData.deliveryAddress.email || '',
          addressLine1: orderData.deliveryAddress.addressLine1 || orderData.deliveryAddress.address,
          addressLine2: orderData.deliveryAddress.addressLine2 || '',
          city: orderData.deliveryAddress.city || '',
          state: orderData.deliveryAddress.state,
          pincode: orderData.deliveryAddress.pincode || orderData.deliveryAddress.zipCode || orderData.deliveryAddress.zipcode || orderData.deliveryAddress.pinCode,
          zipcode: orderData.deliveryAddress.pincode || orderData.deliveryAddress.zipCode || orderData.deliveryAddress.zipcode || orderData.deliveryAddress.pinCode, // Internal hook usage legacy
          landmark: orderData.deliveryAddress.landmark || '',
          addressType: orderData.deliveryAddress.addressType || 'Home'
        },

        // Payment Method - send the method object as received
        paymentMethod: orderData.paymentMethod,

        // Financial details
        deliveryCharge: Number(orderData.deliveryCharge) || 0,
        codCharge: Number(orderData.codCharge) || 0,
        discountAmount: Number(orderData.discountAmount) || 0,
        couponCode: orderData.couponCode || null,
        specialInstructions: orderData.specialInstructions || '',

        // Optional delivery preferences
        preferredDeliveryDate: orderData.preferredDeliveryDate || null,
        preferredDeliveryTime: orderData.preferredDeliveryTime || null,

        // Additional fields for calculation
        subtotal: Number(orderData.subtotal) || 0,
        totalAmount: Number(orderData.totalAmount) || 0,
        taxAmount: Number(orderData.taxAmount) || 0,
        orderType: orderData.orderType || 'online',
        currency: orderData.currency || 'INR'
      };

      console.log('Prepared order data for backend:', preparedOrderData);

      const result = await dispatch(placeOrderAndClearCart(preparedOrderData));

      if (placeOrderAndClearCart.fulfilled.match(result)) {
        console.log('✅ Order placed and cart cleared successfully');
        return {
          success: true,
          data: result.payload.order,
          pricing: result.payload.pricingDetails
        };
      } else if (placeOrderAndClearCart.rejected.match(result)) {
        console.error('❌ Failed to place order:', result.payload);
        return { success: false, error: result.payload };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('❌ Error placing order:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Clear order data from state
  const clearLastOrder = useCallback(() => {
    dispatch(clearOrderData());
  }, [dispatch]);

  // Increment quantity with variants
  const incrementQuantity = useCallback((productId, variants = null) => {
    const itemKey = createCartItemKey(productId, variants);
    const item = items.find(item =>
      createCartItemKey(item.productId, item.variants) === itemKey
    );

    if (item) {
      return updateQuantity(productId, item.quantity + 1, variants);
    }
    return { success: false, error: 'Item not found' };
  }, [items, updateQuantity]);

  // Decrement quantity with variants
  const decrementQuantity = useCallback((productId, variants = null) => {
    const itemKey = createCartItemKey(productId, variants);
    const item = items.find(item =>
      createCartItemKey(item.productId, item.variants) === itemKey
    );

    if (item && item.quantity > 1) {
      return updateQuantity(productId, item.quantity - 1, variants);
    }
    return { success: false, error: 'Cannot decrease quantity below 1' };
  }, [items, updateQuantity]);

  // Check if product with specific variants is in cart
  const isInCart = useCallback((productId, variantCombination = null) => {
    const itemKey = createCartItemKey(productId, variantCombination);
    return items.some(item =>
      createCartItemKey(item.productId, item.variantCombination) === itemKey
    );
  }, [items]);

  // Get specific item from cart
  const getCartItem = useCallback((productId, variantCombination = null) => {
    const itemKey = createCartItemKey(productId, variantCombination);
    return items.find(item =>
      createCartItemKey(item.productId, item.variantCombination) === itemKey
    );
  }, [items]);

  // Clear cart error
  const clearError = useCallback(() => {
    dispatch(clearCartError());
  }, [dispatch]);

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    try {
      await dispatch(fetchCartItems());
      return { success: true };
    } catch (error) {
      console.error('Error refreshing cart:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Calculate cart summary with enhanced pricing details
  const cartSummary = useMemo(() => {
    const subtotal = totalAmount;
    const discountOnMRP = 120.00;
    const couponSavings = 0;
    const gst = subtotal * 0.18;
    const delivery = 0; // Dynamic delivery is handled by the Cart component using shippingRates

    const finalTotal = subtotal - discountOnMRP - couponSavings + gst + delivery;

    return {
      subtotal,
      discountOnMRP,
      couponSavings,
      gst: Math.round(gst * 100) / 100,
      delivery,
      total: Math.round(finalTotal * 100) / 100,
      totalItems,
      savings: discountOnMRP + couponSavings,
      // Additional pricing details for backend compatibility
      pricing: {
        subtotal: Math.round(subtotal * 100) / 100,
        totalMRP: Math.round((subtotal + discountOnMRP) * 100) / 100,
        totalSavings: Math.round((discountOnMRP + couponSavings) * 100) / 100,
        deliveryCharge: delivery,
        discountAmount: Math.round((discountOnMRP + couponSavings) * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100
      }
    };
  }, [totalAmount, totalItems]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    dispatch(calculateTotals());
  }, [items, dispatch]);

  return {
    // Cart data
    cartItems: items,
    totalItems,
    totalAmount,
    cartSummary,

    // Order data
    lastOrder,
    orderPricingDetails,

    // Loading states
    loading,
    isAddingToCart: actionLoading.add,
    isUpdating: actionLoading.update,
    isRemoving: actionLoading.remove,
    isClearing: actionLoading.clear,
    isPlacingOrder: actionLoading.placeOrder,

    // Error state
    error,

    // Actions
    fetchCart,
    refreshCart,
    addToCart: handleAddToCart,
    updateQuantity,
    removeItem,
    clearCart: clearEntireCart,
    forceCartClear,
    placeOrder: handlePlaceOrder,
    clearError,
    clearLastOrder,

    // Helper actions
    incrementQuantity,
    decrementQuantity,
    isInCart,
    getCartItem,

    // Computed values
    isEmpty: items.length === 0,
    hasError: !!error,
    isRemoving: (productId, variants) => {
      // This can be enhanced to track specific items being removed
      return actionLoading.remove;
    }
  };
};