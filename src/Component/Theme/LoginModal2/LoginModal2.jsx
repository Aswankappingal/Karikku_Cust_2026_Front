import React, { useState, useEffect } from 'react';
import './LoginModal2.scss';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../store/hook/useUser';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setAuthFromStorage } from '../../../store/slice/userSlice';

/**
 * LoginModal2 — Email/Password Login Modal
 *
 * Props:
 *   onClose       — closes this modal
 *   onSignup      — switches back to the signup modal
 *   prefillEmail  — email pre-filled after signup (passed from Navbar)
 */
const LoginModal2 = ({ onClose, onSignup, prefillEmail }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

    // Form state — pre-fill email if coming from signup
    const [formData, setFormData] = useState({
        email: prefillEmail || '',
        password: ''
    });

    // If prefillEmail arrives after mount (async), sync it
    useEffect(() => {
        if (prefillEmail) {
            setFormData(prev => ({ ...prev, email: prefillEmail }));
        }
    }, [prefillEmail]);

    // Validation + UI state
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({});

    // Clear Redux errors whenever the user types
    useEffect(() => {
        if (error) clearError();
    }, [formData]);

    // Close modal once Redux says the user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            onClose();
        }
    }, [isAuthenticated, onClose]);

    // ---- Validation ----
    const validateField = (name, value) => {
        switch (name) {
            case 'email':
                if (!value.trim()) return 'Mobile number or email is required';
                if (!value.includes('@') && !/^\d{10}$/.test(value.trim())) {
                    return 'Please enter a valid mobile number (10 digits) or email';
                }
                if (value.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    return 'Please enter a valid email address';
                }
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Password must be at least 6 characters';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    // ---- Submit ----
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Touch all fields to reveal errors
        setTouched({ email: true, password: true });

        const errors = {};
        ['email', 'password'].forEach(key => {
            const err = validateField(key, formData[key]);
            if (err) errors[key] = err;
        });
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            const firstEl = document.getElementById(Object.keys(errors)[0]);
            if (firstEl) firstEl.focus();
            return;
        }

        try {
            const result = await login({
                email: formData.email.trim(),
                password: formData.password
            });

            if (result.success) {
                // ✅ Store auth data — this is the ONLY place authentication is established
                const currentTime = new Date().getTime();
                const tokenExpiry = currentTime + 24 * 60 * 60 * 1000; // 24 h

                if (result.data?.token) {
                    localStorage.setItem('authToken', result.data.token);
                    localStorage.setItem('token', result.data.token);
                    localStorage.setItem('tokenExpiry', String(tokenExpiry));
                }
                if (result.data?.user) {
                    localStorage.setItem('userData', JSON.stringify(result.data.user));
                    localStorage.setItem('user', JSON.stringify(result.data.user));
                }

                // Force Redux state to sync with localStorage
                dispatch(setAuthFromStorage());

                toast.success('✅ Logged in! Welcome to Karikku!');

                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 900);
            } else {
                toast.error(result.error || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    // Overlay click closes modal
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    return (
        <div className='LoginModal2Wrapper' onClick={handleOverlayClick}>
            <div className='lm2-content'>

                {/* ---- Header ---- */}
                <div className='lm2-header'>
                    <h3>Login to your account!</h3>
                    <button
                        className='lm2-close-btn'
                        onClick={onClose}
                        type="button"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <p className='lm2-subtitle'>Your account for everything Karikku!</p>

                {/* ---- Signup success banner ---- */}
                {prefillEmail && (
                    <div className='lm2-signup-banner'>
                        <span className='lm2-banner-icon'>🎉</span>
                        <span>
                            Account created! Log in with your new credentials to continue.
                        </span>
                    </div>
                )}

                {/* ---- Form ---- */}
                <form className='lm2-body' onSubmit={handleSubmit} noValidate>

                    {/* Redux-level error */}
                    {error && (
                        <div className='lm2-error-banner'>{error}</div>
                    )}

                    {/* Email / Mobile */}
                    <div className={`lm2-input-group ${formErrors.email && touched.email ? 'has-error' : ''}`}>
                        <label htmlFor='lm2-email'>Enter Mobile Number / Email*</label>
                        <input
                            type='text'
                            id='lm2-email'
                            name='email'
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder='Type here...'
                            className={`lm2-input ${formErrors.email && touched.email ? 'input-error' : ''}`}
                            autoComplete="email"
                            disabled={isLoading}
                        />
                        {formErrors.email && touched.email && (
                            <span className='lm2-field-error'>{formErrors.email}</span>
                        )}
                    </div>

                    {/* Password */}
                    <div className={`lm2-input-group ${formErrors.password && touched.password ? 'has-error' : ''}`}>
                        <label htmlFor='lm2-password'>Password</label>
                        <div className='lm2-password-wrapper'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id='lm2-password'
                                name='password'
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder='Type here...'
                                className={`lm2-input ${formErrors.password && touched.password ? 'input-error' : ''}`}
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className='lm2-eye-btn'
                                onClick={togglePasswordVisibility}
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {formErrors.password && touched.password && (
                            <span className='lm2-field-error'>{formErrors.password}</span>
                        )}
                    </div>

                    {/* Forgot password */}
                    <div className='lm2-forgot-password'>
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={() => toast.info('Password reset feature coming soon!')}
                            onKeyPress={(e) => { if (e.key === 'Enter') toast.info('Password reset feature coming soon!'); }}
                        >
                            Forgot your password?
                        </span>
                    </div>

                    {/* Login Button */}
                    <button
                        type='submit'
                        className='lm2-login-btn'
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className='lm2-btn-loader'>
                                <span className='lm2-spinner'></span>
                                Logging in...
                            </span>
                        ) : 'Login'}
                    </button>

                    {/* Footer */}
                    <div className='lm2-footer'>
                        <p>
                            Don't have an account?{' '}
                            <span
                                className='lm2-signup-link'
                                onClick={!isLoading ? onSignup : undefined}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
                                        onSignup?.();
                                    }
                                }}
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