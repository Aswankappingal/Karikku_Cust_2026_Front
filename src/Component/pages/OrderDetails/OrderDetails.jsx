import React, { useEffect, useState } from 'react'
import './OrderDetails.scss'
import Navbar from '../../common/Navbar/Navbar'
import { CiSearch } from 'react-icons/ci'
import { IoBag } from "react-icons/io5";
import { Download } from 'lucide-react';
import { useOrders } from '../../../store/hook/useOrder';
import { generateInvoice } from '../../../utils/generateInvoice';

// MUI Stepper imports
import { Stepper, Step, StepLabel, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';



// Custom styled components for the stepper
const CustomStepper = styled(Stepper)(({ theme }) => ({
    padding: '16px 0px',
    '& .MuiStepConnector-root': {
        top: 10,
        left: 'calc(-50% + 10px)',
        right: 'calc(50% + 10px)',
    },
    '& .MuiStepConnector-line': {
        height: 2,
        border: 0,
        backgroundColor: '#e0e0e0',
        borderRadius: 1,
    },
    '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
        backgroundColor: '#4caf50',
    },
    '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
        backgroundColor: '#4caf50',
    },
}));

const CustomStepIcon = styled('div')(({ theme, ownerState }) => ({
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: ownerState.completed ? '#4caf50' : ownerState.active ? '#4caf50' : '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: ownerState.completed || ownerState.active ? 'white' : '#666',
    fontSize: '12px',
    fontWeight: 'bold',
}));

