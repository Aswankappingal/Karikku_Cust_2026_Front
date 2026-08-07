// Complete Updated Payment.jsx with helper functions for price calculation

import React, { useState, useMemo, useEffect, useRef } from 'react'
import './Payment.scss'
import CartNavbar from '../../common/CartNavbar/CartNavbar'
import CustomModal from '../../Theme/CouponModal/CouponModal'
import PaymentSummary from '../../Theme/PaymentSummary/PaymentSummary'
import { useCart } from '../../../store/hook/useCart'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import baseUrl from '../../../baseUrl'
import useShippingRates from '../../../store/hook/useShippingRates'
import { CircularProgress, LinearProgress } from '@mui/material'
import { toast } from 'react-toastify'
import { calculateCartTotals, calculateItemPricing } from '../../../utils/pricing'

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
    console.warn('No valid price found for item:', item.productId);
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
    if (item.productDetails && item.productDetails.mrp !== undefined && item.productDetails.mrp !== null && item.productDetails.mrp !== '') {
        return Number(item.productDetails.mrp);
    }

    // Priority 3: Check item.mrp or item.originalPrice
    if (item.mrp !== undefined && item.mrp !== null && item.mrp !== '') {
        return Number(item.mrp);
    }
    if (item.originalPrice !== undefined && item.originalPrice !== null && item.originalPrice !== '') {
        return Number(item.originalPrice);
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
// MAIN PAYMENT COMPONENT
// ============================================

const Payment = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('saved-cards-2');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoins, setAppliedCoins] = useState(0);
    const [actualOrderTotal, setActualOrderTotal] = useState(0);
    const [actualDeliveryCharge, setActualDeliveryCharge] = useState(0);
    const [actualCodCharge, setActualCodCharge] = useState(0);
    const [cardDetails, setCardDetails] = useState({
        cardName: '',
        expDate: '',
        cvv: '',
        saveCard: false
    });
    
    // Refs to track initial data processing
    const initialCouponProcessed = useRef(false);

    const navigate = useNavigate();
    const location = useLocation();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const buyNowProduct = location.state?.buyNowProduct;
    const isBuyNow = location.state?.isBuyNow || false;

    const {
        cartItems,
        loading,
        error,
        isEmpty,
        hasError,
        clearCart,
        placeOrder,
        isPlacingOrder
    } = useCart();

    const getAuthToken = () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('Auth token retrieved:', token);
            return token;
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    };

    const getPaymentMethodForAPI = () => {
        switch (selectedPayment) {
            case 'saved-cards-2':
                return 'cod';
            case 'saved-cards-1':
            case 'saved-cards-3':
                return 'prepaid';
            case 'saved-cards-4':
            case 'saved-cards-5':
                return 'prepaid';
            default:
                return 'cod';
        }
    };

    const handleTotalUpdate = (updateData) => {
        if (typeof updateData === 'object' && updateData !== null) {
            setActualOrderTotal(updateData.total);
            setActualDeliveryCharge(updateData.delivery || 0);
            setActualCodCharge(updateData.codCharge || 0);
            console.log('Received updated details from PaymentSummary:', updateData);
        } else {
            // Fallback for older interface expectations just in case
            setActualOrderTotal(updateData);
            console.log('Received updated total from PaymentSummary:', updateData);
        }
    };

    // Calculate payment summary using shared standardized pricing utility
    const calculatedPaymentSummary = useMemo(() => {
        let itemsToCalculate = [];

        if (isBuyNow && buyNowProduct) {
            itemsToCalculate = [{
                productId: buyNowProduct.id,
                quantity: buyNowProduct.quantity || 1,
                variantCombination: buyNowProduct.variantCombination || null,
                productDetails: {
                    name: buyNowProduct.name,
                    price: buyNowProduct.price,
                    originalPrice: buyNowProduct.originalPrice || buyNowProduct.price,
                    gst: buyNowProduct.gst || buyNowProduct.taxPercentage || 5 // Default to 5% if missing
                }
            }];
        } else {
            itemsToCalculate = cartItems || [];
        }

        if (itemsToCalculate.length === 0) {
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
                itemsPricing: []
            };
        }

        const totalDiscounts = couponDiscount + appliedCoins;
        
        // Pass essential info to utility
        const result = calculateCartTotals(
            itemsToCalculate,
            totalDiscounts,
            actualDeliveryCharge,
            actualCodCharge,
            getPaymentMethodForAPI(),
            appliedCoupon?.productType === 'SPECIFIC' 
                ? (appliedCoupon.productIds || (appliedCoupon.productId ? [appliedCoupon.productId] : []) || (appliedCoupon.productID ? [appliedCoupon.productID] : []))
                : null
        );

        // Keep compatibility with existing Karikku field names if needed by UI
        return {
            ...result,
            totalMRP: result.totalMrp, // Compatibility
            totalMRPExcludingGST: result.basePrice, // Compatibility
            discount: result.mrpDiscount, // NEW: Map to MRP discount for UI logic
            couponSavings: couponDiscount,
            coinSavings: appliedCoins,
            gst: result.gstAmount, // Compatibility
            totalItems: itemsToCalculate.reduce((sum, item) => sum + (item.quantity || 1), 0),
            subtotal: result.basePrice, // UNDISCOUNTED subtotal for coupon calculation
            taxableValue: result.taxableValue, // DISCOUNTED subtotal for GST
            items: itemsToCalculate // CRITICAL for PaymentSummary.jsx
        };
    }, [cartItems, couponDiscount, appliedCoins, isBuyNow, buyNowProduct, actualDeliveryCharge, actualCodCharge, selectedPayment]);

    useEffect(() => {
        if (location.state && location.state.selectedAddress) {
            setSelectedAddress(location.state.selectedAddress);
        } else {
            navigate('/address');
            return;
        }

        // Check for passed coupon - only on initial load
        if (location.state.appliedCoupon && !initialCouponProcessed.current) {
            console.log('📦 Initial coupon from navigation:', location.state.appliedCoupon);
            handleCouponApply(location.state.appliedCoupon);
            initialCouponProcessed.current = true;
        }
    }, [location.state, navigate]); // Removed subtotal dependency as it was redundant and could cause re-triggers



    const preparePaymentDetails = () => {
        const method = getPaymentMethodForAPI();
        if (method === 'prepaid' || method === 'pre-paid') {
            return {
                cardName: cardDetails.cardName || '',
                expDate: cardDetails.expDate || '',
                lastFour: cardDetails.cardNumber ? cardDetails.cardNumber.slice(-4) : '',
                paymentGateway: 'razorpay'
            };
        }
        return {};
    };

    const validateDeliveryAddress = () => {
        if (!selectedAddress) {
            throw new Error('No delivery address selected.');
        }

        const { fullName, phone, addressLine1, address, state, city, pincode, pinCode, zipCode } = selectedAddress;

        if (!fullName || !phone || !(addressLine1 || address) || !city || !state || !(pincode || pinCode || zipCode)) {
            console.error('Validation failed for address:', selectedAddress);
            throw new Error('Complete delivery address is required. Please edit your address to include City and Pincode.');
        }
    };

    const createRazorpayOrder = async (amount) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Authentication token is missing');
            }
            const orderAmount = actualOrderTotal > 0 ? actualOrderTotal : amount;
            console.log('Creating Razorpay order with amount:', orderAmount);

            if (!orderAmount || orderAmount <= 0) {
                throw new Error('Invalid order amount');
            }

            const response = await axios.post(
                `${baseUrl}/create-order`,
                {
                    amount: (orderAmount),
                    currency: 'INR'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            console.log('Razorpay order response:', response.data);

            if (response.data && response.data.orderId) {
                return response.data;
            } else {
                throw new Error('Invalid response from payment server');
            }
        } catch (error) {
            console.error('Error creating Razorpay order:', error);

            if (error.response) {
                const errorMsg = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
                throw new Error(errorMsg);
            } else if (error.request) {
                throw new Error('Network error. Please check your internet connection.');
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. Please try again.');
            } else {
                throw new Error(error.message || 'Failed to create payment order');
            }
        }
    };

    const verifyRazorpayPayment = async (paymentData) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            const response = await axios.post(
                `${baseUrl}/verify-payment`,
                paymentData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error verifying payment:', error);

            if (error.response) {
                const errorMsg = error.response.data?.message || error.response.data?.error || 'Payment verification failed';
                throw new Error(errorMsg);
            } else {
                throw new Error('Payment verification failed');
            }
        }
    };

    const updateOrderPaymentStatus = async (orderId, paymentId, status, failureReason = null) => {
        try {
            const token = getAuthToken();
            const response = await axios.put(
                `${baseUrl}/update-order-payment`,
                {
                    orderId,
                    paymentId,
                    paymentStatus: status,
                    failureReason
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating order payment status:', error);
            throw new Error('Failed to update payment status');
        }
    };

    const handleRazorpayPayment = (orderData) => {
        return new Promise(async (resolve, reject) => {
            try {
                const totalAmount = actualOrderTotal > 0 ? actualOrderTotal : calculatedPaymentSummary.total;
                const razorpayOrder = await createRazorpayOrder(totalAmount * 100);

                const options = {
                    key: "rzp_live_RHq8bPbaAdFuwH",
                    amount: Math.round(totalAmount * 100),
                    currency: 'INR',
                    name: 'KARIKKU',
                    description: `Order for ${calculatedPaymentSummary.totalItems} items`,
                    order_id: razorpayOrder.orderId,
                    handler: async (response) => {
                        try {
                            console.log('Payment successful, verifying...', response);

                            const verificationResult = await verifyRazorpayPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verificationResult.status === 'success') {
                                console.log('✅ Payment verified successfully on server');
                                resolve({
                                    success: true,
                                    paymentId: response.razorpay_payment_id,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpayOrderId: response.razorpay_order_id
                                });
                            } else {
                                console.error('❌ Payment verification failed on server:', verificationResult);
                                throw new Error(verificationResult.message || 'Payment verification failed');
                            }
                        } catch (error) {
                            console.error('❌ Payment handler error:', error);
                            reject(new Error('Payment verification failed: ' + error.message));
                        }
                    },
                    prefill: {
                        name: selectedAddress.fullName,
                        email: selectedAddress.email || '',
                        contact: selectedAddress.phone
                    },
                    notes: {
                        address: `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state}`,
                        total_amount: totalAmount
                    },
                    theme: {
                        color: '#3DAE4A'
                    },
                    modal: {
                        ondismiss: () => {
                            console.log('Payment cancelled by user');
                            reject(new Error('Payment cancelled by user'));
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    console.error('Payment failed:', response.error);
                    reject(new Error(`Payment failed: ${response.error.description}`));
                });

                rzp.open();

            } catch (error) {
                console.error('Error setting up Razorpay payment:', error);
                reject(new Error('Failed to initialize payment: ' + error.message));
            }
        });
    };

    const placeSingleProductOrderAPI = async (orderData, paymentResult = null) => {
        try {
            console.log('=== PLACING SINGLE PRODUCT ORDER AFTER PAYMENT ===');
            console.log('Single product order data:', orderData);
            console.log('Payment result:', paymentResult);

            const token = getAuthToken();
            if (!token) {
                throw new Error('Authentication token not found');
            }

            if (paymentResult) {
                orderData.paymentDetails = {
                    paymentId: paymentResult.paymentId,
                    razorpayPaymentId: paymentResult.razorpayPaymentId,
                    razorpayOrderId: paymentResult.razorpayOrderId,
                    transactionId: paymentResult.paymentId,
                    status: 'completed'
                };
                orderData.paymentStatus = 'completed';
            } else if (orderData.paymentMethod === 'cod') {
                orderData.paymentStatus = 'pending';
            }

            const response = await axios.post(
                `${baseUrl}/single-product-place-order`,
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            if (response.data.success) {
                console.log('✅ Single product order placed successfully:', response.data);
                return {
                    success: true,
                    data: response.data.order,
                    orderId: response.data.order.id || response.data.order._id
                };
            } else {
                console.error('❌ Single product order placement failed:', response.data);
                return {
                    success: false,
                    error: response.data.message || 'Failed to place order'
                };
            }
        } catch (error) {
            console.error('❌ Error in single product order API:', error);

            let errorMessage = 'Failed to place order. Please try again.';

            if (error.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please try again.';
            } else {
                errorMessage = error.message || errorMessage;
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const prepareOrderItems = () => {
        console.log('=== DEBUG: PREPARING ORDER ITEMS ===');
        console.log('Raw cartItems:', cartItems);

        const items = cartItems.map((item, index) => {
            console.log(`Processing item ${index}:`, item);

            const productId = item.productId || item.id || item._id;
            if (!productId) {
                console.warn(`Item ${index} missing ID:`, item);
            }

            // Extract variant: could be variantId/variantName (legacy) or variantCombination (current)
            let variant = null;
            if (item.variantCombination) {
                variant = item.variantCombination;
            } else if (item.variantId) {
                variant = {
                    variantId: item.variantId.toString(),
                    variantName: (item.variantName || '').toString()
                };
            } else if (item.variant) {
                variant = item.variant;
            }

            const preparedItem = {
                productId: productId || `temp_id_${index}`,
                quantity: parseInt(item.quantity) || 1,
                price: parseFloat(getItemPrice(item) || 0),
                originalPrice: parseFloat(getItemOriginalPrice(item) || 0),
                gstRate: parseFloat((getItemGSTRate(item) * 100).toFixed(2)) || 0,
                variant: variant,
                productName: (item.productDetails?.name || item.name || 'Unknown Product').toString(),
                productImage: (item.productDetails?.image || item.image || '').toString(),
                unit: (item.unit || 'pcs').toString()
            };

            console.log(`Prepared item ${index}:`, preparedItem);
            return preparedItem;
        }).filter(item => item.productId && item.productId !== `temp_id_${cartItems.findIndex(ci => !ci.productId && !ci.id && !ci._id)}`);

        console.log('Final prepared items:', items);
        return items;
    };

    const placeOrderAPI = async (orderData, paymentResult = null) => {
        try {
            console.log('=== PLACING REGULAR ORDER AFTER PAYMENT ===');
            console.log('Order data:', orderData);
            console.log('Payment result:', paymentResult);

            if (paymentResult) {
                orderData.paymentDetails = {
                    paymentId: paymentResult.paymentId,
                    razorpayPaymentId: paymentResult.razorpayPaymentId,
                    razorpayOrderId: paymentResult.razorpayOrderId,
                    status: 'completed'
                };
                orderData.paymentStatus = 'completed';
            } else if (orderData.paymentMethod === 'cod') {
                orderData.paymentStatus = 'pending';
            }

            const result = await placeOrder(orderData);

            if (result.success) {
                console.log('✅ Order placed successfully:', result.data);
                return {
                    success: true,
                    data: result.data.order || result.data,
                    orderId: result.data.orderId || result.data.id || result.data._id
                };
            } else {
                console.error('❌ Order placement failed:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Unexpected error during order placement:', error);
            return {
                success: false,
                error: error.message || 'Failed to place order'
            };
        }
    };

    const handlePaymentProcess = async () => {
        if (isProcessingPayment || isPlacingOrder) {
            console.log('Already processing, ignoring duplicate request');
            return;
        }

        try {
            setIsProcessingPayment(true);

            const token = getAuthToken();
            if (!token) {
                toast.warn('Please login to continue');
                navigate('/login');
                return;
            }

            validateDeliveryAddress();

            const paymentMethod = getPaymentMethodForAPI();

            if (paymentMethod !== 'cod' && !window.Razorpay) {
                toast.error('Payment gateway is not available. Please try again later or use Cash on Delivery.');
                return;
            }

            console.log('=== PREPARING ORDER DATA ===');
            console.log('Is Buy Now:', isBuyNow);
            console.log('Buy Now Product:', buyNowProduct);
            console.log('Payment Method:', paymentMethod);
            console.log('Total Amount:', actualOrderTotal > 0 ? actualOrderTotal : calculatedPaymentSummary.total);

            let orderData;
            let paymentResult = null;

            const finalTotal = actualOrderTotal > 0 ? actualOrderTotal : calculatedPaymentSummary.total;

            if (isBuyNow && buyNowProduct) {
                orderData = {
                    productId: buyNowProduct.id,
                    quantity: buyNowProduct.quantity || 1,
                    variant: buyNowProduct.variantCombination || buyNowProduct.variants || null,
                    price: getItemPrice(buyNowProduct),
                    originalPrice: getItemOriginalPrice(buyNowProduct),
                    gstRate: parseFloat((getItemGSTRate(buyNowProduct) * 100).toFixed(2)) || 0,
                    deliveryAddress: {
                        fullName: selectedAddress.fullName,
                        phone: selectedAddress.phone,
                        email: selectedAddress.email || '',
                        addressLine1: selectedAddress.addressLine1 || selectedAddress.address,
                        addressLine2: selectedAddress.addressLine2 || '',
                        city: selectedAddress.city || '',
                        state: selectedAddress.state,
                        pincode: selectedAddress.pincode || selectedAddress.zipCode || selectedAddress.pinCode,
                        landmark: selectedAddress.landmark || '',
                        addressType: selectedAddress.addressType || 'Home'
                    },
                    paymentMethod: paymentMethod,
                    paymentDetails: preparePaymentDetails(),
                    deliveryCharge: actualDeliveryCharge,
                    codCharge: actualCodCharge,
                    discountAmount: couponDiscount + appliedCoins,
                    couponCode: appliedCoupon?.code || null,
                    specialInstructions: '',
                    preferredDeliveryDate: null,
                    preferredDeliveryTime: null
                };
            } else {
                if (!cartItems || cartItems.length === 0) {
                    throw new Error('Cart is empty');
                }

                orderData = {
                    items: prepareOrderItems(),
                    deliveryAddress: {
                        fullName: selectedAddress.fullName,
                        phone: selectedAddress.phone,
                        email: selectedAddress.email || '',
                        addressLine1: selectedAddress.addressLine1 || selectedAddress.address,
                        addressLine2: selectedAddress.addressLine2 || '',
                        city: selectedAddress.city || '',
                        state: selectedAddress.state,
                        pincode: selectedAddress.pincode || selectedAddress.zipcode || selectedAddress.zipCode || selectedAddress.pinCode,
                        landmark: selectedAddress.landmark || '',
                        addressType: selectedAddress.addressType || 'Home'
                    },
                    paymentMethod: paymentMethod,
                    paymentDetails: preparePaymentDetails(),
                    deliveryCharge: actualDeliveryCharge,
                    codCharge: actualCodCharge,
                    discountAmount: couponDiscount + appliedCoins,
                    couponCode: appliedCoupon?.code || null,
                    specialInstructions: '',
                    preferredDeliveryDate: null,
                    preferredDeliveryTime: null
                };
            }

            if (paymentMethod === 'cod') {
                console.log('Processing COD order...');

                let result;
                if (isBuyNow && buyNowProduct) {
                    result = await placeSingleProductOrderAPI(orderData);
                } else {
                    result = await placeOrderAPI(orderData);
                }

                if (result.success) {
                    console.log('🎉 COD Order placed successfully!');
                    toast.success('Order placed successfully! You will pay on delivery.');

                    if (!isBuyNow) {
                        clearCart();
                    }

                    navigate('/order-details', {
                        state: { order: result.data },
                        replace: true
                    });
                } else {
                    throw new Error(result.error);
                }
            } else {
                console.log('Processing online payment...');

                try {
                    paymentResult = await handleRazorpayPayment(orderData);
                    console.log('Payment completed:', paymentResult);

                    if (paymentResult.success) {
                        console.log('Payment successful, placing order...');

                        let result;
                        if (isBuyNow && buyNowProduct) {
                            result = await placeSingleProductOrderAPI(orderData, paymentResult);
                        } else {
                            result = await placeOrderAPI(orderData, paymentResult);
                        }

                        if (result.success) {
                            console.log('🎉 Order placed successfully after payment!');
                            toast.success(`Order placed successfully! Payment ID: ${paymentResult.paymentId}`);

                            if (!isBuyNow) {
                                clearCart();
                            }

                            navigate('/order-details', {
                                state: {
                                    order: result.data,
                                    paymentId: paymentResult.paymentId
                                },
                                replace: true
                            });
                        } else {
                            console.error('❌ Payment successful but order placement failed:', result.error);
                            toast.error('Payment was successful but there was an issue placing your order: ' + result.error, {
                                autoClose: false,
                                closeOnClick: false,
                                draggable: false
                            });
                        }
                    } else {
                        throw new Error('Payment was not successful according to Razorpay');
                    }
                } catch (paymentError) {
                    console.error('Payment failed:', paymentError);
                    toast.error(paymentError.message || 'Payment failed. Please try again.');
                }
            }

        } catch (err) {
            console.error('Error in handlePaymentProcess:', err);
            toast.error(err.message || 'Error processing order. Please try again.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    useEffect(() => {
        const loadRazorpay = () => {
            return new Promise((resolve) => {
                if (window.Razorpay) {
                    resolve(true);
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    resolve(true);
                };
                script.onerror = () => {
                    resolve(false);
                };
                document.body.appendChild(script);
            });
        };

        loadRazorpay();
    }, []);

    function closeModal() {
        setModalIsOpen(false);
    }

    const handlePaymentChange = (value) => {
        setSelectedPayment(value);
    };

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

    const handleCardInputChange = (field, value) => {
        setCardDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleExpiryDateChange = (value) => {
        let cleanValue = value.replace(/\D/g, '');

        if (cleanValue.length >= 2) {
            cleanValue = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4);
        }

        handleCardInputChange('expDate', cleanValue);
    };

    if (loading || !selectedAddress) {
        return <div><LinearProgress color="success" /></div>;
    }

    if (hasError) {
        return (
            <div className='checkoutPaymentmainWrapper'>
                <CartNavbar />
                <div className="paymentMain">
                    <div className="payment-header">
                        <h2>Payment</h2>
                    </div>
                    <div className="row">
                        <div className="col-lg-8 col-md-6 left-col">
                            <p>Error loading cart data: {error}</p>
                            <button onClick={() => window.location.reload()}>Retry</button>
                        </div>
                        <div className="col-lg-4 checkout-card">
                            <p>Unable to load payment summary</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isBuyNow && isEmpty) {
        return (
            <div className='checkoutPaymentmainWrapper'>
                <CartNavbar />
                <div className="paymentMain">
                    <div className="payment-header">
                        <h2>Payment</h2>
                    </div>
                    <div className="row">
                        <div className="col-lg-8 col-md-6 left-col">
                            <p>Your cart is empty. Please add items to proceed.</p>
                            <button onClick={() => navigate('/')}>Continue Shopping</button>
                        </div>
                        <div className="col-lg-4 checkout-card">
                            <p>No items in cart</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='checkoutPaymentmainWrapper'>
            <CartNavbar />
            <CustomModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                title="Apply coupons"
                onCouponApply={handleCouponApply}
                cartSummary={calculatedPaymentSummary}
                productId={(isBuyNow && buyNowProduct ? [buyNowProduct] : cartItems).map(item => item.productId || item.id).join(',')}
            />

            <div className="paymentMain">
                <div className="payment-header">
                    <h2>Payment</h2>
                    {isBuyNow && buyNowProduct && (
                        <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                            Buy Now: {buyNowProduct.name} (Qty: {buyNowProduct.quantity})
                        </p>
                    )}
                </div>

                <div className="addresses-header">
                    <h4>Choose payment Method</h4>
                </div>
                <div className="row">
                    <div className="col-lg-8 col-md-6 left-col">
                        <div className="payment-option-main">
                            {/* <div className="payment-option border-bottom">
                                <div className="payment-row">
                                    <input
                                        type="radio"
                                        id="saved-cards-1"
                                        name="paymentMethod"
                                        value="saved-cards-1"
                                        checked={selectedPayment === 'saved-cards-1'}
                                        onChange={() => handlePaymentChange('saved-cards-1')}
                                        disabled={isProcessingPayment || isPlacingOrder}
                                    />
                                    <label htmlFor="saved-cards-1">Saved cards</label>
                                </div>
                            </div> */}

                            <div className="payment-option border-bottom" style={{ paddingTop: "1rem" }}>
                                <div className="payment-row">
                                    <input
                                        type="radio"
                                        id="saved-cards-2"
                                        name="paymentMethod"
                                        value="saved-cards-2"
                                        checked={selectedPayment === 'saved-cards-2'}
                                        onChange={() => handlePaymentChange('saved-cards-2')}
                                        disabled={isProcessingPayment || isPlacingOrder}
                                    />
                                    <label htmlFor="saved-cards-2">Cash on Delivery</label>
                                </div>
                            </div>

                            {/* <div className="payment-option border-bottom" style={{ paddingTop: "1rem" }}>
                                <div className="payment-row" style={{ paddingBottom: "1rem" }}>
                                    <input
                                        type="radio"
                                        id="saved-cards-3"
                                        name="paymentMethod"
                                        value="saved-cards-3"
                                        checked={selectedPayment === 'saved-cards-3'}
                                        onChange={() => handlePaymentChange('saved-cards-3')}
                                        disabled={isProcessingPayment || isPlacingOrder}
                                    />
                                    <label htmlFor="saved-cards-3">Credit/Debit cards</label>
                                </div>
                                {selectedPayment === 'saved-cards-3' && (
                                    <div className="card-details">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="input-field">
                                                    <label className="input-label" htmlFor="cardName">Card Name</label>
                                                    <input
                                                        type="text"
                                                        id="cardName"
                                                        value={cardDetails.cardName}
                                                        onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                                                        placeholder="Enter card holder name"
                                                        disabled={isProcessingPayment || isPlacingOrder}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div className="input-field">
                                                    <label className="input-label" htmlFor="expDate">Exp.Date</label>
                                                    <input
                                                        type="text"
                                                        id="expDate"
                                                        value={cardDetails.expDate}
                                                        onChange={(e) => handleExpiryDateChange(e.target.value)}
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                        disabled={isProcessingPayment || isPlacingOrder}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div className="input-field">
                                                    <label className="input-label" htmlFor="cvv">CVV</label>
                                                    <input
                                                        type="text"
                                                        id="cvv"
                                                        value={cardDetails.cvv}
                                                        onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                                                        placeholder="123"
                                                        maxLength="4"
                                                        disabled={isProcessingPayment || isPlacingOrder}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-detail-footer">
                                            <div className="security-check">
                                                <input
                                                    type="checkbox"
                                                    id="saveCard"
                                                    checked={cardDetails.saveCard}
                                                    onChange={(e) => handleCardInputChange('saveCard', e.target.checked)}
                                                    disabled={isProcessingPayment || isPlacingOrder}
                                                />
                                                <label htmlFor="saveCard">Save this card securely</label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div> */}

                            <div className="payment-option" style={{ paddingTop: "1rem" }}>
                                <div className="payment-row">
                                    <input
                                        type="radio"
                                        id="saved-cards-4"
                                        name="paymentMethod"
                                        value="saved-cards-4"
                                        checked={selectedPayment === 'saved-cards-4'}
                                        onChange={() => handlePaymentChange('saved-cards-4')}
                                        disabled={isProcessingPayment || isPlacingOrder}
                                    />
                                    <label htmlFor="saved-cards-4">UPI / Others</label>
                                </div>
                            </div>

                            {/* <div className="payment-option" style={{ paddingTop: "1rem" }}>
                                <div className="payment-row">
                                    <input
                                        type="radio"
                                        id="saved-cards-5"
                                        name="paymentMethod"
                                        value="saved-cards-5"
                                        checked={selectedPayment === 'saved-cards-5'}
                                        onChange={() => handlePaymentChange('saved-cards-5')}
                                        disabled={isProcessingPayment || isPlacingOrder}
                                    />
                                    <label htmlFor="saved-cards-5">Gift Card</label>
                                </div>
                            </div> */}
                        </div>
                    </div>
                    <div className="col-lg-4 checkout-card">
                        <PaymentSummary
                            onCheckout={handlePaymentProcess}
                            onApplyClick={handleApplyClick}
                            cartSummary={calculatedPaymentSummary}
                            onCouponApply={handleCouponApply}
                            onCoinApply={handleCoinApply}
                            appliedCoupon={appliedCoupon}
                            appliedCoins={appliedCoins}
                            onCouponRemove={handleCouponRemove}
                            onCoinRemove={handleCoinRemove}
                            useShippingRates={useShippingRates}
                            isProcessing={isProcessingPayment || isPlacingOrder}
                            buttonText={(isProcessingPayment || isPlacingOrder) ? 'Processing Order...' : 'Place Order'}
                            onTotalUpdate={handleTotalUpdate}
                            isCODSelected={selectedPayment === 'saved-cards-2'}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Payment;