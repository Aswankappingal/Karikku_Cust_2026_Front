import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import CartNavbar from '../../common/CartNavbar/CartNavbar'
import CustomModal from '../../Theme/CouponModal/CouponModal';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './Address.scss'
import PaymentSummary from '../../Theme/PaymentSummary/PaymentSummary';
import { useNavigate, useLocation } from 'react-router-dom';
import AddressForm from '../../Theme/AddressForm/AddressForm';
import AddressModal from '../../Theme/AddressModal/AddressModal';
import { useCart } from '../../../store/hook/useCart';
import useAddresses from '../../../store/hook/useAddress';
import useShippingRates from '../../../store/hook/useShippingRates';
import { LinearProgress } from '@mui/material';
import { toast } from 'react-toastify';
import LoginModal from '../../Theme/LoginModal/LoginModal';
import { Edit2, Trash2 } from 'lucide-react';
import { calculateCartTotals } from '../../../utils/pricing';

// ============================================
// HELPER FUNCTIONS FOR PRICE CALCULATION
// ============================================

// Helper function to get item price (including GST)
const getItemPrice = (item) => {
  // Priority 1: Check if variantCombination exists and has a price
  if (item.variantCombination && item.variantCombination.price !== undefined && item.variantCombination.price !== null && item.variantCombination.price !== '') {
    return Number(item.variantCombination.price);
  }

  // Priority 2: Check currentPrice in cart item
  if (item.currentPrice !== undefined && item.currentPrice !== null && item.currentPrice !== '') {
    return Number(item.currentPrice);
  }

  // Priority 3: Fall back to productDetails price
  if (item.productDetails && item.productDetails.price !== undefined && item.productDetails.price !== null && item.productDetails.price !== '') {
    return Number(item.productDetails.price);
  }

  // Default: return 0 if no valid price found
  return 0;
};

// Helper function to get original price (including GST)
const getItemOriginalPrice = (item) => {
  const currentPrice = getItemPrice(item);

  // Priority 1: Check variantCombination for original price
  if (item.variantCombination) {
    if (item.variantCombination.originalPrice !== undefined && item.variantCombination.originalPrice !== null && item.variantCombination.originalPrice !== '') {
      return Number(item.variantCombination.originalPrice);
    }
    // If no original price in variant, use variant price as original
    if (item.variantCombination.price !== undefined && item.variantCombination.price !== null && item.variantCombination.price !== '') {
      return Number(item.variantCombination.price);
    }
  }

  // Priority 2: Check productDetails for original price
  if (item.productDetails && item.productDetails.originalPrice !== undefined && item.productDetails.originalPrice !== null && item.productDetails.originalPrice !== '') {
    return Number(item.productDetails.originalPrice);
  }

  // Priority 3: Use current price as original price
  return currentPrice;
};

// Helper function to get GST rate
const getItemGSTRate = (item) => {
  // Priority 1: Check variantCombination GST or taxPercentage
  if (item.variantCombination) {
    const variantGst = item.variantCombination.gst || item.variantCombination.taxPercentage;
    if (variantGst !== undefined && variantGst !== null && variantGst !== '') {
      return Number(variantGst) / 100; // Convert percentage to decimal
    }
  }

  // Priority 2: Check productDetails GST or taxPercentage
  if (item.productDetails) {
    const productGst = item.productDetails.gst || item.productDetails.taxPercentage;
    if (productGst !== undefined && productGst !== null && productGst !== '') {
      return Number(productGst) / 100;
    }
  }

  // Default: 0% GST
  return 0;
};

// ============================================
// MAIN ADDRESS COMPONENT
// ============================================

