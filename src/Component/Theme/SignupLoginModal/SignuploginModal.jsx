import React, { useState } from 'react';
import axios from 'axios';
import './SignupLoginModal.scss';
import { useNavigate, Link } from 'react-router-dom';
import baseUrl from '../../../baseUrl';
import { toast } from 'react-toastify';

const SignupLoginModal = ({ onClose, onLogin, onSignupSuccess }) => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        agreeToTerms: false,
        subscribeToEmails: false
    });

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]); // Used for server-side errors
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Validate a single field
    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return '';
            case 'email':
                if (!value.trim()) return 'Email address is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Password must be at least 6 characters';
                return '';
            case 'agreeToTerms':
                if (!value) return 'You must agree to the Terms and Conditions';
                return '';
            default:
                return '';
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({
            ...prev,
            [name]: fieldValue
        }));

        // Clear server errors
        if (errors.length > 0) {
            setErrors([]);
        }

        // Validate field in real-time if it was already touched
        if (touched[name]) {
            const error = validateField(name, fieldValue);
            setFieldErrors(prev => ({ ...prev, [name]: error }));
        }

        // Clear success message when user makes changes
        if (successMessage) {
            setSuccessMessage('');
        }
    };

    const handleBlur = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, fieldValue);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
    };

    // Handle form submission
    const handleSignup = async (e) => {
        e.preventDefault();
        
        // Touch all fields to show validation errors
        const newTouched = {
            name: true,
            email: true,
            password: true,
            agreeToTerms: true
        };
        setTouched(newTouched);

        // Run validation on all fields
        const validationErrors = {};
        let hasErrors = false;
        Object.keys(formData).forEach(key => {
            if (key === 'subscribeToEmails') return;
            const err = validateField(key, formData[key]);
            if (err) {
                validationErrors[key] = err;
                hasErrors = true;
            }
        });

        setFieldErrors(validationErrors);

        if (hasErrors) {
            // Focus first field with error
            const firstErrorField = Object.keys(validationErrors)[0];
            const el = document.getElementById(firstErrorField);
            if (el) el.focus();
            return;
        }

        setIsLoading(true);
        setErrors([]);
        setSuccessMessage('');

        try {
            // Prepare data with trimmed values
            const submitData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                agreeToTerms: formData.agreeToTerms,
                subscribeToEmails: formData.subscribeToEmails
            };

            console.log('Submitting signup data:', {
                ...submitData,
                password: '[HIDDEN]'
            });

            const response = await axios.post(`${baseUrl}/signup-with-email`, submitData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('Signup response:', response.data);

            if (response.data.success) {
                toast.success('🎉 Account created! Please log in to continue.');
                setSuccessMessage('Account created successfully! Please log in to continue.');

                // ✅ DO NOT store token/user — force user to log in manually
                // This ensures authentication only happens after explicit login

                // After a short delay, close signup and open login modal
                setTimeout(() => {
                    onClose();
                    // Open Login modal, optionally pre-filling the email the user just signed up with
                    if (onLogin && typeof onLogin === 'function') {
                        onLogin(formData.email.trim().toLowerCase());
                    }
                }, 1800);
            } else {
                // Handle case where success is false but no error was thrown
                setErrors([response.data.message || 'Failed to create account. Please try again.']);
            }
        } catch (error) {
            console.error('Signup error:', error);

            if (error.code === 'ECONNABORTED') {
                setErrors(['Request timed out. Please check your connection and try again.']);
            } else if (error.response) {
                // Server responded with error status
                const { data, status } = error.response;

                if (data && data.errors && Array.isArray(data.errors)) {
                    setErrors(data.errors);
                } else if (data && data.message) {
                    setErrors([data.message]);
                } else {
                    // Handle different status codes
                    switch (status) {
                        case 400:
                            setErrors(['Invalid input. Please check your details and try again.']);
                            break;
                        case 409:
                            setErrors(['An account with this email already exists.']);
                            break;
                        case 500:
                            setErrors(['Server error. Please try again later.']);
                            break;
                        default:
                            setErrors(['Failed to create account. Please try again.']);
                    }
                }
            } else if (error.request) {
                // Request was made but no response received
                setErrors(['Network error. Please check your internet connection and try again.']);
            } else {
                // Something else happened
                setErrors(['An unexpected error occurred. Please try again.']);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle clicking outside the modal to close it
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className='SignupModalMainWrapper' onClick={handleOverlayClick}>
            <div className='modal-content'>
                <div className='modal-header'>
                    <h3>Welcome to Karikku!</h3>
                    <button className='close-button' onClick={onClose} type="button">
                        ×
                    </button>
                </div>

                <p className='acc-para'>
                    Your account for everything Karikku!
                </p>

                <div className='modal-body'>
                    <form onSubmit={handleSignup} noValidate>
                        {/* Error Messages */}
                        {errors.length > 0 && (
                            <div className='error-container'>
                                {errors.map((error, index) => (
                                    <p key={index} className='error-message'>
                                        {error}
                                    </p>
                                ))}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className='success-container'>
                                <p className='success-message'>{successMessage}</p>
                            </div>
                        )}

                        <div className={`input-group ${fieldErrors.name && touched.name ? 'has-error' : ''}`}>
                            <label htmlFor='name'>Name</label>
                            <input
                                type='text'
                                id='name'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder='Type here...'
                                className={`name-input ${fieldErrors.name && touched.name ? 'input-error' : ''}`}
                                disabled={isLoading}
                                required
                                maxLength={100}
                            />
                            {fieldErrors.name && touched.name && (
                                <span className='field-error-message'>{fieldErrors.name}</span>
                            )}
                        </div>

                        <div className={`input-group ${fieldErrors.email && touched.email ? 'has-error' : ''}`}>
                            <label htmlFor='email'>Email address</label>
                            <input
                                type='email'
                                id='email'
                                name='email'
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder='Type here...'
                                className={`email-input ${fieldErrors.email && touched.email ? 'input-error' : ''}`}
                                autoComplete="email"
                                disabled={isLoading}
                                required
                                maxLength={255}
                            />
                            {fieldErrors.email && touched.email && (
                                <span className='field-error-message'>{fieldErrors.email}</span>
                            )}
                        </div>

                        <div className={`input-group ${fieldErrors.password && touched.password ? 'has-error' : ''}`}>
                            <label htmlFor='password'>Password</label>
                            <input
                                type='password'
                                id='password'
                                name='password'
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder='Type here...'
                                className={`password-input ${fieldErrors.password && touched.password ? 'input-error' : ''}`}
                                autoComplete="new-password"
                                disabled={isLoading}
                                required
                                minLength={6}
                                maxLength={128}
                            />
                            {fieldErrors.password && touched.password && (
                                <span className='field-error-message'>{fieldErrors.password}</span>
                            )}
                        </div>

                        <div className={`checkbox-group ${fieldErrors.agreeToTerms && touched.agreeToTerms ? 'has-error' : ''}`}>
                            <label>
                                <input
                                    className='checkbox'
                                    type="checkbox"
                                    name='agreeToTerms'
                                    id='agreeToTerms'
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    disabled={isLoading}
                                    required
                                />
                                By signing up, I agree to <Link to={'/terms-of-service'} className='Terms-and-conditions'>Terms and Conditions</Link>
                            </label>
                            {fieldErrors.agreeToTerms && touched.agreeToTerms && (
                                <span className='field-error-message checkbox-error-message'>{fieldErrors.agreeToTerms}</span>
                            )}
                        </div>

                        <div className='checkbox-group'>
                            <label>
                                <input
                                    className='checkbox'
                                    type="checkbox"
                                    name='subscribeToEmails'
                                    checked={formData.subscribeToEmails}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                                I agree to subscribe to receive Karikku emails.
                            </label>
                        </div>

                        <button
                            type='submit'
                            className='Signup-btn'
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Sign up'}
                        </button>
                    </form>

                    <div className='footer-links'>
                        <p>
                            Already have an account?{' '}
                            <span
                                className='Login-link'
                                onClick={onLogin}
                                style={{ cursor: 'pointer' }}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        onLogin();
                                    }
                                }}
                            >
                                Login
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupLoginModal;