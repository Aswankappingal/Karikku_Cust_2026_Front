import React, { useState, useEffect } from 'react';
import './LoginModal2.scss';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../store/hook/useUser'; // Adjust path as needed

const LoginModal2 = ({ onClose, onSignup }) => {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Form validation state
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Clear errors when component mounts or form changes
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [formData]);

    // Check for token expiry on component mount
    useEffect(() => {
        const checkTokenExpiry = () => {
            const tokenExpiry = localStorage.getItem('tokenExpiry');
            const currentTime = new Date().getTime();

            // If the current time is greater than the token expiry time, remove the token
            if (tokenExpiry && currentTime > tokenExpiry) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('tokenExpiry');
                console.log('Token has expired and is removed');
            }
        };

        checkTokenExpiry();
    }, []); // Runs on component mount

    // Close modal if user gets authenticated
    useEffect(() => {
        if (isAuthenticated) {
            onClose();
            // Optionally navigate to dashboard or profile
            // navigate('/dashboard');
        }
    }, [isAuthenticated, onClose, navigate]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific field error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Form validation
    const validateForm = () => {
        const errors = {};

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email or mobile number is required';
        } else if (
            !formData.email.includes('@') &&
            !/^\d{10}$/.test(formData.email.trim())
        ) {
            // Check if it's not an email and not a 10-digit mobile number
            if (!formData.email.includes('@')) {
                errors.email = 'Please enter a valid mobile number (10 digits)';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
                errors.email = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters long';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const result = await login({
                email: formData.email.trim(),
                password: formData.password
            });

            if (result.success) {
                console.log('Login successful:', result.data);
                
                // Set token expiry - 1 hour from now
                const currentTime = new Date().getTime();
                const tokenExpiry = currentTime + 3600000; // 1 hour (3600000 milliseconds)

                // Store the token (assuming it comes from result.data.token)
                if (result.data.token) {
                    localStorage.setItem('authToken', result.data.token);
                    localStorage.setItem('tokenExpiry', tokenExpiry);
                }

                // onClose will be called automatically due to useEffect watching isAuthenticated
            } else {
                // Error is already handled by the Redux store
                console.error('Login failed:', result.error);
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    // Handle clicking outside the modal to close it
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className='LoginModalMainWrapper' onClick={handleOverlayClick}>
            <div className='modal-content'>
                <div className='modal-header'>
                    <h3>Login to your account!</h3>
                    <button className='close-button' onClick={onClose}>
                        ×
                    </button>
                </div>

                <p className='acc-para'>
                    Your account for everything Karikku!
                </p>

                <form className='modal-body' onSubmit={handleSubmit}>
                    {/* Display general error */}
                    {error && (
                        <div className='error-message' style={{
                            color: '#e74c3c',
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: '#fdf2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className='input-group'>
                        <label htmlFor='email'>Enter Mobile Number / Email*</label>
                        <input
                            type='text'
                            id='email'
                            name='email'
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder='Type here...'
                            className={`email-input ${formErrors.email ? 'error' : ''}`}
                            autoComplete="email"
                            disabled={isLoading}
                        />
                        {formErrors.email && (
                            <span className='field-error' style={{
                                color: '#e74c3c',
                                fontSize: '12px',
                                marginTop: '5px',
                                display: 'block'
                            }}>
                                {formErrors.email}
                            </span>
                        )}
                    </div>

                    <div className='input-group'>
                        <label htmlFor='password'>Password*</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id='password'
                                name='password'
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder='Type here...'
                                className={`password-input ${formErrors.password ? 'error' : ''}`}
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#666'
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {formErrors.password && (
                            <span className='field-error' style={{
                                color: '#e74c3c',
                                fontSize: '12px',
                                marginTop: '5px',
                                display: 'block'
                            }}>
                                {formErrors.password}
                            </span>
                        )}
                    </div>

                    <div className='Forgot-password'>
                        <p>
                            Forgot Your password?
                        </p>
                    </div>

                    <button
                        type="submit"
                        className='Login-btn'
                        disabled={isLoading}
                        style={{
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className='footer-links'>
                        <p>
                            Don't have an account?{' '}
                            <span
                                className='Signup-link'
                                onClick={onSignup}

                            >
                                Signup
                            </span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal2;