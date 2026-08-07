import React, { useState, useEffect } from 'react';
import './PaymentSummary.scss';
import { calculateCartTotals, getApplicableDeliveryCharge } from '../../../utils/pricing';
import { CircularProgress } from '@mui/material';
import useShippingRates from '../../../store/hook/useShippingRates';

const PaymentSummary = ({
    onCheckout,
    onApplyClick,
    cartSummary,
    onCouponApply,
    onCoinApply,
    appliedCoupon,
    appliedCoins,
    onCouponRemove,
    onCoinRemove,
    useShippingRates: propUseShippingRates, // Shadow prop to avoid conflict
    onTotalUpdate, // Callback to pass total to parent
    isCODSelected = false, // Prop to indicate if COD payment method is selected
    isProcessing = false, // Prop for loading state
    buttonText = 'Proceed to checkout' // Prop for button label
}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // Initialize the useShippingRates hook
    const {
        shippingRates,
        filteredShippingRates,
        loading: shippingLoading,
        error: shippingError,
        availableZones,
        priceStats,
        codCharge, // Get COD charge from hook
        updateZones,
        updatePriceRanges,
        updateSearchQuery,
        refetch
    } = (propUseShippingRates || useShippingRates)({
        autoFetch: true,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    useEffect(() => {
        console.log('PaymentSummary - Filtered shipping rates:', filteredShippingRates);
        console.log('PaymentSummary - COD Charge:', codCharge);
    }, [filteredShippingRates, codCharge]);

    const handleApplyClick = () => {
        if (onApplyClick) {
            onApplyClick();
        }
    };

    const handleCheckout = () => {
        if (onCheckout) {
            onCheckout();
        }
    };

    // Helper function to safely format numbers and handle edge cases
    const formatPrice = (price) => {
        if (price === null || price === undefined || isNaN(price)) {
            return '0.00';
        }
        const numPrice = Number(price);
        if (Math.abs(numPrice) < 0.01) {
            return '0.00';
        }
        return numPrice.toFixed(2);
    };

    // Helper function to format savings with proper sign
    const formatSavings = (amount) => {
        if (!amount || amount === 0) return '0.00';
        return formatPrice(Math.abs(amount));
    };

    // Default values with better error handling
    const summary = {
        totalMRP: cartSummary?.totalMRP ?? 0,
        totalMRPExcludingGST: cartSummary?.totalMRPExcludingGST ?? 0,
        discount: cartSummary?.discount ?? 0,
        couponSavings: cartSummary?.couponSavings ?? 0,
        coinSavings: cartSummary?.coinSavings ?? 0,
        gst: cartSummary?.gst ?? 0,
        delivery: cartSummary?.delivery ?? 0,
        total: cartSummary?.total ?? 0,
        totalSavings: cartSummary?.totalSavings ?? 0,
        totalItems: cartSummary?.totalItems ?? 0
    };

    // Additional validation to ensure we have valid numbers
    Object.keys(summary).forEach(key => {
        if (typeof summary[key] !== 'number' || isNaN(summary[key])) {
            summary[key] = 0;
        }
    });

    // Calculate delivery charge based on current totals and rates
    // We use totalMRP as the base for delivery calculation as per Karikku standard
    const actualDelivery = getApplicableDeliveryCharge(summary.totalMRP, filteredShippingRates || shippingRates);

    // Calculate COD charge (only if COD is selected), strictly enforce 30 Rs
    const actualCodCharge = isCODSelected ? 30 : 0;

    // Use standardized pricing utility for accuracy and whole number rounding
    const itemsForCalculation = cartSummary?.items || cartSummary?.products || [];
    const transactionDiscounts = summary.couponSavings + summary.coinSavings;
    
    const result = calculateCartTotals(
        itemsForCalculation.length > 0 ? itemsForCalculation : (cartSummary?.originalItems || []), // Support for both passing items or using summary
        transactionDiscounts,
        actualDelivery,
        actualCodCharge,
        isCODSelected ? 'cod' : 'prepaid',
        appliedCoupon?.productType === 'SPECIFIC' 
            ? (appliedCoupon.productIds || (appliedCoupon.productID ? [appliedCoupon.productID] : []))
            : null
    );

    // Update summary with standardized values
    const updatedSummary = {
        ...summary,
        totalMRPExcludingGST: result.basePrice,
        gst: result.gstAmount,
        delivery: result.delivery,
        codCharge: result.codCharge,
        total: result.total,
        discount: result.mrpDiscount, // NEW: Use explicitly calculated MRP discount
        couponSavings: summary.couponSavings, // Maintain exact user input
        coinSavings: summary.coinSavings      // Maintain exact user input
    };


    // Pass the updated total to parent whenever it changes
    useEffect(() => {
        if (onTotalUpdate && typeof onTotalUpdate === 'function') {
            onTotalUpdate({
                total: updatedSummary.total,
                delivery: updatedSummary.delivery,
                codCharge: updatedSummary.codCharge
            });
        }
    }, [updatedSummary.total, updatedSummary.delivery, updatedSummary.codCharge, onTotalUpdate]);

    // Check if all values are zero (might indicate a problem)
    const allValuesZero = Object.values(summary).every(value => value === 0);

    if (allValuesZero && cartSummary) {
        console.warn('All payment summary values are zero, but cartSummary was provided:', cartSummary);
    }

    // Calculate total savings to display
    const displayTotalSavings = updatedSummary.discount + updatedSummary.couponSavings + updatedSummary.coinSavings;

    return (
        <div className='PaymentsummaryMainWrapper'>
            <div className="payment-summary-section">
                {/* Coupon/Coins Section */}
                <div className="coupon">
                    <div className="left-coupon">
                        <img src="/Images/coin.svg" alt="" />
                        <h3>Apply coupons</h3>
                        {appliedCoins > 0 && (
                            <div className="applied-amount">
                                <span>Applied: ₹{formatPrice(appliedCoins)}</span>
                                <button onClick={onCoinRemove} className="remove-btn">×</button>
                            </div>
                        )}
                    </div>
                    <div className="right-coupon">
                        {appliedCoupon ? (
                            <p style={{ cursor: 'default', textDecoration: 'none', color: '#3DAE4A' }}>Applied</p>
                        ) : (
                            <p onClick={handleApplyClick}>Apply</p>
                        )}
                    </div>
                </div>

                {/* Applied Coupon Display */}
                {appliedCoupon && (
                    <div className="applied-coupon">
                        <div className="coupon-info">
                            <span className="coupon-code">{appliedCoupon.code}</span>
                            <span className="coupon-savings">-₹{formatSavings(updatedSummary.couponSavings)}</span>
                        </div>
                        <button onClick={onCouponRemove} className="remove-coupon">Remove</button>
                    </div>
                )}

                {/* Shipping Loading/Error States */}
                {shippingLoading && (
                    <div className="shipping-loading" style={{ color: '#888', margin: '10px 0', fontSize: '14px' }}>
                        Loading shipping rates...
                    </div>
                )}
                {shippingError && (
                    <div className="shipping-error" style={{ color: 'red', margin: '10px 0', fontSize: '14px' }}>
                        Error loading shipping rates. Please try again.
                        <button
                            onClick={refetch}
                            style={{
                                marginLeft: '10px',
                                background: 'none',
                                border: '1px solid red',
                                color: 'red',
                                padding: '2px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="payment-summary">
                    <h3>Payment summary</h3>
                    <table>
                        <tbody>
                            <tr className='table-row'>
                                <td className='left-side'>Subtotal </td>
                                <td className='right-side'>₹{formatPrice(updatedSummary.totalMRPExcludingGST)}</td>
                            </tr>

                            {updatedSummary.discount > 0 && (
                                <tr className='table-row'>
                                    <td className='left-side'>Discount on MRP</td>
                                    <td className='right-side' style={{ color: "#3DAE4A" }}>
                                        -₹{formatSavings(updatedSummary.discount)}
                                    </td>
                                </tr>
                            )}

                            {updatedSummary.couponSavings > 0 && (
                                <tr className='table-row'>
                                    <td className='left-side'>Coupon savings</td>
                                    <td className='right-side' style={{ color: "#3DAE4A" }}>
                                        -₹{formatSavings(updatedSummary.couponSavings)}
                                    </td>
                                </tr>
                            )}

                            {updatedSummary.coinSavings > 0 && (
                                <tr className='table-row'>
                                    <td className='left-side'>Coin savings</td>
                                    <td className='right-side' style={{ color: "#3DAE4A" }}>
                                        -₹{formatSavings(updatedSummary.coinSavings)}
                                    </td>
                                </tr>
                            )}

                            <tr className='table-row'>
                                <td className='left-side'>Applicable GST</td>
                                <td className='right-side'>₹{formatPrice(updatedSummary.gst)}</td>
                            </tr>

                            <tr className='table-row'>
                                <td className='left-side'>Delivery</td>
                                <td className='right-side'>
                                    {shippingLoading ? (
                                        <span>Loading...</span>
                                    ) : shippingError ? (
                                        <span>Error</span>
                                    ) : updatedSummary.delivery === 0 ? (
                                        <span>Free</span>
                                    ) : (
                                        <>₹{formatPrice(updatedSummary.delivery)}</>
                                    )}
                                </td>
                            </tr>

                            {/* Display COD charge if COD is selected */}
                            {isCODSelected && updatedSummary.codCharge > 0 && (
                                <tr className='table-row'>
                                    <td className='left-side'>COD Charges</td>
                                    <td className='right-side'>₹{formatPrice(updatedSummary.codCharge)}</td>
                                </tr>
                            )}

                            <tr className='table-row border-bottom'>
                                <td></td>
                                <td></td>
                            </tr>

                            <tr className='table-row total-row'>
                                <td className='left-side' style={{ fontWeight: "600", fontSize: "16px" }}>Total</td>
                                <td className='right-side' style={{ fontWeight: "600", fontSize: "16px" }}>₹{formatPrice(updatedSummary.total)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Total Savings Display */}
                    {displayTotalSavings > 0 && (
                        <div className="total-savings">
                            <div className="savings-highlight">
                                <span className="savings-text">
                                    You're saving ₹{formatSavings(displayTotalSavings)} on this order!
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === 'development' && allValuesZero && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '10px' }}>
                            Debug: All values are zero. Check cartSummary prop.
                        </div>
                    )}
                </div>

                <div className="checkout-btn">
                    <button
                        onClick={handleCheckout}
                        disabled={updatedSummary.total <= 0 || shippingLoading || isProcessing}
                        style={{
                            opacity: (updatedSummary.total <= 0 || shippingLoading || isProcessing) ? 0.5 : 1,
                            cursor: (updatedSummary.total <= 0 || shippingLoading || isProcessing) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {isProcessing ? (
                            <>
                                <CircularProgress size={20} color="inherit" />
                                <span>{buttonText}</span>
                            </>
                        ) : shippingLoading ? (
                            'Loading...'
                        ) : (
                            buttonText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;