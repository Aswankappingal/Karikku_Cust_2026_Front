// CancelOrder.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './CancelOrder.scss';
import Navbar from '../../common/Navbar/Navbar';
import Footer from '../../common/Footer/Footer';
import baseUrl from '../../../baseUrl';
import { useOrders } from '../../../store/hook/useOrder';
import ScrollToTopOnMount from '../../common/ScrollToTopOnMount';

const CancelOrder = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { refreshOrders } = useOrders();

    const [selectedReason, setSelectedReason] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [feedback, setFeedback] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [policyConsent, setPolicyConsent] = useState(false);

    const reasonCategories = [
        { id: 'changed-mind', label: 'I changed my mind', category: 'customer_preference' },
        { id: 'found-better-price', label: 'I found a better price elsewhere', category: 'price_concern' },
        { id: 'delivery-too-long', label: 'Delivery is taking too long', category: 'delivery_issue' },
        { id: 'ordered-by-mistake', label: 'I ordered by mistake', category: 'mistake' },
    ];

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch(`${baseUrl}/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched order data:', data);
                const orderInfo = data.data || data.order || data;
                setOrderData(orderInfo);
            } else {
                console.error('Failed to fetch order details:', response.status);
                toast.error('Failed to load order details');
                navigate('/order-details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Error loading order details');
            navigate('/order-details');
        } finally {
            setLoading(false);
        }
    };

    const handleReasonChange = (reasonId) => {
        setSelectedReason(reasonId);
        const selectedCategory = reasonCategories.find(r => r.id === reasonId);
        setCategoryName(selectedCategory?.category || '');
    };

    // Check if order needs admin approval for cancellation
    const needsAdminApproval = () => {
        const status = safeGet(orderData, 'status', 'orderStage');
        const paymentMethod = getPaymentMethod().toLowerCase();

        // Status 0 (placed) + COD = direct cancellation (no admin approval needed)
        if (status === 0 && paymentMethod === 'cod') {
            return false;
        }

        // Status 1 (in transit) + any payment method = needs admin approval
        // Status 0 (placed) + prepaid = needs admin approval
        if (status === 1 || (status === 0 && paymentMethod !== 'cod')) {
            return true;
        }

        return false;
    };

    const handleSubmit = async () => {
        if (!selectedReason || !categoryName || !policyConsent) {
            toast.warn('Please select a reason and accept the policy terms');
            return;
        }

        if (feedback && feedback.length > 500) {
            toast.warn('Feedback is too long. Please keep it under 500 characters.');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('authToken');

            const requestBody = {
                reason: selectedReason,
                categoryName: categoryName,
                feedback: feedback.trim() || undefined
            };

            console.log('Sending cancellation request:', requestBody);

            // Determine the endpoint based on whether admin approval is needed
            const endpoint = needsAdminApproval()
                ? `${baseUrl}/request-cancel-order/${orderId}`
                : `${baseUrl}/cancel-order/${orderId}`;

            console.log('Using endpoint:', endpoint);
            console.log('Needs admin approval:', needsAdminApproval());

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            console.log('Cancellation response:', result);

            if (response.ok && result.success) {
                if (needsAdminApproval()) {
                    // Show success message for cancellation request
                    toast.success(`Cancellation request submitted successfully!\n\nOrder: ${getOrderId()}\nStatus: Pending Admin Approval\n\nYour cancellation request has been sent to our team for review.`);
                } else {
                    // Show success message for direct cancellation
                    const cancelledOrder = result.data;
                    toast.success(`Order cancelled successfully!\n\nOrder: ${cancelledOrder.orderNumber || cancelledOrder.orderId}\nRefund Status: ${cancelledOrder.cancellation?.refundStatus || 'N/A (COD Order)'}`);
                }

                // Refresh orders list to show updated status
                await refreshOrders();
                navigate('/order-details');
            } else {
                // Enhanced error handling
                let errorMessage = result.message || 'Failed to process cancellation request';

                if (result.message?.includes('already cancelled')) {
                    errorMessage = 'This order has already been cancelled.';
                } else if (result.message?.includes('cannot be cancelled')) {
                    errorMessage = 'This order cannot be cancelled at this stage.';
                } else if (result.message?.includes('not found')) {
                    errorMessage = 'Order not found. It may have already been processed.';
                } else if (result.message?.includes('already requested')) {
                    errorMessage = 'A cancellation request has already been submitted for this order.';
                }

                toast.error(errorMessage);
                console.error('Cancellation failed:', result);
            }
        } catch (error) {
            console.error('Error processing cancellation:', error);
            toast.error('An error occurred while processing the cancellation request. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeepOrder = () => {
        navigate('/order-details');
    };

    const safeGet = (obj, ...paths) => {
        for (const path of paths) {
            const keys = path.split('.');
            let current = obj;
            let found = true;

            for (const key of keys) {
                if (current && current.hasOwnProperty(key)) {
                    current = current[key];
                } else {
                    found = false;
                    break;
                }
            }

            if (found && current !== null && current !== undefined) {
                return current;
            }
        }
        return null;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';

        try {
            if (timestamp._seconds) {
                return new Date(timestamp._seconds * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        } catch (error) {
            console.error('Error formatting date:', error);
        }

        return 'N/A';
    };

    const getOrderStageDisplay = (status) => {
        if (typeof status === 'number') {
            const statusMap = {
                0: 'Placed',
                1: 'In Transit',
                2: 'Delivered',
                3: 'Cancelled'
            };
            return statusMap[status] || 'Processing';
        }

        if (typeof status === 'string') {
            return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        }

        return 'Processing';
    };

    const getOrderId = () => {
        return safeGet(orderData, 'orderNumber', 'orderId', 'id') || `ORD-${orderId?.slice(-8)}`;
    };

    const getItemsList = () => {
        const items = safeGet(orderData, 'items');

        if (!items || !Array.isArray(items) || items.length === 0) {
            return 'No items found';
        }

        return items.map(item => {
            return safeGet(item, 'name', 'productDetails.name', 'title', 'productName') || 'Product';
        }).join(', ');
    };

    const getOrderTotal = () => {
        const total = safeGet(orderData,
            'pricing.finalTotal',
            'pricing.total',
            'payment.amount',
            'totalAmount',
            'grandTotal',
            'total'
        );

        if (total && typeof total === 'number') {
            return total.toFixed(2);
        }

        return '0.00';
    };

    const getPaymentMethod = () => {
        return safeGet(orderData, 'payment.paymentMethod', 'paymentMethod') || 'unknown';
    };




    const getCreatedDate = () => {
        return safeGet(orderData, 'createdAt', 'orderDate', 'created', 'placedAt');
    };

    const canCancelOrder = () => {
        const status = safeGet(orderData, 'status', 'orderStage');
        const isCancelled = safeGet(orderData, 'isCancelledbyCustomer') === true;

        if (typeof status === 'number') {
            return !isCancelled && [0, 1].includes(status); // Allow status 0 and 1
        }

        return !isCancelled && status !== 'delivered' && status !== 'cancelled';
    };

    useEffect(() => {
        console.log("Order data received:", orderData);
        if (orderData) {
            console.log("Mapped values:", {
                orderId: getOrderId(),
                items: getItemsList(),
                total: getOrderTotal(),
                status: getOrderStageDisplay(safeGet(orderData, 'status', 'orderStage')),
                createdAt: formatDate(getCreatedDate()),
                paymentMethod: getPaymentMethod(),
                canCancel: canCancelOrder(),
                needsAdminApproval: needsAdminApproval()
            });
        }
    }, [orderData]);

    if (loading) {
        return (
            <div className="cancel-main-main-wrapper">
                <Navbar />
                <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
                    Loading order details...
                </div>
                <Footer />
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="cancel-main-main-wrapper">
                <Navbar />
                <div className="error" style={{ textAlign: 'center', padding: '50px' }}>
                    <h3>Order not found</h3>
                    <button onClick={() => navigate('/order-details')}>
                        Back to Orders
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (!canCancelOrder()) {
        return (
            <div className="cancel-main-main-wrapper">

                
                <Navbar />

                 <ScrollToTopOnMount />
                <div className="error" style={{ textAlign: 'center', padding: '50px' }}>
                    <h3>Order Cannot Be Cancelled</h3>
                    <p>This order has already been cancelled or is at a stage where cancellation is not possible.</p>
                    <button onClick={() => navigate('/order-details')}>
                        Back to Orders
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="cancel-main-main-wrapper">
            <Navbar />
            <ScrollToTopOnMount />

            <div className="cancel-header-for-only">
                <h3>Cancel Order</h3>
            </div>

            <div className='cancel-main-wrapper'>
                <div className='cancel-container'>
                    <div className='cancel-header'>
                        <h2 className='Order-3012'>
                            {getOrderId()}
                            <span className='Order-Id'>   Order Id</span>
                        </h2>
                        <div className='order-info'>
                            <div className='order-status'>
                                <span className='Order-getting'>
                                    <span className='Exclammation-mark'> ! </span>
                                    {needsAdminApproval()
                                        ? `You're about to request cancellation for order ${getOrderId()}. This will require admin approval.`
                                        : `You're about to cancel order ${getOrderId()}. This action cannot be undone`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='cancel-content'>
                        <div className='order-availability'>
                            <div className="order-flexer">
                                <div className="order-summaary">
                                    <h3>ORDER SUMMARY</h3>
                                </div>
                                <div className='Processinggg'>
                                    <span className='availability-status processing'>
                                        {getOrderStageDisplay(safeGet(orderData, 'status', 'orderStage'))}
                                    </span>
                                </div>
                            </div>
                            <div className='availability-item'>
                                <p className='item-name'>Items :</p>
                                <div className='Tshirts-and-caps'>
                                    <p className='Tshirts-sub'>
                                        {getItemsList()}
                                    </p>

                                    <p>
                                        <span className='order-font'>Ordered on : </span>
                                        {formatDate(getCreatedDate())}
                                    </p>

                                    <p>
                                        <span className='order-font'>Payment Method : </span>
                                        {getPaymentMethod().toUpperCase()}
                                    </p>

                                    <div className='total-section'>
                                        <h6 className='totalll'>
                                            Total : <span className='price'>
                                                ₹  {getOrderTotal()}
                                            </span>
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='reason-section'>
                            <h3>Reason for cancellation <span style={{ color: 'red' }}>*</span></h3>
                            <div className='reason-options'>
                                <div className='reason-list'>
                                    {reasonCategories.map((reason) => (
                                        <label key={reason.id} className="reason-item-wrapper">
                                            <input
                                                type="radio"
                                                name="cancellation-reason"
                                                value={reason.id}
                                                checked={selectedReason === reason.id}
                                                onChange={() => handleReasonChange(reason.id)}
                                            />
                                            <span className="reason-item">• {reason.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='reason-section'>
                            <h3>Share your feedback <span style={{ fontSize: '14px', color: '#666' }}>(Optional)</span></h3>
                            <div className='additional-text'>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Help us improve by sharing your experience or specific concerns (max 500 characters)"
                                    rows="4"
                                    maxLength="500"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        outline: 'none'
                                    }}
                                />
                                <div style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    textAlign: 'right',
                                    marginTop: '4px'
                                }}>
                                    {feedback.length}/500 characters
                                </div>
                            </div>
                        </div>

                        <div className='reason-options'>
                            <h4>What happens Next?</h4>
                            <div className='next-steps'>
                                {needsAdminApproval() ? (
                                    <>
                                        <p>• Your cancellation request will be sent to our team for review</p>
                                        <p>• You will receive an update within 24-48 hours via email</p>
                                        <p>• If approved, {getPaymentMethod() === 'cod'
                                            ? 'your order will be cancelled (no refund needed for COD)'
                                            : 'refund will be processed within 5-7 business days'}</p>
                                        <p>• Your feedback will help us improve our service</p>
                                    </>
                                ) : (
                                    <>
                                        <p>• Your order will be cancelled immediately</p>
                                        <p>• No refund needed for COD orders</p>
                                        <p>• You will receive a confirmation email</p>
                                        <p>• Your feedback will help us improve our service</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className='policy-notice'>
                            <h4>Confirmation <span style={{ color: 'red' }}>*</span></h4>
                            <label className='policy-label'>
                                <input
                                    type='checkbox'
                                    checked={policyConsent}
                                    onChange={(e) => setPolicyConsent(e.target.checked)}
                                />
                                <span className='understand-text'>
                                    {needsAdminApproval()
                                        ? 'I understand this is a cancellation request that requires admin approval and I want to proceed'
                                        : 'I understand this action cannot be undone and I want to proceed with the cancellation'
                                    }
                                </span>
                            </label>
                        </div>

                        <div className='action-buttons'>
                            <button
                                className='cancel-order-btn'
                                onClick={handleSubmit}
                                disabled={!selectedReason || !policyConsent || submitting}
                                style={{
                                    opacity: (!selectedReason || !policyConsent || submitting) ? 0.6 : 1,
                                    cursor: (!selectedReason || !policyConsent || submitting) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {submitting
                                    ? (needsAdminApproval() ? 'Submitting Request...' : 'Cancelling...')
                                    : (needsAdminApproval() ? 'Submit Cancellation Request' : 'Confirm Cancellation')
                                }
                            </button>

                            <button
                                className='keep-order-btn'
                                onClick={handleKeepOrder}
                                disabled={submitting}
                            >
                                Keep Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CancelOrder;