// src/hooks/useAddresses.js
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  clearAddresses,
  setSelectedAddress,
  clearSelectedAddress,
  loadFromLocalStorage
} from '../slice/AddressSlice'; // Correct path with capital A

const useAddresses = () => {
  const dispatch = useDispatch();
  
  // FIXED: Use 'addresses' to match the slice name in store configuration
  const addressState = useSelector(state => state.addresses) || {};
  const { 
    data = { addresses: [], totalAddresses: 0 }, 
    loading = false, 
    error = null, 
    selectedAddress = null 
  } = addressState;

  // Initialize from localStorage on hook mount
  useEffect(() => {
    dispatch(loadFromLocalStorage());
  }, [dispatch]);

  // Fetch addresses from API with better error handling
  const getAddresses = useCallback(async () => {
    try {
      // Check if token exists before making API call
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return { success: false, error: 'Authentication required' };
      }

      const result = await dispatch(fetchAddresses()).unwrap();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in getAddresses:', error);
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Add new address with error handling
  const createAddress = useCallback(async (addressData) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return { success: false, error: 'Authentication required' };
      }

      const result = await dispatch(addAddress(addressData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in createAddress:', error);
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Update existing address with error handling
  const editAddress = useCallback(async (addressId, addressData) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return { success: false, error: 'Authentication required' };
      }

      const result = await dispatch(updateAddress({ addressId, addressData })).unwrap();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in editAddress:', error);
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Delete address with error handling
  const removeAddress = useCallback(async (addressId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return { success: false, error: 'Authentication required' };
      }

      const result = await dispatch(deleteAddress(addressId)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in removeAddress:', error);
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Clear all addresses
  const clearAllAddresses = useCallback(() => {
    dispatch(clearAddresses());
  }, [dispatch]);

  // Set selected address
  const selectAddress = useCallback((address) => {
    dispatch(setSelectedAddress(address));
  }, [dispatch]);

  // Clear selected address
  const clearSelection = useCallback(() => {
    dispatch(clearSelectedAddress());
  }, [dispatch]);

  // Get address by ID
  const getAddressById = useCallback((id) => {
    return data.addresses?.find(address => address.id === id);
  }, [data.addresses]);

  // Check if addresses exist in localStorage
  const hasLocalData = useCallback(() => {
    return localStorage.getItem('addresses') !== null;
  }, []);

  // Force refresh from API (bypass cache)
  const refreshAddresses = useCallback(async () => {
    try {
      localStorage.removeItem('addresses');
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return { success: false, error: 'Authentication required' };
      }

      const result = await dispatch(fetchAddresses()).unwrap();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in refreshAddresses:', error);
      return { success: false, error: error };
    }
  }, [dispatch]);

  // Get default address (if you have a default field)
  const getDefaultAddress = useCallback(() => {
    return data.addresses?.find(address => address.isDefault);
  }, [data.addresses]);

  // Get addresses with loading state
  const isLoading = loading;
  
  // Check if there are any addresses
  const hasAddresses = (data.addresses?.length || 0) > 0;
  
  // Check if addresses array is empty
  const isEmpty = (data.addresses?.length || 0) === 0;
  
  // Check if there's an error
  const hasError = !!error;

  return {
    // Data
    addresses: data.addresses || [],
    totalAddresses: data.totalAddresses || 0,
    selectedAddress,
    loading: isLoading,
    error,

    // Actions
    getAddresses,
    createAddress,
    editAddress,
    removeAddress,
    clearAllAddresses,
    selectAddress,
    clearSelection,
    refreshAddresses,

    // Utilities
    getAddressById,
    getDefaultAddress,
    hasLocalData,

    // Computed values
    hasAddresses,
    isEmpty,
    isLoading,
    hasError,

    // Additional helpful properties
    addressesCount: data.addresses?.length || 0,
    hasSelectedAddress: !!selectedAddress
  };
};

export default useAddresses;