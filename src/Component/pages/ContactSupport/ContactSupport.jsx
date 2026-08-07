import React, { useState, useEffect } from 'react'
import './ContactSupport.scss'
import Navbar from '../../common/Navbar/Navbar'
import PhoneInput from 'react-phone-input-2'
import { useLocation, useParams } from 'react-router-dom'
import { useOrders } from '../../../store/hook/useOrder'
import baseUrl from '../../../baseUrl'
// import { useOrders } from '../../hooks/useOrders'

const ContactSupport = () => {
    const location = useLocation();
    const { orderId } = useParams(); // If orderId is passed via URL params
    const { findOrderById, getOrderDetails } = useOrders();
    
    // Get order details from navigation state or find by ID
    const [orderDetails, setOrderDetails] = useState(location.state?.orderDetails || null);
    const [loading, setLoading] = useState(!orderDetails && orderId);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        issueType: '',
        message: '',
        attachments: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    // Fetch order details if not provided via state
    useEffect(() => {
        if (!orderDetails && orderId) {
            const fetchOrderData = async () => {
                setLoading(true);
                try {
                    // First try to find in cached orders
                    let order = findOrderById(orderId);
                    
                    if (!order) {
                        // If not found in cache, fetch from API
                        const result = await getOrderDetails(orderId);
                        if (result.success) {
                            order = result.order;
                        }
                    }
                    
                    if (order) {
                        setOrderDetails(order);
                    } else {
                        setSubmitStatus({ type: 'error', message: 'Order not found' });
                    }
                } catch (error) {
                    console.error('Error fetching order details:', error);
                    setSubmitStatus({ type: 'error', message: 'Failed to fetch order details' });
                } finally {
                    setLoading(false);
                }
            };

            fetchOrderData();
        }
    }, [orderId, orderDetails, findOrderById, getOrderDetails]);

//    useEffect(()=>{
//     console.log("orderDetails", orderDetails);
    
//    },[orderDetails])
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhoneChange = (phone) => {
        // Truncate to 12 digits
        const truncatedPhone = phone.slice(0, 12);
        setFormData(prev => ({
            ...prev,
            phone: truncatedPhone
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setSubmitStatus({ type: 'error', message: 'Maximum 5 files allowed' });
            return;
        }

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                setSubmitStatus({ type: 'error', message: `${file.name} is not an image file` });
                return false;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                setSubmitStatus({ type: 'error', message: `${file.name} is larger than 10MB` });
                return false;
            }
            return true;
        });

        setFormData(prev => ({
            ...prev,
            attachments: validFiles
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fullName || !formData.phone || !formData.email || !formData.message) {
            setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
            return;
        }

        const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
        if (cleanPhone.length !== 12) {
            setSubmitStatus({ type: 'error', message: 'Phone number must be exactly 12 digits' });
            return;
        }

        if (!orderDetails?.id && !orderDetails?.orderId) {
            setSubmitStatus({ type: 'error', message: 'Order information is missing' });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            const formDataToSend = new FormData();
            
            // Add form fields
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('message', formData.message);
            formDataToSend.append('issueType', formData.issueType || 'General Support');
            
            // Add order ID
            formDataToSend.append('orderId', orderDetails.id || orderDetails.orderId);
            
            // Add attachments
            formData.attachments.forEach((file, index) => {
                formDataToSend.append('attachments', file);
            });

            const token = localStorage.getItem('authToken');
            const response = await fetch(`${baseUrl}/CustomerRefundRequest`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                setSubmitStatus({ 
                    type: 'success', 
                    message: 'Support request submitted successfully! We will contact you soon.' 
                });
                // Reset form
                setFormData({
                    fullName: '',
                    phone: '',
                    email: '',
                    issueType: '',
                    message: '',
                    attachments: []
                });
            } else {
                setSubmitStatus({ 
                    type: 'error', 
                    message: result.error || 'Failed to submit support request' 
                });
            }
        } catch (error) {
            console.error('Error submitting support request:', error);
            setSubmitStatus({ 
                type: 'error', 
                message: 'Network error. Please try again.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatOrderNumber = (order) => {
        return order?.orderNumber || order?.id || 'N/A';
    };

    const formatPrice = (order) => {
        const price = order?.pricing?.finalTotal || order?.pricing?.total || order?.payment?.amount || 0;
        return `₹${price.toFixed(2)}`;
    };

    const formatPaymentMethod = (order) => {
        return order?.payment?.method || order?.paymentMethod || 'Unknown';
    };

    if (loading) {
        return (
            <div className="contact-support-wrapper">
                <Navbar />
                <div className="contact-header">
                    <h3>Contact Support</h3>
                </div>
                <div className="contact-main">
                    <div className="contact-container">
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contact-support-wrapper">
            <Navbar />

            <div className="contact-header">
                <h3>Contact Support</h3>
            </div>

            <div className="contact-main">
                <div className="contact-container">
                    {orderDetails ? (
                        <div className="order-info-card">
                            <p className="order-info">
                                You are contacting us about order <span>{formatOrderNumber(orderDetails)}</span>
                            </p>
                            <div className="order-details-summary">
                                {/* <div className="order-detail">
                                    <strong>Amount:</strong> {formatPrice(orderDetails)}
                                </div> */}
                                {/* <div className="order-detail">
                                    <strong>Payment Method:</strong> {formatPaymentMethod(orderDetails)}
                                </div> */}
                                {/* <div className="order-detail">
                                    <strong>Order Date:</strong> {new Date(orderDetails.createdAt).toLocaleDateString()}
                                </div> */}
                                {/* <div className="order-detail">
                                    <strong>Status:</strong> {orderDetails.status || 'N/A'}
                                </div> */}
                            </div>
                        </div>
                    ) : (
                        // <p className="order-info">
                        //     General Support Request
                        // </p>
                    <p>
                        ....

                    </p>
                    )}

                    {submitStatus.message && (
                        <div className={`status-message ${submitStatus.type}`}>
                            {submitStatus.message}
                        </div>
                    )}

                    <form className="support-form" onSubmit={handleSubmit}>
                        {/* Name & Phone */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Your full name *</label>
                                <input 
                                    type="text" 
                                    name="fullName"
                                    placeholder="James Jacobe" 
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone *</label>
                                <PhoneInput 
                                    country={'us'}
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    masks={{ us: '............', in: '............' }}
                                    inputProps={{
                                        name: 'phone',
                                        required: true,
                                        autoFocus: false
                                    }}
                                    containerClass="phone-input-container-new"
                                    inputClass="phone-input-field"
                                    buttonClass="country-selector-button"
                                    dropdownClass="country-dropdown"
                                    searchClass="country-search"
                                    placeholder="Enter phone number"
                                    className="us-phone"
                                />
                            </div>
                        </div>

                        {/* Email & Issue type */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="Enter address here" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Issue type</label>
                                <select 
                                    name="issueType"
                                    value={formData.issueType}
                                    onChange={handleInputChange}y
                                    className='issue-type-select'
                                >
                                    <option value="">Select issue type</option>
                                    <option value="Refund Request">Refund Request</option>
                                    <option value="Order Issue">Order Issue</option>
                                    <option value="Payment Issue">Payment Issue</option>
                                    <option value="Delivery Issue">Delivery Issue</option>
                                  
                                </select>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="form-group full-width">
                            <label>Message *</label>
                            <textarea 
                                name="message"
                                placeholder="Please describe your issue in detail..."
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                                rows="5"
                            />
                        </div>

                        {/* Attachments */}
                        <div className="form-group full-width">
                            <label>Attachments <span>(optional, max 5 files)</span></label>
                            <div className="file-upload">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="file-upload-label">
                                    <img src="/Images/Image-upload.svg" alt="" className='Images-uploads' />
                                    <p>Upload files or drag and drop</p>
                                    <small>PNG, JPG, GIF up to 10MB each (max 5 files)</small>
                                </label>
                                {formData.attachments.length > 0 && (
                                    <div className="selected-files">
                                        <p>Selected files:</p>
                                        <ul>
                                            {formData.attachments.map((file, index) => (
                                                <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Privacy Policy */}
                        <div className='Privacy-policy'>
                            Privacy Policy
                        </div>
                        <div className="form-group checkbox">
                            <input type="checkbox" id="privacy" required />
                            <label htmlFor="privacy" className='privacy'>
                                I agree to the privacy policy. Your information will only be used to address your support request.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit support request'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ContactSupport;