const Address = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('Home');
  const [phone, setPhone] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormModalIsOpen, setAddressFormModalIsOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const initialCouponProcessed = useRef(false);

  // Add loading states to prevent duplicate operations
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Coupon and discount states
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoins, setAppliedCoins] = useState(0);
  const [actualDeliveryCharge, setActualDeliveryCharge] = useState(0);
  const [actualCodCharge, setActualCodCharge] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is a "Buy Now" flow
  const buyNowProduct = location.state?.buyNowProduct;
  const isBuyNow = location.state?.isBuyNow || false;

  // Use the cart hook to get cart data
  const {
    cartItems,
    loading: cartLoading,
    error: cartError,
    cartSummary,
    isEmpty,
    hasError: cartHasError,
  } = useCart();

  // Use the addresses hook
  const {
    addresses,
    selectedAddress,
    loading: addressesLoading,
    error: addressesError,
    hasAddresses,
    isEmpty: addressesIsEmpty,
    hasError: addressesHasError,
    getAddresses,
    createAddress,
    editAddress,
    removeAddress,
    selectAddress,
    clearSelection,
    getAddressById,
    getDefaultAddress,
    refreshAddresses
  } = useAddresses();

  // Load addresses when component mounts
  useEffect(() => {
    if (!addressesLoading && addresses.length === 0) {
      getAddresses();
    }
  }, []); // Run only once on mount

  // Set default selected address when addresses are loaded
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId && !addressesLoading) {
      const defaultAddr = getDefaultAddress();
      const addressToSelect = defaultAddr || addresses[0];
      if (addressToSelect && addressToSelect.id !== selectedAddressId) {
        setSelectedAddressId(addressToSelect.id);
        selectAddress(addressToSelect);
      }
    }
  }, [addresses, selectedAddressId, addressesLoading]);

  const handleTotalUpdate = (updateData) => {
    if (typeof updateData === 'object' && updateData !== null) {
      setActualDeliveryCharge(updateData.delivery || 0);
      setActualCodCharge(updateData.codCharge || 0);
    }
  };

  // Calculate payment summary with proper GST splitting using helper functions
  const calculatedPaymentSummary = useMemo(() => {
    let itemsToCalculate = [];

    if (isBuyNow && buyNowProduct) {
      itemsToCalculate = [{
        productId: buyNowProduct.id,
        id: buyNowProduct.id,
        quantity: buyNowProduct.quantity || 1,
        variantCombination: buyNowProduct.variantCombination || null,
        productDetails: {
          name: buyNowProduct.name,
          price: buyNowProduct.price,
          originalPrice: buyNowProduct.originalPrice || buyNowProduct.price,
          gst: buyNowProduct.gst || buyNowProduct.taxPercentage || 0,
          taxPercentage: buyNowProduct.taxPercentage || buyNowProduct.gst || 0
        },
        originalPrice: buyNowProduct.originalPrice || buyNowProduct.price,
        currentPrice: buyNowProduct.price
      }];
    } else {
      itemsToCalculate = cartItems || [];
    }

    if (itemsToCalculate.length === 0) {
      return {
        totalMrp: 0,
        basePrice: 0,
        mrpDiscount: 0,
        discount: 0,
        taxableValue: 0,
        gstAmount: 0,
        cgst: 0,
        sgst: 0,
        delivery: 0,
        codCharge: 0,
        total: 0,
        totalSavings: 0,
        itemsPricing: [],
        totalItems: 0,
        items: []
      };
    }

    const totalDiscounts = couponDiscount + appliedCoins;
    
    const result = calculateCartTotals(
      itemsToCalculate,
      totalDiscounts,
      actualDeliveryCharge,
      actualCodCharge,
      'prepaid', // Address page usually prepaid basis unless switched later
      appliedCoupon?.productType === 'SPECIFIC' 
        ? (appliedCoupon.productIds || (appliedCoupon.productId ? [appliedCoupon.productId] : []) || (appliedCoupon.productID ? [appliedCoupon.productID] : []))
        : null
    );

    return {
      ...result,
      totalMRP: result.totalMrp,
      totalMRPExcludingGST: result.basePrice,
      discount: result.mrpDiscount,
      couponSavings: couponDiscount,
      coinSavings: appliedCoins,
      gst: result.gstAmount,
      totalItems: itemsToCalculate.reduce((sum, item) => sum + (item.quantity || 1), 0),
      subtotal: result.basePrice, // UNDISCOUNTED subtotal for coupon calculation
      taxableValue: result.taxableValue, // DISCOUNTED subtotal for GST
      items: itemsToCalculate // CRITICAL for PaymentSummary.jsx
    };
  }, [cartItems, couponDiscount, appliedCoins, isBuyNow, buyNowProduct, actualDeliveryCharge, actualCodCharge]);

  const getSelectedAddress = () => {
    return selectedAddress || getAddressById(selectedAddressId);
  };

  const handleNavigatetoPayment = () => {
    const currentSelectedAddress = getSelectedAddress();

    if (!currentSelectedAddress) {
      toast.warn('Please select a delivery address');
      return;
    }

    // Add completeness check before navigating
    const { city, pincode, pinCode, zipCode } = currentSelectedAddress;
    if (!city || !(pincode || pinCode || zipCode)) {
      toast.error('The selected address is incomplete (missing City or Pincode). Please edit the address before proceeding.');
      return;
    }

    navigate('/payment', {
      state: {
        selectedAddress: currentSelectedAddress,
        appliedCoupon: appliedCoupon, // Pass coupon to payment
        ...(isBuyNow && buyNowProduct && {
          buyNowProduct: buyNowProduct,
          isBuyNow: true
        })
      }
    });
  };

  useEffect(() => {
    if (location.state && location.state.appliedCoupon && !initialCouponProcessed.current) {
      console.log('📦 Received coupon from navigation:', location.state.appliedCoupon);
      handleCouponApply(location.state.appliedCoupon);
      initialCouponProcessed.current = true;
    }
  }, [location.state]);

  function closeModal() {
    setModalIsOpen(false);
  }

  const handleCouponApply = (couponData) => {
    // couponData is the full coupon object from the modal
    if (!couponData) {
      toast.error('Invalid coupon');
      return;
    }

    console.log('🎟️ Received coupon:', couponData);
    console.log('💰 Current subtotal:', calculatedPaymentSummary.subtotal);

    // Identify applicable items and their subtotal
    let applicableSubtotal = calculatedPaymentSummary.subtotal;
    if (couponData.productType === 'SPECIFIC') {
      const allowedIds = couponData.productIds || (couponData.productId ? [couponData.productId] : []) || (couponData.productID ? [couponData.productID] : []);
      const applicableItems = (isBuyNow && buyNowProduct ? [buyNowProduct] : cartItems).filter(item => {
        const id = item.productId || item.id;
        return allowedIds.includes(id) || allowedIds.includes(String(id));
      });
      
      // Calculate subtotal of applicable items (selling price base for simple calculation)
      applicableSubtotal = applicableItems.reduce((sum, item) => {
        const price = getItemPrice(item);
        return sum + (price * (item.quantity || 1));
      }, 0);
      
      console.log(`🔍 Restricted coupon. Applicable subtotal: ₹${applicableSubtotal} (from ${applicableItems.length} items)`);
    }

    // Calculate the discount based on coupon type
    let discount = 0;

    if (couponData.discountType === 'PERCENTAGE') {
      // For percentage discount (e.g., 20% off)
      discount = (applicableSubtotal * couponData.discountValue) / 100;
      console.log(`📊 Percentage: ${couponData.discountValue}% of ₹${applicableSubtotal} = ₹${discount}`);
    } else if (couponData.discountType === 'FIXED' || couponData.discountType === 'FLAT') {
      // For fixed/flat discount (e.g., ₹100 off)
      discount = Math.min(couponData.discountValue, applicableSubtotal);
      console.log(`💵 ${couponData.discountType} discount: ₹${discount}`);
    }

    // Apply maximum discount limit if it exists
    if (couponData.maxDiscountValue && discount > couponData.maxDiscountValue) {
      console.log(`⚠️ Discount capped at ₹${couponData.maxDiscountValue} (was ₹${discount})`);
      discount = couponData.maxDiscountValue;
    }

    // Round to 2 decimal places
    discount = Math.round(discount * 100) / 100;

    console.log('✅ Final discount:', discount);

    // Update state to trigger re-render and update Payment Summary
    setAppliedCoupon(couponData);
    setCouponDiscount(discount);

    // Show success message
    toast.success(`🎉 Coupon "${couponData.code}" applied! You saved ₹${discount.toFixed(2)}`);
  };

  const handleCoinApply = (coinAmount) => {
    setAppliedCoins(coinAmount);
  };

  const handleCouponRemove = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const handleCoinRemove = () => {
    setAppliedCoins(0);
  };

  const handleApplyClick = () => {
    setModalIsOpen(true);
  };

  const handleAddAddress = async (newAddress) => {
    if (isAddingAddress) return { error: { message: 'Already adding address...' } };

    try {
      setIsAddingAddress(true);
      const result = await createAddress(newAddress);
      return result;
    } catch (error) {
      console.error('Exception adding address:', error);
      return {
        error: {
          message: error.message || 'Error adding address. Please try again.'
        }
      };
    } finally {
      setIsAddingAddress(false);
      setShowAddressForm(false);
    }
  };

  const handleUpdateAddress = async (updatedAddress) => {
    if (isUpdatingAddress) return { error: { message: 'Already updating address...' } };

    try {
      setIsUpdatingAddress(true);
      const result = await editAddress(updatedAddress.id, updatedAddress);

      if (result.success) {
        setShowAddressForm(false);
        setAddressFormModalIsOpen(false);
        setEditingAddress(null);
        await getAddresses();
        return { success: true };
      } else {
        console.error('Failed to update address:', result);
        const errorMessage =
          result.error ||
          'Failed to update address. Please try again.';

        return { error: { message: errorMessage } };
      }
    } catch (error) {
      console.error('Exception updating address:', error);
      return {
        error: {
          message: error.message || 'Error updating address. Please try again.'
        }
      };
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (isDeletingAddress) return;

    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        setIsDeletingAddress(true);
        const result = await removeAddress(id);

        if (result.success) {
          if (selectedAddressId === id) {
            setSelectedAddressId(null);
            clearSelection();
          }
          await getAddresses();
        } else {
          console.error('Failed to delete address:', result.error);
          toast.error('Failed to delete address. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Error deleting address. Please try again.');
      } finally {
        setIsDeletingAddress(false);
      }
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address.id);
    selectAddress(address);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormModalIsOpen(true);
  };

  const openAddressFormModal = () => {
    setEditingAddress(null);
    setAddressFormModalIsOpen(true);
  };

  const closeAddressFormModal = () => {
    console.log("close");
    setAddressFormModalIsOpen(false);
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleRetry = async () => {
    await getAddresses();
  };

  const isLoading = cartLoading || addressesLoading;
  const hasError = cartHasError || addressesHasError;
  const errorMessage = cartError || addressesError;

  if (isLoading) {
    return <div><LinearProgress color="success" /></div>;
  }

  if (hasError) {
    return (
      <div className='AddressMainWrapper'>
        <CartNavbar />
        <div className="address">
          <div className="cart-header">
            <h2>Address</h2>
          </div>
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-8 address-form">
                {errorMessage?.includes('401') || errorMessage?.toLowerCase().includes('unauthorized') ? (
                  <div className="auth-error-container">
                    <p>Please login to see your saved addresses and proceed with the order.</p>
                    <button onClick={() => setShowLoginModal(true)}>Login Now</button>
                  </div>
                ) : (
                  <>
                    <p>Error loading data: {errorMessage}</p>
                    <button onClick={handleRetry} disabled={isLoading}>
                      {isLoading ? 'Retrying...' : 'Retry'}
                    </button>
                  </>
                )}
              </div>
              <div className="col-lg-4 checkout-card">
                <p>Unable to load payment summary</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isBuyNow && isEmpty) {
    return (
      <div className='AddressMainWrapper'>
        <CartNavbar />
        <div className="address">
          <div className="cart-header">
            <h2>Address</h2>
          </div>
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-8 address-form">
                <p>Your cart is empty. Please add items to proceed.</p>
                <button onClick={() => navigate('/')}>Continue Shopping</button>
              </div>
              <div className="col-lg-4 checkout-card">
                <p>No items in cart</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='AddressMainWrapper'>
      <CartNavbar />
      <CustomModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        title="Apply coupons"
        onCouponApply={handleCouponApply}
        cartSummary={calculatedPaymentSummary}
        productId={(isBuyNow && buyNowProduct ? [buyNowProduct] : cartItems).map(item => item.productId || item.id).join(',')}
      ></CustomModal>

      <AddressModal
        isOpen={addressFormModalIsOpen}
        onClose={closeAddressFormModal}
        onAddAddress={editingAddress ? handleUpdateAddress : handleAddAddress}
        editingAddress={editingAddress}
      />

      <div className="address">
        <div className="cart-header">
          <h2>Address</h2>
          {isBuyNow && buyNowProduct && (
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Buy Now: {buyNowProduct.name}
            </p>
          )}
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-8 address-form">
              {addressesIsEmpty || showAddressForm ? (
                <AddressForm
                  addressData={editingAddress}
                  onAddAddress={editingAddress ? handleUpdateAddress : handleAddAddress}
                  onUpdateAddress={handleUpdateAddress}
                  onCancel={() => setShowAddressForm(false)}
                  onClose={closeAddressFormModal}
                />
              ) : (
                <div className="saved-addresses">
                  <div className="addresses-header">
                    <h4>Select Delivery Address</h4>
                  </div>

                  {addresses && addresses.length > 0 ? addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                      style={{
                        border: '1px solid #ddd',
                        marginBottom: '15px',
                        padding: '10px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div className="address-content">
                        <div className="left-content">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={selectedAddressId === address.id}
                            onChange={() => handleAddressSelect(address)}
                            style={{ marginRight: '10px' }}
                          />
                          <div className="address-details">
                            <h5>{address.fullName}</h5>
                            <p>{address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}{address.state}</p>
                            <p>{address.country} - {address.zipCode}</p>
                            <p>Phone: {address.phone}</p>
                          </div>
                        </div>
                        <div className="right-content">
                          <div className="address-type">
                            <h6>{address.addressType}</h6>
                          </div>
                          <div className="address-actions">
                            <button 
                              className="edit-btn" 
                              title="Edit Address"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address);
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="delete-btn" 
                              title="Delete Address"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(address.id);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="no-addresses">
                      <p>No addresses found. Please add a new address.</p>
                    </div>
                  )}

                  <div className="add-new-address-btn">
                    <button
                      onClick={openAddressFormModal}
                      disabled={isAddingAddress || isUpdatingAddress || isDeletingAddress}
                    >
                      {isAddingAddress ? 'Adding...' : 'Add new address'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="col-lg-4 checkout-card">
              {addresses && addresses.length > 0 && (
                <PaymentSummary
                  onCheckout={handleNavigatetoPayment}
                  onApplyClick={handleApplyClick}
                  cartSummary={calculatedPaymentSummary}
                  onCouponApply={handleCouponApply}
                  onCoinApply={handleCoinApply}
                  appliedCoupon={appliedCoupon}
                  appliedCoins={appliedCoins}
                  onCouponRemove={handleCouponRemove}
                  onCoinRemove={handleCoinRemove}
                  useShippingRates={useShippingRates}
                  onTotalUpdate={handleTotalUpdate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onContinue={() => {
            setShowLoginModal(false);
            refreshAddresses(); // Refresh addresses after login
          }}
        />
      )}
    </div>
  )
}

export default Address;