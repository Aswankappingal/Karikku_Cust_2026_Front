// src/store/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import baseUrl from '../../baseUrl';

// Get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};


// Thunk to clear entire cart via API
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Clearing cart via API...');

      const response = await axios.post(
        `${baseUrl}/clear-cart`,
        {},
        { headers: getAuthHeaders() }
      );

      if (response.data?.success) {
        console.log('Cart cleared successfully via API');
        return response.data;
      }

      throw new Error('Failed to clear cart');
    } catch (error) {
      console.error('API clear cart failed:', error);
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to clear cart'
      );
    }
  }
);

// Thunk to fetch cart items
export const fetchCartItems = createAsyncThunk('cart/fetchCartItems', async () => {
  const response = await axios.get(`${baseUrl}/get-cart`, {
    headers: getAuthHeaders()
  });

  if (response.data?.success) {
    return response.data.cart;
  }

  throw new Error('Failed to fetch cart items');
});

// Thunk to add item to cart with variants
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, variantCombination, sellingPrice }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${baseUrl}/add-to-cart`,
        { productId, quantity, variantCombination, sellingPrice },
        { headers: getAuthHeaders() }
      );

      if (response.data?.success) {
        return response.data;
      }

      throw new Error('Failed to add item to cart');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to add to cart'
      );
    }
  }
);


// Thunk to update cart item quantity with variants
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity, variantCombination }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${baseUrl}/update-cart-quantity`,
        { productId, newQuantity: quantity, variantCombination },
        { headers: getAuthHeaders() }
      );

      if (response.status === 200 || response.data?.success) {
        return { productId, quantity, variantCombination };
      }

      throw new Error('Failed to update cart item');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to update cart'
      );
    }
  }
);

