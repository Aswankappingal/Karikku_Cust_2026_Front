import React, { useState } from 'react';
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
  const [status, setStatus] = useState({ type: '', message: '' });

  const handlePhoneChange = (value, country) => {
    // Truncate to 12 digits
    const truncatedValue = value.slice(0, 12);
    setFormData(prev => ({
      ...prev,
      phone: truncatedValue
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setStatus({ type: 'error', message: 'Please enter your name' });
      return false;
    }
    if (!formData.phone) {
      setStatus({ type: 'error', message: 'Please enter your phone number' });
      return false;
    }
    const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length !== 12) {
      setStatus({ type: 'error', message: 'Phone number must be exactly 12 digits' });
      return false;
    }
    if (!formData.email.trim()) {
      setStatus({ type: 'error', message: 'Please enter your email' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email' });
      return false;
    }
    if (!formData.message.trim()) {
      setStatus({ type: 'error', message: 'Please enter your message' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous status
    setStatus({ type: '', message: '' });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/contact-form`, formData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Form submitted successfully:', response.data);
      

      setStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      });
      // Reset form
      setFormData({
        firstName: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);

      if (error.response) {
        // Server responded with error status
        setStatus({
          type: 'error',
          message: error.response.data.message || 'Failed to send message. Please try again.'
        });
      } else if (error.request) {
        // Request made but no response received
        setStatus({
          type: 'error',
          message: 'Network error. Please check your connection and try again.'
        });
      } else {
        // Something else happened
        setStatus({
          type: 'error',
          message: 'An error occurred. Please try again.'
        });
      }
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

        <form className="contact-form" onSubmit={handleSubmit}>
          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="James Jacobi"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="phone">Phone</label>
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
                disabled={loading}
              />
            </div>

            <div className="form-group half-width">
              <label htmlFor="email">Email ID</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@youremail.com"
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              className="form-textarea"
              rows="4"
              disabled={loading}
            />
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