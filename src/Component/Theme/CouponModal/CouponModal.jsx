import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './CouponModal.scss';
import { IoMdClose } from 'react-icons/io';
import baseUrl from '../../../baseUrl';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

Modal.setAppElement('#root');

// ✅ FIXED: Added cartSummary parameter correctly
function CustomModal({
    isOpen,
    onRequestClose,
    title = "Apply Coupon",
    productId = null,
    productType = null,
    onCouponApply,
    cartSummary = null
}) {
    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verificationMessage, setVerificationMessage] = useState('');
    const [totalCoupons, setTotalCoupons] = useState(0);

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Fetch available coupons when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCoupons();
        }
    }, [isOpen, productId, productType]);

    const fetchCoupons = async () => {
        setLoading(true);
        setError('');

        try {
            let url = `${baseUrl}/coupons`;
            const params = new URLSearchParams();

            if (productId) params.append('productId', productId);
            if (productType) params.append('productType', productType);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setCoupons(data.coupons);
                setTotalCoupons(data.totalCoupons);
            } else {
                setError(data.message || 'Failed to fetch coupons');
                setCoupons([]);
            }
        } catch (err) {
            console.error('Error fetching coupons:', err);
            setError('Failed to load coupons. Please try again.');
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    };

    const verifyCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        setLoading(true);
        setError('');
        setVerificationMessage('');

        try {
            let url = `${baseUrl}/coupons/verify/${couponCode.toUpperCase()}`;
            const params = new URLSearchParams();

            if (productId) {
                if (Array.isArray(productId)) {
                    params.append('productIds', productId.join(','));
                } else if (typeof productId === 'string' && productId.includes(',')) {
                    params.append('productIds', productId);
                } else {
                    params.append('productId', productId);
                }
            }
            if (productType) params.append('productType', productType);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setVerificationMessage('✓ Coupon is valid!');
                setSelectedCoupon(data.coupon);
                setError('');
            } else {
                setError(data.message || 'Invalid coupon code');
                setVerificationMessage('');
                setSelectedCoupon(null);
            }
        } catch (err) {
            console.error('Error verifying coupon:', err);
            setError('Failed to verify coupon. Please try again.');
            setVerificationMessage('');
            setSelectedCoupon(null);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (selectedCoupon && onCouponApply) {
            onCouponApply(selectedCoupon);
            onRequestClose();
        } else {
            setError('Please select or verify a coupon first');
        }
    };

    const handleCouponSelect = (coupon) => {
        setSelectedCoupon(coupon);
        setCouponCode(coupon.code);
        setError('');
        setVerificationMessage('');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No expiry';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ✅ UPDATED: Calculate savings based on cartSummary
    const calculateSavings = (coupon) => {
        if (!coupon) return 0;
        
        // Get subtotal from cartSummary if available
        let subtotal = cartSummary?.subtotal || 0;

        // If coupon is restricted to specific products, only calculate discount on those items
        if (coupon.productType === 'SPECIFIC' && cartSummary?.items) {
            const allowedIds = coupon.productIds || (coupon.productId ? [coupon.productId] : []) || (coupon.productID ? [coupon.productID] : []);
            const applicableItems = cartSummary.items.filter(item => {
                const id = item.productId || item.id;
                return allowedIds.includes(id) || allowedIds.includes(String(id));
            });
            
            // Calculate subtotal of ONLY applicable items (using base price for consistency with pricing utility)
            // But for a simple estimate in the UI, we can use their selling price
            subtotal = applicableItems.reduce((sum, item) => {
                const price = item.variantCombination?.price || item.currentPrice || item.price || 0;
                return sum + (price * (item.quantity || 1));
            }, 0);
        }

        if (coupon.discountType === 'PERCENTAGE') {
            const discount = (subtotal * coupon.discountValue) / 100;
            // Apply max discount if specified
            if (coupon.maxDiscountValue && discount > coupon.maxDiscountValue) {
                return coupon.maxDiscountValue;
            }
            return discount;
        } else if (coupon.discountType === 'FIXED' || coupon.discountType === 'FLAT') {
            return Math.min(coupon.discountValue, subtotal);
        }
        return 0;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            contentLabel="Coupon Modal"
        >
            <div className="head">
                <h2>{title}</h2>
                <IoMdClose onClick={onRequestClose} style={{ cursor: 'pointer' }} />
            </div>

            <div className="input">
                <input
                    type="text"
                    placeholder='Enter coupon code'
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && verifyCoupon()}
                />
                <p onClick={verifyCoupon} style={{ cursor: 'pointer' }}>
                    {loading ? 'Checking...' : 'Check'}
                </p>
            </div>

            {error && (
                <div style={{ color: 'red', padding: '10px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            {verificationMessage && (
                <div style={{ color: 'green', padding: '10px', fontSize: '14px' }}>
                    {verificationMessage}
                </div>
            )}

            <div className="unlock-coupon">
                <h4>Available Coupons ({totalCoupons})</h4>

                {loading && <p>Loading coupons...</p>}

                {!loading && coupons.length === 0 && (
                    <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No coupons available for this product
                    </p>
                )}

                {!loading && coupons.map((coupon) => (
                    <div
                        key={coupon.id}
                        className="content"
                        style={{
                            border: selectedCoupon?.id === coupon.id ? '2px solid #D86B22' : '1px solid #ddd',
                            padding: '10px',
                            marginBottom: '10px',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleCouponSelect(coupon)}
                    >
                        <input
                            type="radio"
                            checked={selectedCoupon?.id === coupon.id}
                            onChange={() => handleCouponSelect(coupon)}
                        />
                        <div className="labels">
                            <h4>{coupon.code}</h4>
                            <p style={{ color: "#D86B22" }}>
                                {coupon.discountType === 'PERCENTAGE'
                                    ? `${coupon.discountValue}% off`
                                    : `Save ₹${coupon.discountValue}`}
                            </p>
                            
                            {/* ✅ NEW: Show how much user will save */}
                            {cartSummary && cartSummary.subtotal > 0 && (
                                <p style={{ 
                                    fontSize: '13px', 
                                    color: '#28a745', 
                                    fontWeight: 'bold',
                                    margin: '5px 0'
                                }}>
                                    💰 You'll save: ₹{calculateSavings(coupon).toFixed(2)}
                                </p>
                            )}
                            
                            <p style={{ paddingTop: "0" }}>
                                {coupon.description || `${coupon.discountValue}${coupon.discountType === 'PERCENTAGE' ? '%' : 'Rs'} off`}
                                {coupon.minimumPurchase && ` | Min. purchase: ₹${coupon.minimumPurchase}`}
                                <br />
                                Expires on: {formatDate(coupon.validUntil)}
                            </p>
                            {coupon.usageLimit && (
                                <p style={{ fontSize: '12px', color: '#888' }}>
                                    Used {coupon.usageCount || 0} of {coupon.usageLimit} times
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="checkout-btn">
                <button
                    onClick={handleApply}
                    disabled={!selectedCoupon || loading}
                    style={{
                        opacity: !selectedCoupon || loading ? 0.5 : 1,
                        cursor: !selectedCoupon || loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Apply Coupon
                </button>
            </div>
        </Modal>
    );
}

export default CustomModal;