// Thunk to remove item from cart with variants
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ productId, variantCombination }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${baseUrl}/remove-from-cart`,
        { productId, variantCombination },
        { headers: getAuthHeaders() }
      );

      // The backend returns { message, cart } on success, not specifically success: true
      if (response.status === 200) {
        return { productId, variantCombination };
      }

      throw new Error('Failed to remove item from cart');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to remove from cart'
      );
    }
  }
);


// Updated thunk to place order with proper API structure
export const placeOrderAndClearCart = createAsyncThunk(
  'cart/placeOrderAndClearCart',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      console.log('=== PLACING ORDER WITH UPDATED API STRUCTURE ===');
      console.log('Order Data:', orderData);

      // Transform the order data to match backend API structure
      const apiOrderData = {
        // Items array with proper structure
        items: orderData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          gstRate: item.gstRate,
          variant: item.variant || item.variantCombination || null,
          productName: item.productName,
          productImage: item.productImage,
          unit: item.unit || 'pcs'
        })),

        // Delivery Address (matching backend structure)
        deliveryAddress: {
          fullName: orderData.deliveryAddress.fullName,
          phone: orderData.deliveryAddress.phone,
          email: orderData.deliveryAddress.email || '',
          addressLine1: orderData.deliveryAddress.addressLine1 || orderData.deliveryAddress.address,
          addressLine2: orderData.deliveryAddress.addressLine2 || '',
          city: orderData.deliveryAddress.city || '',
          state: orderData.deliveryAddress.state,
          pincode: orderData.deliveryAddress.pincode || orderData.deliveryAddress.zipCode || orderData.deliveryAddress.zipcode || orderData.deliveryAddress.pinCode,
          landmark: orderData.deliveryAddress.landmark || '',
          addressType: orderData.deliveryAddress.addressType || 'Home'
        },

        // Payment Method (send as string, not object)
        paymentMethod: (orderData.paymentMethod?.type || (typeof orderData.paymentMethod === 'string' ? orderData.paymentMethod : '')) === 'cod' ? 'cod' :
          (orderData.paymentMethod?.type || (typeof orderData.paymentMethod === 'string' ? orderData.paymentMethod : '')) === 'card' ? 'prepaid' : 'online',

        // Payment Details (only if not COD)
        paymentDetails: (orderData.paymentMethod?.type || (typeof orderData.paymentMethod === 'string' ? orderData.paymentMethod : '')) !== 'cod' ? {
          transactionId: orderData.paymentMethod?.transactionId || null,
          paymentGateway: orderData.paymentMethod?.gateway || 'razorpay',
          paymentId: orderData.paymentMethod?.paymentId || null,
          ...orderData.paymentMethod?.details
        } : {},

        // Financial details
        deliveryCharge: orderData.deliveryCharge || 0,
        codCharge: orderData.codCharge || 0,
        discountAmount: orderData.discountAmount || 0,
        couponCode: orderData.couponCode || null,
        specialInstructions: orderData.specialInstructions || '',

        // Delivery preferences
        preferredDeliveryDate: orderData.preferredDeliveryDate || null,
        preferredDeliveryTime: orderData.preferredDeliveryTime || null
      };

      console.log('Transformed API Order Data:', apiOrderData);

      const response = await axios.post(
        `${baseUrl}/place-order`,
        apiOrderData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API Response:', response.data);

      if (response.data?.success) {
        // Clear cart after successful order placement
        console.log('Order placed successfully, clearing cart...');
        await dispatch(clearCart());

        return {
          ...response.data,
          // Include the pricing details array for frontend use
          pricingDetails: {
            subtotal: apiOrderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            totalMRP: apiOrderData.items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0),
            deliveryCharge: apiOrderData.deliveryCharge,
            codCharge: apiOrderData.codCharge || 0,
            discountAmount: apiOrderData.discountAmount,
            totalSavings: apiOrderData.items.reduce((sum, item) =>
              sum + ((item.originalPrice - item.price) * item.quantity), 0
            ) + apiOrderData.discountAmount,
            finalTotal: response.data.order?.totalAmount || 0
          }
        };
      }

      throw new Error(response.data?.message || 'Failed to place order');
    } catch (error) {
      console.error('❌ Order placement failed:', error);

      let errorMessage = 'Failed to place order. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Helper function to generate cart item key (same as backend)
const createCartItemKey = (productId, variantCombination) => {
  if (!variantCombination) return productId;
  return `${productId}|${variantCombination.variantId}`;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    totalItems: 0,
    totalAmount: 0,
    actionLoading: {
      add: false,
      update: false,
      remove: false,
      clear: false,
      placeOrder: false
    },
    // Add order-related state
    lastOrder: null,
    orderPricingDetails: null
  },
  reducers: {
    forceClearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      state.error = null;
    },
    clearCartError: (state) => {
      state.error = null;
    },
    updateLocalQuantity: (state, action) => {
      const { productId, quantity, variantCombination } = action.payload;
      const itemKey = createCartItemKey(productId, variantCombination);

      const item = state.items.find(item =>
        createCartItemKey(item.productId, item.variantCombination) === itemKey
      );

      if (item) {
        item.quantity = Math.max(1, quantity);
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) =>
          sum + (item.productDetails?.sellingPrice || item.productDetails?.price || 0) * item.quantity, 0
        );
      }
    },
    calculateTotals: (state) => {
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) =>
        sum + (item.productDetails?.sellingPrice || item.productDetails?.price || 0) * item.quantity, 0
      );
    },
    // New reducer to clear order data
    clearOrderData: (state) => {
      state.lastOrder = null;
      state.orderPricingDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.actionLoading.clear = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.actionLoading.clear = false;
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
        state.error = null;
        console.log('Cart cleared in Redux state');
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.actionLoading.clear = false;
        state.error = action.payload;
        console.log('Cart API failed:', action.payload);
      })

      // Fetch cart items
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = action.payload.reduce((sum, item) =>
          sum + (item.productDetails?.sellingPrice || item.productDetails?.price || 0) * item.quantity, 0
        );
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.actionLoading.add = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.actionLoading.add = false;
        // Refetch cart to get updated data with variants
        state.loading = true;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.actionLoading.add = false;
        state.error = action.payload;
      })

      // Update cart item quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.actionLoading.update = true;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.actionLoading.update = false;
        const { productId, quantity, variantCombination } = action.payload;
        const itemKey = createCartItemKey(productId, variantCombination);

        const item = state.items.find(item =>
          createCartItemKey(item.productId, item.variantCombination) === itemKey
        );

        if (item) {
          item.quantity = quantity;
          state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.totalAmount = state.items.reduce((sum, item) =>
            sum + (item.productDetails?.sellingPrice || item.productDetails?.price || 0) * item.quantity, 0
          );
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.actionLoading.update = false;
        state.error = action.payload;
      })

      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.actionLoading.remove = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.actionLoading.remove = false;
        const { productId, variantCombination } = action.payload;
        const itemKey = createCartItemKey(productId, variantCombination);

        state.items = state.items.filter(item =>
          createCartItemKey(item.productId, item.variantCombination) !== itemKey
        );
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) =>
          sum + (item.productDetails?.sellingPrice || item.productDetails?.price || 0) * item.quantity, 0
        );
      })

      .addCase(removeFromCart.rejected, (state, action) => {
        state.actionLoading.remove = false;
        state.error = action.payload;
      })

      // Place order and clear cart - Updated
      .addCase(placeOrderAndClearCart.pending, (state) => {
        state.actionLoading.placeOrder = true;
        state.error = null;
      })
      .addCase(placeOrderAndClearCart.fulfilled, (state, action) => {
        state.actionLoading.placeOrder = false;
        // Store the order data and pricing details
        state.lastOrder = action.payload.order;
        state.orderPricingDetails = action.payload.pricingDetails;
        // Cart is already cleared by the clearCart action dispatch
      })
      .addCase(placeOrderAndClearCart.rejected, (state, action) => {
        state.actionLoading.placeOrder = false;
        state.error = action.payload;
      });
  }
});

export const {
  forceClearCart,
  clearCartError,
  updateLocalQuantity,
  calculateTotals,
  clearOrderData
} = cartSlice.actions;

export default cartSlice.reducer;