// Enhanced Cart Component with proper variant combination and GST splitting support
import React, { useState, useMemo, useEffect } from 'react'
import CartNavbar from '../../common/CartNavbar/CartNavbar'
import './Cart.scss'
import { RiDeleteBin6Line } from 'react-icons/ri';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import Footer from '../../common/Footer/Footer';
import CustomModal from '../../Theme/CouponModal/CouponModal';
import PaymentSummary from '../../Theme/PaymentSummary/PaymentSummary';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../store/hook/useCart';
import baseUrl from '../../../baseUrl';
import EmptyCart from '../EmptyCart/EmptyCart';
import { CircularProgress, LinearProgress } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import useShippingRates from '../../../store/hook/useShippingRates';
import { calculateCartTotals, getApplicableDeliveryCharge } from '../../../utils/pricing';

// ============================================
// HELPER FUNCTIONS FOR PRICE CALCULATION
// ============================================

// Helper function to get item price (including GST)
const getItemPrice = (item) => {
  // Priority 1: Check if variantCombination exists and has a price (prefer sellingPrice)
  if (item.variantCombination) {
    const price = item.variantCombination.sellingPrice || item.variantCombination.price;
    if (price !== undefined && price !== null && price !== '') {
      return Number(price);
    }
  }

  // Priority 2: Check sellingPrice or currentPrice in cart item
  const itemPrice = item.sellingPrice || item.currentPrice;
  if (itemPrice !== undefined && itemPrice !== null && itemPrice !== '') {
    return Number(itemPrice);
  }

  // Priority 3: Fall back to productDetails price
  if (item.productDetails) {
    const pPrice = item.productDetails.sellingPrice || item.productDetails.price;
    if (pPrice !== undefined && pPrice !== null && pPrice !== '') {
      return Number(pPrice);
    }
  }

  // Default: return 0 if no valid price found
  console.warn('No valid price found for item:', item.productId);
  return 0;
};

