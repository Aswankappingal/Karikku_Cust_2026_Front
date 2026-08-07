import React, { useState } from 'react';
import axios from 'axios';
import './SignupLoginModal.scss';
import { useNavigate, Link } from 'react-router-dom';
import baseUrl from '../../../baseUrl';

const SignupLoginModal = ({ onClose, onLogin }) => {
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
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear errors when user starts typing
        if (errors.length > 0) {
            setErrors([]);
        }

        // Clear success message when user makes changes
        if (successMessage) {
            setSuccessMessage('');
        }
    };

    // Client-side validation
    const validateForm = () => {
        const validationErrors = [];

        // Trim whitespace for validation
        const trimmedName = formData.name.trim();
        const trimmedEmail = formData.email.trim();

        if (!trimmedName || trimmedName.length < 2) {
            validationErrors.push('Name must be at least 2 characters');
        }

        if (!trimmedEmail) {
            validationErrors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            validationErrors.push('Please enter a valid email address');
        }

        if (!formData.password) {
            validationErrors.push('Password is required');
        } else if (formData.password.length < 6) {
            validationErrors.push('Password must be at least 6 characters');
        }

        if (!formData.agreeToTerms) {
            validationErrors.push('You must agree to the Terms and Conditions');
        }

        return validationErrors;
    };

    // Handle form submission
    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors([]);
        setSuccessMessage('');

        // Client-side validation
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            setIsLoading(false);
            return;
        }

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
                setSuccessMessage('Account created successfully! Welcome to Karikku!');

                // Store user data and token
                if (response.data.user) {
                    localStorage.setItem('userData', JSON.stringify(response.data.user));
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                    localStorage.setItem('token', response.data.token);
                }

                // Close modal after success
                setTimeout(() => {
                    onClose();
                    // Optional: Call onLogin callback or navigate
                    if (onLogin && typeof onLogin === 'function') {
                        onLogin(response.data.user);
                    }
                    // navigate('/dashboard');
                }, 2000);
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

                        <div className='input-group'>
                            <label htmlFor='name'>Name</label>
                            <input
                                type='text'
                                id='name'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder='Type here...'
                                className='name-input'
                                disabled={isLoading}
                                required
                                maxLength={100}
                            />
                        </div>

                        <div className='input-group'>
                            <label htmlFor='email'>Email address</label>
                            <input
                                type='email'
                                id='email'
                                name='email'
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder='Type here...'
                                className='email-input'
                                autoComplete="email"
                                disabled={isLoading}
                                required
                                maxLength={255}
                            />
                        </div>

                        <div className='input-group'>
                            <label htmlFor='password'>Password</label>
                            <input
                                type='password'
                                id='password'
                                name='password'
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder='Type here...'
                                className='password-input'
                                autoComplete="new-password"
                                disabled={isLoading}
                                required
                                minLength={6}
                                maxLength={128}
                            />
                        </div>

                        <div className='checkbox-group'>
                            <label>
                                <input
                                    className='checkbox'
                                    type="checkbox"
                                    name='agreeToTerms'
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    required
                                />
                                By signing up, I agree to <Link to={'/terms-of-service'} className='Terms-and-conditions'>Terms and Conditions</Link>
                            </label>
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
                            disabled={isLoading || !formData.agreeToTerms}
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