const OrderDetails = () => {
    const {
        orders,
        loading,
        refreshing,
        error,
        isEmpty,
        isDataStale,
        refreshOrders,
        updateFilters,
        filters,
        clearError
    } = useOrders();



    useEffect(() => {
        refreshOrders();
    }, [refreshOrders])

    const ORDER_STATUS_MAP = {
        0: 'Placed',
        1: 'In transit',
        2: 'Delivered',
        3: 'Cancelled'
    };

    const safeString = (value) => {
        return value ? String(value) : '';
    };

    const safeFormatPrice = (value) => {
        if (value === null || value === undefined) return '0.00';
        const num = parseFloat(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const getDisplayStatus = (status) => {
        if (typeof status === 'number') {
            return ORDER_STATUS_MAP[status] || 'Unknown';
        }

        const statusStr = safeString(status).toLowerCase();
        const mappedEntry = Object.entries(ORDER_STATUS_MAP).find(
            ([key, value]) => value.toLowerCase() === statusStr
        );

        if (mappedEntry) {
            return mappedEntry[1];
        }

        switch (statusStr) {
            case 'processing':
            case 'pending':
                return ORDER_STATUS_MAP[0];
            case 'shipped':
            case 'in transit':
                return ORDER_STATUS_MAP[1];
            case 'delivered':
                return ORDER_STATUS_MAP[2];
            case 'cancelled':
            case 'canceled':
                return ORDER_STATUS_MAP[3];
            default:
                return ORDER_STATUS_MAP[0];
        }
    };

    const getNumericStatus = (status) => {
        if (typeof status === 'number') {
            return status;
        }

        const statusStr = safeString(status).toLowerCase();

        switch (statusStr) {
            case 'placed':
            case 'processing':
            case 'pending':
                return 0;
            case 'in transit':
            case 'shipped':
                return 1;
            case 'delivered':
                return 2;
            case 'cancelled':
            case 'canceled':
                return 3;
            default:
                return 0;
        }
    };

    const convertTimestampToDate = (timestamp) => {
        if (!timestamp) return null;

        if (timestamp._seconds && timestamp._nanoseconds !== undefined) {
            return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
        }

        if (timestamp instanceof Date) {
            return timestamp;
        }

        if (typeof timestamp === 'string' || typeof timestamp === 'number') {
            const date = new Date(timestamp);
            return isNaN(date.getTime()) ? null : date;
        }

        return null;
    };

    const formatVariant = (item) => {
        const variantData = item?.variant || item?.variants || item?.options || item?.selectedVariants || item?.variantCombination;
        if (!variantData) return null;

        if (typeof variantData === 'string') return variantData;

        // If it's an object, format it
        if (typeof variantData === 'object') {
            if (variantData.variantName || variantData.name) {
                return variantData.variantName || variantData.name;
            }
            if (variantData.variants && typeof variantData.variants === 'object') {
                return Object.entries(variantData.variants)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
            }
            return Object.entries(variantData)
                .filter(([key]) => !['variantId', 'id', 'sku', 'price', 'quantity', 'image', 'primaryImage'].includes(key))
                .map(([key, value]) => {
                    if (typeof value === 'object') return null;
                    return `${key}: ${value}`;
                })
                .filter(Boolean)
                .join(', ');
        }
        return null;
    };

    const formatDate = (timestamp) => {
        const date = convertTimestampToDate(timestamp);
        if (!date) return 'N/A';

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStepsAndActiveStep = (status) => {
        const numericStatus = getNumericStatus(status);

        if (numericStatus === 3) {
            return {
                steps: ['Placed', 'Cancelled'],
                activeStep: 1
            };
        }

        const steps = ['Placed', 'In transit', 'Delivered'];
        return {
            steps,
            activeStep: Math.min(numericStatus, 2)
        };
    };

    const getStatusColorClass = (status) => {
        const numericStatus = getNumericStatus(status);

        switch (numericStatus) {
            case 0: return 'status-processing';
            case 1: return 'status-transit';
            case 2: return 'status-delivered';
            case 3: return 'status-cancelled';
            default: return 'status-processing';
        }
    };





    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    const toggleOrderDetails = (orderId) => {
        const newExpandedOrders = new Set(expandedOrders);
        if (newExpandedOrders.has(orderId)) {
            newExpandedOrders.delete(orderId);
        } else {
            newExpandedOrders.add(orderId);
        }
        setExpandedOrders(newExpandedOrders);
    };

    const filteredOrders = orders.filter(order => {
        if (!searchText) return true;

        const searchLower = searchText.toLowerCase();
        const displayStatus = getDisplayStatus(order.status).toLowerCase();

        return (
            safeString(order.id).toLowerCase().includes(searchLower) ||
            safeString(order.orderId).toLowerCase().includes(searchLower) ||
            safeString(order.orderNumber).toLowerCase().includes(searchLower) ||
            displayStatus.includes(searchLower) ||
            order.items?.some(item =>
                safeString(item.productDetails?.name).toLowerCase().includes(searchLower) ||
                safeString(item.productDetails?.description).toLowerCase().includes(searchLower) ||
                safeString(item.name).toLowerCase().includes(searchLower)
            )
        );
    });

    useEffect(() => {
        console.log(filteredOrders, 'filter');
        console.log(orders, 'orders');
    }, [filteredOrders, orders])

    const handleFilterChange = (value) => {
        if (value === 'all') {
            updateFilters({ status: 'all' });
        } else if (value === 'lowToHigh') {
            updateFilters({ sortBy: 'amount_low' });
        } else if (value === 'highToLow') {
            updateFilters({ sortBy: 'amount_high' });
        }
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const navigate = useNavigate();

    const handleCancelClick = (orderId) => {
        console.log('Navigating to cancel order with ID:', orderId);
        navigate(`/cancel-order/${orderId}`);
    };

    const handleSupportClick = (order) => {
        navigate("/Contact-support", {
            state: {
                orderDetails: order
            }
        });
    };

    if (loading && orders.length === 0) {
        return <div><LinearProgress color="success" /></div>
    }

    if (error && orders.length === 0) {
        return (
            <div className='Order-complete-main-wrapper'>
                <Navbar />
                <div className="order-contents">
                    <div className="error-state" style={{ textAlign: 'center', padding: '50px' }}>
                        <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
                        <button onClick={clearError} style={{ marginRight: '10px' }}>Clear Error</button>
                        <button onClick={refreshOrders}>Try Again</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='Order-complete-main-wrapper'>
            <Navbar />

            <div className="order-contents">
                <div className="Head-n-filter">
                    <div className="head-my-order">
                        <h3>
                            My order {!loading && `(${filteredOrders.length})`}
                            {isDataStale && (
                                <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                                    - Data may be outdated
                                </span>
                            )}
                            {refreshing && (
                                <span style={{ fontSize: '12px', color: '#007bff', marginLeft: '10px' }}>
                                    - Refreshing...
                                </span>
                            )}
                        </h3>
                    </div>
                    <div className="filter-order">
                        <div className="search-order">
                            {isSearching ? (
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search your orders..."
                                    value={searchText}
                                    onChange={handleSearch}
                                    onBlur={() => {
                                        if (!searchText) setIsSearching(false);
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <div className="search-placeholder" onClick={() => setIsSearching(true)}>
                                    Search Orders <CiSearch className="icons-search" />
                                </div>
                            )}
                        </div>

                        <div className="filters-section-orders">
                            <span>Filters:</span>
                            <select
                                id="sortDropdown"
                                className="sort-dropdown"
                                value={filters.status === 'all' ? 'all' : filters.sortBy || 'all'}
                                onChange={(e) => handleFilterChange(e.target.value)}
                            >
                                <option value="all">All orders</option>
                                <option value="lowToHigh">Price Low to High</option>
                                <option value="highToLow">Price High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && orders.length > 0 && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        padding: '10px',
                        marginBottom: '20px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>{error}</span>
                        <button onClick={clearError} style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #721c24',
                            color: '#721c24',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}>
                            ×
                        </button>
                    </div>
                )}



                <div className="main-content-order">
                    <div className="orders-list">
                        {filteredOrders.map((order) => {
                            const { steps, activeStep } = getStepsAndActiveStep(order.status);
                            const numericStatus = getNumericStatus(order.status);


                            return (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-info">
                                            <div className="order-details">
                                                <p className="order-id">Order ID #{order.orderId?.slice(-8) || order.orderNumber?.slice(-8) || order.id?.slice(-8)}</p>
                                                <p className="order-date">
                                                    <span className='ordered-date'>
                                                        Ordered on: <span className='date'>
                                                            {formatDate(order.createdAt)}
                                                        </span>
                                                    </span>

                                                    <span className='grand-total'>
                                                        Total: <span className='total'>
                                                            ₹ {safeFormatPrice(
                                                                order.pricing?.finalTotal ||
                                                                order.pricing?.total ||
                                                                order.payment?.amount
                                                            )}
                                                        </span>
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="order-status-wrapper">
                                            {getNumericStatus(order.status) === 1 && order.shippingDetails?.trackingUrl && (
                                                <a
                                                    href={order.shippingDetails.trackingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="tracking-link"
                                                >
                                                    Tracking Link
                                                </a>
                                            )}

                                            {getNumericStatus(order.status) === 1 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        generateInvoice(order);
                                                    }}
                                                    className="invoice-btn"
                                                    title="Download Invoice"
                                                >
                                                    <Download size={15} /> Invoice
                                                </button>
                                            )}

                                            <span className={`status-badge ${getStatusColorClass(order.status)}`}>
                                                {getDisplayStatus(order.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="stepper-section">
                                        <CustomStepper activeStep={activeStep} alternativeLabel>
                                            {steps.map((label, index) => (
                                                <Step key={label} completed={index < activeStep}>
                                                    <StepLabel
                                                        StepIconComponent={({ active, completed }) => (
                                                            <CustomStepIcon ownerState={{ active, completed }}>
                                                                {completed ? '✓' : index + 1}
                                                            </CustomStepIcon>
                                                        )}
                                                        sx={{
                                                            '& .MuiStepLabel-label': {
                                                                fontSize: '12px',
                                                                marginTop: '8px',
                                                                color: index <= activeStep ? '#333' : '#666'
                                                            }
                                                        }}
                                                    >
                                                        {label}
                                                    </StepLabel>
                                                </Step>
                                            ))}
                                        </CustomStepper>
                                    </div>

                                    <div className="order-items">
                                        <div className="order-item">
                                            <div className="item-image">
                                                <IoBag className="placeholder-icon" />
                                            </div>

                                            <div className="item-details">
                                                <h4 className="item-name">Items:</h4>
                                                <p className="item-description">
                                                    {order.items && order.items.length > 0
                                                        ? order.items.map(item => {
                                                            const baseName = item?.name || item?.productDetails?.name || 'Product';
                                                            const variantStr = formatVariant(item);
                                                            return variantStr ? `${baseName} (${variantStr})` : baseName;
                                                        }).join(', ')
                                                        : 'No items found'
                                                    }
                                                    {order.items && order.items.length > 1 && ` (${order.items.length} items)`}
                                                </p>
                                            </div>

                                            <div className="item-price">
                                                <p
                                                    className="price-link"
                                                    onClick={() => toggleOrderDetails(order.id)}
                                                >
                                                    {expandedOrders.has(order.id) ? 'Hide details' : 'View detail'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedOrders.has(order.id) && (
                                        <>
                                            <div className="delivery-detail-main">
                                                <p className="delivery-title">Summary</p>
                                                <div className="delivery-details">
                                                    <div className="delivery-grid">
                                                        <div className="delivery-info">
                                                            <p className="delivery-date">
                                                                <span className='delivery-tax'>Subtotal: ₹</span>
                                                                {safeFormatPrice(
                                                                    order.pricing?.subtotal ||
                                                                    ((order.payment?.amount || 0) - (order.pricing?.deliveryCharge || 0) - (order.pricing?.tax || 0))
                                                                )}
                                                            </p>

                                                            <p className="delivery-by">
                                                                <span className='delivery-tax'>Delivery: ₹</span>
                                                                {safeFormatPrice(
                                                                    order.pricing?.deliveryCharge ||
                                                                    order.delivery?.charges
                                                                )}
                                                            </p>

                                                            <p className="delivery-by">
                                                                <span className='delivery-tax'>Tax: ₹</span>
                                                                {safeFormatPrice(
                                                                    order.pricing?.tax ||
                                                                    order.pricing?.gst
                                                                )}
                                                            </p>

                                                            {parseFloat(order.pricing?.codCharge || 0) > 0 && (
                                                                <p className="delivery-by">
                                                                    <span className='delivery-tax'>COD Charge: ₹</span>
                                                                    {safeFormatPrice(order.pricing.codCharge)}
                                                                </p>
                                                            )}

                                                            {(parseFloat(order.pricing?.discountAmount || 0) > 0 || parseFloat(order.discountAmount || 0) > 0) && (
                                                                <p className="delivery-by">
                                                                    <span className='delivery-tax'>
                                                                        Coupon Savings {(order.couponCode || order.coupon) ? `(${order.couponCode || order.coupon})` : ''}: -₹
                                                                    </span>
                                                                    {safeFormatPrice(
                                                                        order.pricing?.discountAmount ||
                                                                        order.discountAmount
                                                                    )}
                                                                </p>
                                                            )}

                                                            {parseFloat(order.pricing?.coinSavings || 0) > 0 && (
                                                                <p className="delivery-by" style={{ color: '#3DAE4A' }}>
                                                                    <span className='delivery-tax' style={{ color: '#3DAE4A' }}>
                                                                        Coin Savings: -₹
                                                                    </span>
                                                                    {safeFormatPrice(order.pricing.coinSavings)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="delivery-detail-main">
                                                <p className="delivery-title">Items Details</p>
                                                <div className="delivery-details">
                                                    <div className="delivery-grid">
                                                        <div className="delivery-info">
                                                            {order.items && order.items.length > 0 ? (
                                                                order.items.map((item, index) => (
                                                                    <div key={index} style={{ marginBottom: '10px' }}>
                                                                        <p>
                                                                            <strong>{item?.name || item?.productDetails?.name || 'Product'}</strong>
                                                                            {formatVariant(item) && (
                                                                                <span style={{ fontSize: '13px', color: '#666', marginLeft: '5px' }}>
                                                                                    ({formatVariant(item)})
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                        <p style={{ fontSize: '14px', color: '#666' }}>
                                                                            Quantity: {item.quantity || 1} × ₹{safeFormatPrice(item.price || item.productDetails?.price || 0)}
                                                                        </p>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p>No items available</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="delivery-detail-main">
                                                <p className="delivery-title">Delivery Address</p>
                                                <div className="delivery-details">
                                                    <div className="delivery-grid">
                                                        <div className="delivery-info">
                                                            <p><strong>{order.deliveryAddress?.fullName || 'N/A'}</strong></p>
                                                            <p>{order.deliveryAddress?.addressLine1 || ''}</p>
                                                            {order.deliveryAddress?.addressLine2 && (
                                                                <p>{order.deliveryAddress.addressLine2}</p>
                                                            )}
                                                            <p>
                                                                {order.deliveryAddress?.city || ''}, {order.deliveryAddress?.state || ''} - {order.deliveryAddress?.pincode || ''}
                                                            </p>
                                                            <p>Phone: {order.deliveryAddress?.phone || 'N/A'}</p>
                                                            {order.deliveryAddress?.email && (
                                                                <p>Email: {order.deliveryAddress.email}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="delivery-detail-main">
                                                <p className="delivery-title">Payment Information</p>
                                                <div className="delivery-details">
                                                    <div className="delivery-grid">
                                                        <div className="delivery-info">
                                                            <p>
                                                                <span className='delivery-tax'>Payment Method: </span>
                                                                {order.payment?.paymentMethod || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <span className='delivery-tax'>Payment Status: </span>
                                                                {(order.payment?.paymentMethod?.toLowerCase() === 'prepaid' || order.payment?.paymentMethod?.toLowerCase() === 'online') ? 'Successful' : (order.payment?.status || 'N/A')}
                                                            </p>
                                                            {order.payment?.transactionId && (
                                                                <p>
                                                                    <span className='delivery-tax'>Transaction ID: </span>
                                                                    {order.payment.transactionId}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="order-actions" style={{
                                                marginTop: '20px',
                                                display: 'flex',
                                                gap: '10px',
                                                justifyContent: 'flex-end'
                                            }}>
                                                {numericStatus !== 3 && (
                                                    <button
                                                        onClick={() => generateInvoice(order)}
                                                        style={{
                                                            padding: '10px 20px',
                                                            backgroundColor: 'white',
                                                            color: 'green',
                                                            border: '1px solid #065f46',
                                                            borderRadius: '100px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            borderBlockColor: 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}
                                                    >
                                                        Download Invoice <Download size={16} />
                                                    </button>
                                                )}
                                                {numericStatus === 0 && (
                                                    <button
                                                        onClick={() => handleCancelClick(order.orderId || order.id)}
                                                        style={{
                                                            padding: '10px 20px',
                                                            backgroundColor: 'white',
                                                            color: 'green',
                                                            border: '1px solid #065f46',
                                                            borderRadius: '100px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            borderBlockColor: 'none'
                                                        }}
                                                    >
                                                        Cancel Order
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleSupportClick(order)}
                                                    style={{
                                                        padding: '10px 20px',
                                                        backgroundColor: '#3DAE4A',
                                                        color: 'white',
                                                        border: '1px solid #3DAE4A',
                                                        borderRadius: '100px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        borderBlockColor: 'none'
                                                    }}
                                                >
                                                    Contact Support
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {filteredOrders.length === 0 && !loading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '50px',
                            color: '#666'
                        }}>
                            <p style={{ fontSize: '18px', marginBottom: '10px' }}>No orders found</p>
                            <p style={{ fontSize: '14px' }}>
                                {searchText
                                    ? 'Try adjusting your search criteria'
                                    : 'You haven\'t placed any orders yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;