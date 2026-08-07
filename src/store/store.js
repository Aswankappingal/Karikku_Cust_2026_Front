// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import bannerReducer from './slice/HomePageSilces/BannerSlice';

import authReducer from './slice/userSlice';
import productsReducer from './slice/productSlice';
import categoriesReducer from './slice/categorySlice';
import faqReducer from './slice/faqSlice';
import cartReducer from './slice/cartSlice';
import wishlistReducer from './slice/whishlistSlice';
import addressesReducer from './slice/AddressSlice';

import ordersReducer from './slice/OrderSlice';
import exclusiveReducer from './slice/ExclusiveSlice';
import shippingRatesReducer from './slice/shippingRatesSlice';
import blogReducer from './slice/blogspostSlice';
import userReducer from './slice/NavbarSlice/LoginedUserSlice';


export const store = configureStore({
  reducer: {
    // Navbar
    loginedUser: userReducer,
    auth: authReducer,
    products: productsReducer,
    banners: bannerReducer,
    categories: categoriesReducer,
    faqs: faqReducer, // Add this line
    cart: cartReducer,
    wishlist: wishlistReducer,
    addresses: addressesReducer,
    orders: ordersReducer, // Add this line
    exclusive: exclusiveReducer,
    shippingRates: shippingRatesReducer, // Add this line
    blogs: blogReducer,





  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;