// Helper function to get original price (including GST)
const getItemOriginalPrice = (item) => {
  const currentPrice = getItemPrice(item);

  // Priority 1: Check variantCombination for original price (mrp or price)
  if (item.variantCombination) {
    const mrp = item.variantCombination.mrp || item.variantCombination.originalPrice || item.variantCombination.price;
    if (mrp !== undefined && mrp !== null && mrp !== '') {
      return Number(mrp);
    }
  }

  // Priority 2: Check productDetails for original price
  if (item.productDetails) {
    const pMrp = item.productDetails.mrp || item.productDetails.originalPrice || item.productDetails.price;
    if (pMrp !== undefined && pMrp !== null && pMrp !== '') {
      return Number(pMrp);
    }
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
      return Number(variantGst) / 100;
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

// Helper function to get item image
const getItemImage = (item) => {
  // Priority 1: variantCombination primaryImage
  if (item.variantCombination && item.variantCombination.primaryImage) {
    return item.variantCombination.primaryImage;
  }

  // Priority 2: productImage from cart item
  if (item.productImage) {
    return item.productImage;
  }

  // Priority 3: productDetails image
  if (item.productDetails) {
    if (item.productDetails.image) {
      return item.productDetails.image;
    }
    if (item.productDetails.primaryImage) {
      return item.productDetails.primaryImage;
    }
  }

  // Default fallback image
  return '/Images/default-product.svg';
};

// Helper function to calculate item discount percentage
const getItemDiscountPercentage = (item) => {
  const originalPrice = getItemOriginalPrice(item);
  const currentPrice = getItemPrice(item);

  if (originalPrice <= currentPrice || originalPrice === 0) {
    return 0;
  }

  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
};

// ============================================
// MAIN CART COMPONENT
// ============================================

const Cart = ({ openModal, closeModal }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // Coupon and discount states
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoins, setAppliedCoins] = useState(0);
  const [actualDeliveryCharge, setActualDeliveryCharge] = useState(0);
  const [actualCodCharge, setActualCodCharge] = useState(0);

  const navigate = useNavigate();

  // Use the cart hook
  const {
    cartItems,
    loading,
    error,
    cartSummary,
    incrementQuantity,
    decrementQuantity,
    updateQuantity,
    removeItem,
    clearError,
    isEmpty,
    hasError,
    isRemoving,
    refreshCart
  } = useCart();

  const { filteredShippingRates, loading: shippingLoading } = useShippingRates();

  const handleTotalUpdate = React.useCallback((updateData) => {
    if (typeof updateData === 'object' && updateData !== null) {
      // Use functional update to avoid dependency on state
      setActualDeliveryCharge(prev => {
        const newValue = updateData.delivery || 0;
        return prev === newValue ? prev : newValue;
      });
      setActualCodCharge(prev => {
        const newValue = updateData.codCharge || 0;
        return prev === newValue ? prev : newValue;
      });
      console.log('Received updated details in Cart from PaymentSummary:', updateData);
    }
  }, []);


  // Calculate payment summary with GST splitting logic and proper variant price handling
  const calculatedPaymentSummary = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return {
        totalMrp: 0,
        basePrice: 0,
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
    
    // First pass to get total MRP (Selling Price incl GST) for shipping calculation
    const totalAmountForShipping = cartItems.reduce((sum, item) => {
      const price = getItemPrice(item);
      return sum + (price * (item.quantity || 1));
    }, 0);

    const deliveryCharge = getApplicableDeliveryCharge(totalAmountForShipping, filteredShippingRates);

    // Pass essential info to utility
    const result = calculateCartTotals(
      cartItems,
      totalDiscounts,
      deliveryCharge,
      actualCodCharge,
      'prepaid', // Default for Cart page
      appliedCoupon?.productType === 'SPECIFIC' 
        ? (appliedCoupon.productIds || (appliedCoupon.productId ? [appliedCoupon.productId] : []) || (appliedCoupon.productID ? [appliedCoupon.productID] : []))
        : null
    );

    // Keep compatibility with existing Karikku field names
    return {
      ...result,
      totalMRP: result.totalMrp,
      totalMRPExcludingGST: result.basePrice,
      discount: result.mrpDiscount, // NEW: Map to MRP discount for UI logic
      couponSavings: couponDiscount,
      coinSavings: appliedCoins,
      gst: result.gstAmount,
      totalItems: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
      subtotal: result.totalMrp,
      taxableValue: result.taxableValue,
      items: cartItems // CRITICAL: This allows PaymentSummary.jsx to perform its own calculation
    };
  }, [cartItems, couponDiscount, appliedCoins, filteredShippingRates, actualCodCharge, shippingLoading]);

  const handleCartCheckout = () => {
    navigate('/address', {
      state: {
        appliedCoupon: appliedCoupon
      }
    });
  };

  function openCouponModal() {
    setModalIsOpen(true);
  }

  function closeCouponModal() {
    setModalIsOpen(false);
  }

  // const handleCouponApply = (couponData) => {
  //   if (couponData && couponData.discount) {
  //     setAppliedCoupon(couponData);
  //     setCouponDiscount(couponData.discount);
  //   }
  // };


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
      const applicableItems = cartItems.filter(item => {
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

    if (discount <= 0) {
      toast.error('Coupon does not provide any discount for the items in your cart');
      return;
    }

    console.log('✅ Final discount:', discount);

    // ✨ THIS IS THE MAGIC! When you set this, the Payment Summary updates automatically
    setAppliedCoupon(couponData);
    setCouponDiscount(discount);  // 👈 This triggers the update!
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

  // API call to add item to wishlist
  const addToWishlistAPI = async (productId, variantCombination = null) => {
    try {
      const token = localStorage.getItem('authToken');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const requestData = {
        productId: productId,
        ...(variantCombination && { variantCombination: variantCombination })
      };

      const response = await axios.post(`${baseUrl}/add-to-wishlist`, requestData, config);

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Item added to wishlist successfully'
      };

    } catch (error) {
      console.error('API Error adding to wishlist:', error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          return {
            success: false,
            error: 'Your session has expired. Please log in again.',
            statusCode: 401
          };
        } else if (status === 409) {
          return {
            success: false,
            error: data.message || 'Item is already in your wishlist',
            statusCode: 409,
            alreadyExists: true
          };
        } else if (status === 404) {
          return {
            success: false,
            error: 'Product not found',
            statusCode: 404
          };
        } else {
          return {
            success: false,
            error: data.error || data.message || 'Failed to add item to wishlist',
            statusCode: status
          };
        }
      } else if (error.request) {
        return {
          success: false,
          error: 'Network connection error. Please check your internet and try again.'
        };
      } else {
        return {
          success: false,
          error: error.message || 'An unexpected error occurred'
        };
      }
    }
  };

  // Handle add to wishlist with variant combination
  const handleAddToWishlist = async (productId, variantCombination = null, productName = '') => {
    const itemKey = variantCombination
      ? `${productId}-${variantCombination.variantId}`
      : `${productId}-default`;

    if (wishlistItems.has(itemKey)) {
      return;
    }

    try {
      setWishlistItems(prev => new Set(prev.add(itemKey)));

      const apiResult = await addToWishlistAPI(productId, variantCombination);

      if (apiResult.success) {
        setWishlistedItems(prev => new Set(prev.add(itemKey)));
        const itemName = productName || 'Item';
        toast.success(`${itemName} added to wishlist successfully!`);
        console.log('Added to wishlist successfully:', apiResult.message);
      } else {
        console.error('API call failed:', apiResult.error);

        if (apiResult.statusCode === 401) {
          toast.error('Your session has expired. Please log in again.');
        } else if (apiResult.alreadyExists) {
          setWishlistedItems(prev => new Set(prev.add(itemKey)));
          toast.info('This item is already in your wishlist!');
        } else if (apiResult.statusCode === 404) {
          toast.error('This product is no longer available.');
        } else if (apiResult.error.includes('Network connection error')) {
          toast.error('Network connection error. Please check your internet and try again.');
        } else {
          toast.error(`Failed to add to wishlist: ${apiResult.error}`);
        }
      }

    } catch (error) {
      console.error('Unexpected error adding to wishlist:', error);
      toast.error('An unexpected error occurred. Please try again.');

    } finally {
      setWishlistItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Check if item is being added to wishlist
  const isItemAddingToWishlist = (productId, variantCombination = null) => {
    const itemKey = variantCombination
      ? `${productId}-${variantCombination.variantId}`
      : `${productId}-default`;
    return wishlistItems.has(itemKey);
  };

  // Check if item is in wishlist
  const isItemInWishlist = (productId, variantCombination = null) => {
    const itemKey = variantCombination
      ? `${productId}-${variantCombination.variantId}`
      : `${productId}-default`;
    return wishlistedItems.has(itemKey);
  };

  // API call to remove item from cart
  const removeFromCartAPI = async (productId, variantCombination = null) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${baseUrl}/remove-from-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          variantCombination: variantCombination
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove item from cart');
      }

      return {
        success: true,
        data: data,
        message: data.message
      };

    } catch (error) {
      console.error('API Error removing item:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  };

  // API call to update cart quantity
  const updateCartQuantityAPI = async (productId, newQuantity, variantCombination = null) => {
    try {
      const token = localStorage.getItem('authToken');

      // Validate inputs before making the API call
      if (!productId) {
        throw new Error('Product ID is required');
      }
      if (typeof newQuantity !== 'number' || newQuantity < 1) {
        throw new Error('Valid quantity is required');
      }

      const requestBody = {
        productId: productId,
        newQuantity: newQuantity
      };

      // Only include variantCombination if it exists and has valid data
      if (variantCombination && variantCombination.variantId) {
        requestBody.variantCombination = variantCombination;
      }

      console.log('Updating cart with:', requestBody); // Debug log

      const response = await fetch(`${baseUrl}/update-cart-quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update cart quantity');
      }

      return {
        success: true,
        data: data,
        message: data.message,
        cart: data.cart
      };

    } catch (error) {
      console.error('API Error updating quantity:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  };

  // Enhanced remove item with variant combination support
  const handleRemoveItem = async (productId, variantCombination = null, showConfirm = true) => {
    if (showConfirm) {
      setItemToRemove({ productId, variantCombination });
      setShowConfirmDialog(true);
      return;
    }

    const itemKey = variantCombination
      ? `${productId}-${variantCombination.variantId}`
      : `${productId}-default`;

    try {
      setRemovingItems(prev => new Set(prev.add(itemKey)));

      const hookResult = await removeItem(productId, variantCombination);

      if (hookResult && hookResult.success) {
        console.log('Item removed successfully');
      } else {
        console.error('Failed to remove item:', hookResult?.error);
        toast.error(`Failed to remove item: ${hookResult?.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Unexpected error removing item:', error);
      toast.error('An unexpected error occurred. Please check your connection and try again.');

    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });

      setShowConfirmDialog(false);
      setItemToRemove(null);
    }
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      handleRemoveItem(itemToRemove.productId, itemToRemove.variantCombination, false);
    }
  };

  const cancelRemove = () => {
    setShowConfirmDialog(false);
    setItemToRemove(null);
  };

  // Enhanced quantity change with variant combination support
  const handleQuantityChange = async (productId, change, variantCombination = null, currentQuantity) => {
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
      return;
    }

    const itemKey = variantCombination
      ? `${productId}-${variantCombination.variantId}`
      : `${productId}-default`;

    try {
      setUpdatingItems(prev => new Set(prev.add(itemKey)));

      // Use updateQuantity Redux hook directly instead of duplicate API calls
      const hookResult = await updateQuantity(productId, newQuantity, variantCombination);

      if (hookResult && hookResult.success) {
        console.log('Quantity updated successfully');
      } else {
        console.error('Failed to update quantity:', hookResult?.error);
        toast.error(`Failed to update quantity: ${hookResult?.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Unexpected error updating quantity:', error);
      toast.error('An unexpected error occurred. Please try again.');

    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Check if item is being removed
  const isItemRemoving = (productId, variantCombination = null) => {
    const itemKey = variantCombination
      ? `${productId}-${variantCombination.variantId}`
      : `${productId}-default`;
    return removingItems.has(itemKey);
  };

  // Check if item quantity is being updated
  const isItemUpdating = (productId, variantCombination = null) => {
    const itemKey = variantCombination
      ? `${productId}-${variantCombination.variantId}`
      : `${productId}-default`;
    return updatingItems.has(itemKey);
  };

  // Error state
  if (hasError) {
    return (
      <div className='CartMainwrapper'>
        <CartNavbar />
        <div className="cart-error">
          <p>Error loading cart: {error}</p>
          <button onClick={clearError}>Try Again</button>
        </div>
        <Footer />
      </div>
    );
  }

  // Empty cart state
  if (isEmpty) {
    return <EmptyCart />;
  }
  if (loading) return <div><LinearProgress color="success" /></div>;

  return (
    <>
      <div className='CartMainwrapper'>
        <CartNavbar />
        <CustomModal
          isOpen={modalIsOpen}
          onRequestClose={closeCouponModal}
          title="Apply coupons"
          onCouponApply={handleCouponApply}           // 👈 ADD THIS
          cartSummary={calculatedPaymentSummary}      // 👈 ADD THIS
          productId={cartItems.map(item => item.productId || item.id).join(',')}
          productType={null}                           // Optional: pass if needed
        />

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="confirmation-overlay">
            <div className="confirmation-dialog">
              <h3>Remove Item</h3>
              <p>Are you sure you want to remove this item from your cart?</p>
              <div className="confirmation-buttons">
                <button
                  onClick={cancelRemove}
                  className="btn-cancel"
                  disabled={itemToRemove && isItemRemoving(itemToRemove.productId, itemToRemove.variantCombination)}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="btn-confirm"
                  disabled={itemToRemove && isItemRemoving(itemToRemove.productId, itemToRemove.variantCombination)}
                >
                  {itemToRemove && isItemRemoving(itemToRemove.productId, itemToRemove.variantCombination) ? (
                    <>
                      <CircularProgress size={16} color="inherit" style={{ marginRight: '8px' }} />
                      Removing...
                    </>
                  ) : (
                    'Remove'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="cart-header">
          <h2>My Cart ({cartItems?.length})</h2>
          <p className='cart-sub-header'>Choose products</p>
        </div>

        <div className="cart-main-row row">
          <div className="col-lg-8 cart">
            {cartItems.map((item) => {
              const itemRemoving = isItemRemoving(item.productId, item.variantCombination);
              const itemUpdating = isItemUpdating(item.productId, item.variantCombination);
              const itemAddingToWishlist = isItemAddingToWishlist(item.productId, item.variantCombination);
              const itemInWishlist = isItemInWishlist(item.productId, item.variantCombination);
              const isDisabled = itemRemoving || itemUpdating;

              // Use helper functions to get item details
              const itemPrice = getItemPrice(item);
              const itemOriginalPrice = getItemOriginalPrice(item);
              const itemImage = getItemImage(item);
              const discountPercentage = getItemDiscountPercentage(item);

              const itemKey = item.variantCombination
                ? `${item.productId}-${item.variantCombination.variantId}`
                : `${item.productId}-default`;

              return (
                <div
                  className={`cart-box ${isDisabled ? 'updating' : ''}`}
                  key={itemKey}
                >
                  {itemRemoving && (
                    <div className="removing-overlay">
                      <p>Removing...</p>
                    </div>
                  )}

                  <div className="cart-details-row">
                    <div className="cart-left">
                      <div className="prod-image">
                        <img
                          src={itemImage}
                          alt={item.productDetails?.name || 'Product'}
                        />
                      </div>
                      <div className="cart-prod-detail">
                        {/* Display variant combination name badge if available */}
                        {item.variantCombination?.name && (
                          <div className="variant-badge" style={{
                            display: 'inline-block',
                            backgroundColor: '#F4E9B5',
                            color: '#675606',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            marginBottom: '8px',
                            border: '1px solid #C7BD90'
                          }}>
                            {item.variantCombination.name.split(':')[1]?.trim() || item.variantCombination.name}
                          </div>
                        )}

                        <div className="prod-name">
                          <h4>{item.productDetails?.name || 'Product Name'}</h4>
                        </div>

                        {/* Display variant selections if available */}
                        {item.variantCombination?.variants && Object.keys(item.variantCombination.variants).length > 0 && (
                          <div className="quantity">
                            {Object.entries(item.variantCombination?.variants).map(([key, value]) => (
                              <p key={key}>{value}</p>
                            ))}
                          </div>
                        )}

                        <div className="buttons">
                          <p
                            onClick={() => !isDisabled && handleRemoveItem(item.productId, item.variantCombination)}
                            className={isDisabled ? 'disabled' : ''}
                            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                          >
                            <RiDeleteBin6Line className='btn-icon' />
                            {itemRemoving ? 'Removing...' : 'Remove'}
                          </p>
                          <div className="separator"></div>
                          <p
                            onClick={() => !isDisabled && !itemAddingToWishlist && handleAddToWishlist(
                              item.productId,
                              item.variantCombination,
                              item.productDetails?.name
                            )}
                            className={`${isDisabled || itemAddingToWishlist ? 'disabled' : ''} ${itemInWishlist ? 'in-wishlist' : ''}`}
                            style={{
                              cursor: (isDisabled || itemAddingToWishlist) ? 'not-allowed' : 'pointer',
                              color: itemInWishlist ? '#ff6b6b' : 'inherit'
                            }}
                          >
                            {itemAddingToWishlist ? (
                              <>
                                <CircularProgress
                                  size={12}
                                  thickness={6}
                                  sx={{
                                    color: '#007bff',
                                    marginRight: '4px'
                                  }}
                                />
                                Adding...
                              </>
                            ) : (
                              <>
                                {itemInWishlist ? (
                                  <GoHeartFill className='btn-icon' style={{ color: '#ff6b6b' }} />
                                ) : (
                                  <GoHeart className='btn-icon' />
                                )}
                                {itemInWishlist ? 'In Wishlist' : 'Add to wishlist'}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="cart-right">
                      <div className="counter">
                        <button
                          className="counter__btn counter__btn--minus"
                          onClick={() => handleQuantityChange(item.productId, -1, item.variantCombination, item.quantity)}
                          disabled={item.quantity <= 1 || isDisabled}
                          style={{
                            opacity: (item.quantity <= 1 || isDisabled) ? 0.5 : 1,
                            cursor: (item.quantity <= 1 || isDisabled) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          −
                        </button>
                        <span className="counter__value" style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '30px',
                          height: '30px'
                        }}>
                          {itemUpdating ? (
                            <CircularProgress
                              size={14}
                              thickness={6}
                              sx={{
                                color: '#007bff',
                                animationDuration: '1s'
                              }}
                            />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          className="counter__btn counter__btn--plus"
                          onClick={() => handleQuantityChange(item.productId, 1, item.variantCombination, item.quantity)}
                          disabled={isDisabled}
                          style={{
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div className="price-detail" style={{ textAlign: "end" }}>
                        <div className="r-price">
                          <p style={{ fontWeight: '600', color: '#1c1c1c' }}>₹{(itemPrice * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="offer-price">
                          <div className="mob-price">
                            <p>₹{(itemPrice * item.quantity).toFixed(2)}</p>
                          </div>
                          {itemOriginalPrice > itemPrice && (
                            <>
                              <strike>₹{(itemOriginalPrice * item.quantity).toFixed(2)}</strike>
                              <div className="off">
                                <p>{discountPercentage}% OFF</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="col-lg-4 px-0 px-lg-3">
            <PaymentSummary
              onCheckout={handleCartCheckout}
              onApplyClick={openCouponModal}
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;