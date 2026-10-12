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

    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    // Auto-dismiss general success message after 5 seconds
    useEffect(() => {
        if (submitStatus.message && submitStatus.type === 'success') {
            const timer = setTimeout(() => setSubmitStatus({ type: '', message: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [submitStatus]);

    const validateField = (name, value) => {
        switch (name) {
            case 'fullName':
                if (!value || !value.trim()) return 'Full name is required';
                if (value.trim().length < 2) return 'Full name must be at least 2 characters';
                return '';
            case 'phone':
                if (!value || value === '91' || value === '+91') return 'Phone number is required';
                const cleanPhone = value.replace(/[\s\-\(\)\+]/g, '');
                if (cleanPhone.length < 10) return 'Please enter a valid phone number';
                return '';
            case 'email':
                if (!value || !value.trim()) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value.trim())) return 'Please provide a valid email address';
                return '';
            case 'message':
                if (!value || !value.trim()) return 'Message is required';
                if (value.trim().length < 10) return 'Message must be at least 10 characters long';
                return '';
            default:
                return '';
        }
    };

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name.toLowerCase().includes('name') || name.toLowerCase().includes('firstname') || name.toLowerCase().includes('lastname')) {
            formattedValue = value.replace(/[0-9]/g, '');
        } else if (name.toLowerCase().includes('phone') || name.toLowerCase().includes('number') || name.toLowerCase().includes('zip') || name.toLowerCase().includes('pin')) {
            formattedValue = value.replace(/[a-zA-Z]/g, '');
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, formattedValue);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
    };

    const handlePhoneChange = (phone) => {
        setFormData(prev => ({
            ...prev,
            phone: phone
        }));

        setTouched(prev => ({ ...prev, phone: true }));
        const error = validateField('phone', phone);
        setFieldErrors(prev => ({ ...prev, phone: error }));
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

    const validateAllFields = () => {
        const errors = {};
        let firstErrorField = null;

        ['fullName', 'phone', 'email', 'message'].forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                errors[field] = error;
                if (!firstErrorField) firstErrorField = field;
            }
        });

        setFieldErrors(errors);
        setTouched({ fullName: true, phone: true, email: true, message: true });

        if (firstErrorField) {
            const el = document.getElementById(firstErrorField) || document.getElementsByName(firstErrorField)[0];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
            }
        }

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ type: '', message: '' });

        if (!validateAllFields()) {
            return;
        }

        if (!orderDetails?.id && !orderDetails?.orderId) {
            setSubmitStatus({ type: 'error', message: 'Order information is missing' });
            return;
        }

        setIsSubmitting(true);

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
                setFieldErrors({});
                setTouched({});
            } else {
                const errMsg = result.error || 'Failed to submit support request';
                const lower = errMsg.toLowerCase();

                // Map field-specific error messages directly under the correct inputs
                if (lower.includes('message')) {
                    setFieldErrors(prev => ({ ...prev, message: errMsg }));
                    setTouched(prev => ({ ...prev, message: true }));
                } else if (lower.includes('name')) {
                    setFieldErrors(prev => ({ ...prev, fullName: errMsg }));
                    setTouched(prev => ({ ...prev, fullName: true }));
                } else if (lower.includes('phone')) {
                    setFieldErrors(prev => ({ ...prev, phone: errMsg }));
                    setTouched(prev => ({ ...prev, phone: true }));
                } else if (lower.includes('email')) {
                    setFieldErrors(prev => ({ ...prev, email: errMsg }));
                    setTouched(prev => ({ ...prev, email: true }));
                } else {
                    setSubmitStatus({ 
                        type: 'error', 
                        message: errMsg 
                    });
                }
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
                            </div>
                        </div>
                    ) : (
                    <p>
                        ....
                    </p>
                    )}

                    {submitStatus.message && (
                        <div className={`status-message ${submitStatus.type}`}>
                            {submitStatus.message}
                        </div>
                    )}

                    <form className="support-form" onSubmit={handleSubmit} noValidate>
                        {/* Name & Phone */}
                        <div className="form-row">
                            <div className={`form-group ${fieldErrors.fullName && touched.fullName ? 'has-error' : ''}`}>
                                <label htmlFor="fullName">Your full name *</label>
                                <input 
                                    type="text" 
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Enter your name " 
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`form-input ${fieldErrors.fullName && touched.fullName ? 'input-error' : ''}`}
                                />
                                {fieldErrors.fullName && touched.fullName && (
                                    <span className="field-error-message">{fieldErrors.fullName}</span>
                                )}
                            </div>
                            <div className={`form-group ${fieldErrors.phone && touched.phone ? 'has-error' : ''}`}>
                                <label htmlFor="phone">Phone *</label>
                                <PhoneInput 
                                    country={'in'}
                                    onlyCountries={['in']}
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    masks={{ in: '..........' }}
                                    countryCodeEditable={false}
                                    inputProps={{
                                        name: 'phone',
                                        id: 'phone',
                                        autoFocus: false,
                                        onBlur: () => {
                                            setTouched(prev => ({ ...prev, phone: true }));
                                            const error = validateField('phone', formData.phone);
                                            setFieldErrors(prev => ({ ...prev, phone: error }));
                                        }
                                    }}
                                    containerClass={`phone-input-container-new ${fieldErrors.phone && touched.phone ? 'phone-error' : ''}`}
                                    inputClass={`phone-input-field ${fieldErrors.phone && touched.phone ? 'input-error' : ''}`}
                                    buttonClass="country-selector-button"
                                    dropdownClass="country-dropdown"
                                    searchClass="country-search"
                                    placeholder="Enter phone number"
                                    className="us-phone"
                                />
                                {fieldErrors.phone && touched.phone && (
                                    <span className="field-error-message">{fieldErrors.phone}</span>
                                )}
                            </div>
                        </div>

                        {/* Email & Issue type */}
                        <div className="form-row">
                            <div className={`form-group ${fieldErrors.email && touched.email ? 'has-error' : ''}`}>
                                <label htmlFor="email">Email *</label>
                                <input 
                                    type="email" 
                                    id="email"
                                    name="email"
                                    placeholder="Enter address here" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`form-input ${fieldErrors.email && touched.email ? 'input-error' : ''}`}
                                />
                                {fieldErrors.email && touched.email && (
                                    <span className="field-error-message">{fieldErrors.email}</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="issueType">Issue type</label>
                                <select 
                                    id="issueType"
                                    name="issueType"
                                    value={formData.issueType}
                                    onChange={handleInputChange}
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
                        <div className={`form-group full-width ${fieldErrors.message && touched.message ? 'has-error' : ''}`}>
                            <label htmlFor="message">Message *</label>
                            <textarea 
                                id="message"
                                name="message"
                                placeholder="Please describe your issue in detail..."
                                value={formData.message}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                rows="5"
                                className={`form-textarea ${fieldErrors.message && touched.message ? 'input-error' : ''}`}
                            />
                            {fieldErrors.message && touched.message && (
                                <span className="field-error-message">{fieldErrors.message}</span>
                            )}
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