import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './ContactForm.scss';
import baseUrl from '../../../baseUrl';
import axios from 'axios';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-dismiss server error after 6 seconds
  useEffect(() => {
    if (serverError) {
      const timer = setTimeout(() => setServerError(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [serverError]);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Please enter your name';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'phone':
        if (!value) return 'Please enter your phone number';
        const cleanPhone = value.replace(/[\s\-\(\)\+]/g, '');
        if (cleanPhone.length < 10) return '';
        return '';
      case 'email':
        if (!value.trim()) return 'Please enter your email address';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email (e.g. name@example.com)';
        return '';
      case 'message':
        if (!value.trim()) return 'Please enter your message';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        return '';
      default:
        return '';
    }
  };

  const handlePhoneChange = (value, country) => {
    const truncatedValue = value.slice(0, 15);
    setFormData(prev => ({
      ...prev,
      phone: truncatedValue
    }));

    // Clear error on change if field was touched
    if (touched.phone) {
      const error = validateField('phone', truncatedValue);
      setFieldErrors(prev => ({ ...prev, phone: error }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handlePhoneBlur = () => {
    setTouched(prev => ({ ...prev, phone: true }));
    const error = validateField('phone', formData.phone);
    setFieldErrors(prev => ({ ...prev, phone: error }));
  };

  const validateAllFields = () => {
    const errors = {};
    let firstErrorField = null;

    ['firstName', 'phone', 'email', 'message'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        if (!firstErrorField) firstErrorField = field;
      }
    });

    setFieldErrors(errors);
    setTouched({ firstName: true, phone: true, email: true, message: true });

    // Scroll to & focus first invalid field
    if (firstErrorField) {
      const el = document.getElementById(firstErrorField);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setServerError('');

    if (!validateAllFields()) return;

    setLoading(true);

    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Form submitted successfully (mock)');

      setSuccessMessage('Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
      setFormData({ firstName: '', phone: '', email: '', message: '' });
      setFieldErrors({});
      setTouched({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-wrapper">
      <div className="palm-leaf-decoration">
        <img src="/Images/our-story-leaf.png" alt="" />
      </div>
      <div className="contact-form-card">
        <h3 className="form-title">Connect us today!</h3>

        {/* Success Toast */}
        {successMessage && (
          <div className="toast-message toast-success">
            <span className="toast-icon">✓</span>
            <span className="toast-text">{successMessage}</span>
            <button className="toast-close" onClick={() => setSuccessMessage('')} aria-label="Close">×</button>
          </div>
        )}

        {/* Server Error Toast */}
        {serverError && (
          <div className="toast-message toast-error">
            <span className="toast-icon">!</span>
            <span className="toast-text">{serverError}</span>
            <button className="toast-close" onClick={() => setServerError('')} aria-label="Close">×</button>
          </div>
        )}

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${fieldErrors.firstName && touched.firstName ? 'has-error' : ''}`}>
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="James Jacobi"
              className={`form-input ${fieldErrors.firstName && touched.firstName ? 'input-error' : ''}`}
              disabled={loading}
            />
            {fieldErrors.firstName && touched.firstName && (
              <span className="field-error-message">{fieldErrors.firstName}</span>
            )}
          </div>

          <div className="form-row">
            <div className={`form-group half-width ${fieldErrors.phone && touched.phone ? 'has-error' : ''}`}>
              <label htmlFor="phone">Phone</label>
              <PhoneInput
                country={'in'}
                onlyCountries={['in']}
                value={formData.phone}
                onChange={handlePhoneChange}
                masks={{ in: '..........' }}
                inputProps={{
                  name: 'phone',
                  id: 'phone',
                  required: true,
                  autoFocus: false,
                  onBlur: handlePhoneBlur
                }}
                containerClass={`phone-input-container-new ${fieldErrors.phone && touched.phone ? 'phone-error' : ''}`}
                inputClass="phone-input-field"
                buttonClass="country-selector-button"
                dropdownClass="country-dropdown"
                searchClass="country-search"
                placeholder="Enter phone number"
                disabled={loading}
              />
              {fieldErrors.phone && touched.phone && (
                <span className="field-error-message">{fieldErrors.phone}</span>
              )}
            </div>

            <div className={`form-group half-width ${fieldErrors.email && touched.email ? 'has-error' : ''}`}>
              <label htmlFor="email">Email ID</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="example@youremail.com"
                className={`form-input ${fieldErrors.email && touched.email ? 'input-error' : ''}`}
                disabled={loading}
              />
              {fieldErrors.email && touched.email && (
                <span className="field-error-message">{fieldErrors.email}</span>
              )}
            </div>
          </div>

          <div className={`form-group ${fieldErrors.message && touched.message ? 'has-error' : ''}`}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Type your message here..."
              className={`form-textarea ${fieldErrors.message && touched.message ? 'input-error' : ''}`}
              rows="4"
              disabled={loading}
            />
            {fieldErrors.message && touched.message && (
              <span className="field-error-message">{fieldErrors.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;