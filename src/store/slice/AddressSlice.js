  // src/store/slice/AddressSlice.js
  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
  import axios from 'axios';
  import baseUrl from '../../baseUrl';

  // Thunk to fetch addresses
  export const fetchAddresses = createAsyncThunk(
    'addresses/fetchAddresses', 
    async (_, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('authToken');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${baseUrl}/get-address`, {
          headers: {
            'Authorization': `Bearer ${token}`
          } 
          
        });

        console.log('🔍 SLICE: API response:', response);

        if (response.data?.success) {
          const addressData = {
            addresses: response.data.addresses,
            totalAddresses: response.data.totalAddresses
          };
          localStorage.setItem('addresses', JSON.stringify(addressData));
          return addressData;
        }

        throw new Error(response.data?.error || 'Failed to fetch addresses');
      } catch (error) {
        console.error('❌ Fetch addresses error:', error);
        return rejectWithValue(error.response?.data?.error || error.message);
      }
    }
  );

  // Thunk to add a new address
  export const addAddress = createAsyncThunk(
    'addresses/addAddress',
    async (addressData, { rejectWithValue, getState }) => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.post(`${baseUrl}/add-address`, addressData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data?.success) {
          
          return response.data.address;
        }

        throw new Error(response.data?.error || 'Failed to add address');
      } catch (error) {
        console.error('❌ Add address error:', error);
        return rejectWithValue(error.response?.data?.error || error.message);
      }
    }
  );

  // Thunk to update an address
  export const updateAddress = createAsyncThunk(
    'addresses/updateAddress',
    async ({ addressId, addressData }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.put(`${baseUrl}/update-address/${addressId}`, addressData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data?.success) {
          // Return both the address ID and updated data
          return { addressId, addressData: response.data.address || addressData };
        }

        throw new Error(response.data?.error || 'Failed to update address');
      } catch (error) {
        console.error('❌ Update address error:', error);
        return rejectWithValue(error.response?.data?.error || error.message);
      }
    }
  );

  // Thunk to delete an address
  export const deleteAddress = createAsyncThunk(
    'addresses/deleteAddress',
    async (addressId, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.delete(`${baseUrl}/delete-address/${addressId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data?.success) {
          // Return the deleted address ID
          return addressId;
        }

        throw new Error(response.data?.error || 'Failed to delete address');
      } catch (error) {
        console.error('❌ Delete address error:', error);
        return rejectWithValue(error.response?.data?.error || error.message);
      }
    }
  );

  const addressSlice = createSlice({
    name: 'addresses',
    initialState: {
      data: {
        addresses: [],
        totalAddresses: 0
      },
      loading: false,
      error: null,
      selectedAddress: null
    },
    reducers: {
      clearAddresses: (state) => {
        state.data = {
          addresses: [],
          totalAddresses: 0
        };
        state.selectedAddress = null;
        localStorage.removeItem('addresses');
        localStorage.removeItem('selectedAddress');
      },
      setSelectedAddress: (state, action) => {
        state.selectedAddress = action.payload;
        localStorage.setItem('selectedAddress', JSON.stringify(action.payload));
      },
      clearSelectedAddress: (state) => {
        state.selectedAddress = null;
        localStorage.removeItem('selectedAddress');
      },
      loadFromLocalStorage: (state) => {
        const localData = localStorage.getItem('addresses');
        const selectedAddress = localStorage.getItem('selectedAddress');
        
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            state.data = parsedData;
          } catch (error) {
            console.error('Error parsing localStorage addresses:', error);
            state.data = { addresses: [], totalAddresses: 0 };
          }
        }
        if (selectedAddress) {
          try {
            state.selectedAddress = JSON.parse(selectedAddress);
          } catch (error) {
            console.error('Error parsing selected address:', error);
            state.selectedAddress = null;
          }
        }
      },
      resetAddressError: (state) => {
        state.error = null;
      },
      // Helper reducer to sync localStorage
      syncToLocalStorage: (state) => {
        localStorage.setItem('addresses', JSON.stringify(state.data));
      }
    },
    extraReducers: (builder) => {
      builder
        // Fetch addresses
        .addCase(fetchAddresses.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchAddresses.fulfilled, (state, action) => {
          state.loading = false;
          state.data = action.payload;
          state.error = null;
          // Sync to localStorage
          localStorage.setItem('addresses', JSON.stringify(state.data));
        })
        .addCase(fetchAddresses.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.data = { addresses: [], totalAddresses: 0 };
        })
        
        // Add address
        .addCase(addAddress.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(addAddress.fulfilled, (state, action) => {
          state.loading = false;
          state.data.addresses.push(action.payload);
          state.data.totalAddresses = state.data.addresses.length;
          state.error = null;
          // Sync to localStorage
          localStorage.setItem('addresses', JSON.stringify(state.data));
        })
        .addCase(addAddress.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        
        // Update address
        .addCase(updateAddress.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateAddress.fulfilled, (state, action) => {
          state.loading = false;
          const { addressId, addressData } = action.payload;
          const index = state.data.addresses.findIndex(addr => addr.id === addressId);
          if (index !== -1) {
            state.data.addresses[index] = { ...state.data.addresses[index], ...addressData };
            
            // Update selected address if it's the one being updated
            if (state.selectedAddress && state.selectedAddress.id === addressId) {
              state.selectedAddress = { ...state.selectedAddress, ...addressData };
              localStorage.setItem('selectedAddress', JSON.stringify(state.selectedAddress));
            }
          }
          state.error = null;
          // Sync to localStorage
          localStorage.setItem('addresses', JSON.stringify(state.data));
        })
        .addCase(updateAddress.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        
        // Delete address
        .addCase(deleteAddress.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteAddress.fulfilled, (state, action) => {
          state.loading = false;
          state.data.addresses = state.data.addresses.filter(addr => addr.id !== action.payload);
          state.data.totalAddresses = state.data.addresses.length;
          
          // Clear selected address if it was deleted
          if (state.selectedAddress && state.selectedAddress.id === action.payload) {
            state.selectedAddress = null;
            localStorage.removeItem('selectedAddress');
          }
          
          state.error = null;
          // Sync to localStorage
          localStorage.setItem('addresses', JSON.stringify(state.data));
        })
        .addCase(deleteAddress.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    }
  });

  // Export all actions
  export const { 
    clearAddresses, 
    setSelectedAddress, 
    clearSelectedAddress, 
    loadFromLocalStorage,
    resetAddressError,
    syncToLocalStorage
  } = addressSlice.actions;

  export default addressSlice.reducer;