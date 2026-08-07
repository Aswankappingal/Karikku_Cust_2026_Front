import React, { useState } from 'react';
import axios from 'axios';
import './LoginModal.scss';
import { useNavigate } from 'react-router-dom';
import baseUrl from '../../../baseUrl';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const LoginModal = ({ onClose, onContinue, onSignup }) => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Validate mobile number format (client-side)
  const validateMobileNumber = (number) => {
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    return mobileRegex.test(number);
  };

  // Check if input is email
  const isEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  // Send OTP function (extracted for reuse)
  const sendOTP = async (phoneNumber, isResend = false) => {
    try {
      const response = await axios.post(`${baseUrl}/check-mobile-send-otp`, {
        mobileNumber: phoneNumber
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = response.data;

      if (data.success) {
        const message = isResend ? 'OTP resent successfully! Please check your phone.' : 'OTP sent successfully! Please check your phone.';
        setSuccess(message);

        // Pass the OTP session data to parent component
        if (onContinue) {
          onContinue({
            otpSession: data.otpSession,
            mobileNumber: data.mobileNumber,
            userExists: data.userExists,
            isNewUser: data.isNewUser,
            sendOTP: () => sendOTP(phoneNumber, true) // Pass resend function
          });
        }
        return true;
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error sending OTP:', error);

      // Handle different types of axios errors
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Server error. Please try again.';
        setError(errorMessage);
      } else if (error.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      return false;
    }
  };

  // Handle Google Sign-In Success
  const handleGoogleSignInSuccess = async (response) => {
    console.log('Current URL:', window.location.origin);
    console.log('Google response:', response);
    setGoogleLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = response.credential;

      // Send the token to your backend API to verify and sign up/sign in the user
      const res = await axios.post(`${baseUrl}/sign-up-with-google`, { token });

      console.log('Google sign-in response:', res.data);

      // Check if the response is successful and contains a token
      if (res.data.success && res.data.token) {
        // Get the current time and set the expiration time to 24 hours (matching backend JWT expiry)
        const currentTime = new Date().getTime();
        const tokenExpiry = currentTime + 24 * 60 * 60 * 1000; // 24 hours from now

        // Store both the token and the expiration time in localStorage
        localStorage.setItem('authToken', res.data.token);
        localStorage.setItem('tokenExpiry', tokenExpiry);
        
        // Ensure user data is stored for the Navbar state logic
        if (res.data.user) {
          localStorage.setItem('userData', JSON.stringify(res.data.user));
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        console.log('User signed in successfully with Google:', res.data.user);

        // Show success message
        setSuccess('Successfully signed in with Google!');

        // Close modal and redirect
        setTimeout(() => {
          if (typeof onClose === 'function') {
            onClose();
          }
          navigate('/');
          window.location.reload();
        }, 1000);

      } else {
        console.error('Invalid response from server:', res.data);
        setError('Failed to authenticate with Google. Please try again.');
      }
    } catch (error) {
      console.error('Error during Google Sign-In:', error);

      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Failed to sign in with Google');
      } else if (error.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Google Sign-In Error
  const handleGoogleSignInError = (error) => {
    console.error('Google sign-in error:', error);
    setError('Google sign-in was cancelled or failed. Please try again.');
    setGoogleLoading(false);
  };

  // Handle continue button click
  const handleContinue = async () => {
    setError('');
    setSuccess('');

    // Basic validation
    if (!mobileNumber.trim()) {
      setError('Please enter mobile number or email');
      return;
    }

    // If it's an email, handle email login (you can implement this later)
    if (isEmail(mobileNumber)) {
      setError('Email login not implemented yet. Please use mobile number.');
      return;
    }

    // Remove any spaces or special characters and validate mobile number
    const cleanedNumber = mobileNumber.replace(/\D/g, '');

    if (!validateMobileNumber(cleanedNumber)) {
      setError('Invalid mobile number. Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      return;
    }

    setLoading(true);
    await sendOTP(cleanedNumber);
    setLoading(false);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMobileNumber(value);

    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    if (success) {
      setSuccess('');
    }
  };

  // Handle clicking outside the modal to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (typeof onClose === 'function') {
        onClose();
      } else {
        navigate(-1);
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  // Handle Facebook login (placeholder for now)
  const handleFacebookLogin = () => {
    setError('Facebook login not implemented yet.');
  };

  const isAnyLoading = loading || googleLoading;

  return (
    <GoogleOAuthProvider clientId='702774186213-vbl6f0obdqb5ep8a4b03mmqvi5g8bncg.apps.googleusercontent.com'>
      <div className='LoginModalMainWrapper' onClick={handleOverlayClick}>
        <div className='modal-content'>
          <div className='modal-header'>
            <h3>Welcome back - log in!</h3>
            <button className='close-button' onClick={() => typeof onClose === 'function' ? onClose() : navigate(-1)} disabled={isAnyLoading}>
              ×
            </button>
          </div>

          <p className='acc-para'>
            Your account for everything karikku
          </p>

          <div className='modal-body'>
            <div className='input-group'>
              <label htmlFor='email'>Enter Mobile Number / Email*</label>
              <input
                type='text'
                id='email'
                placeholder='Type here...'
                className='email-input'
                autoComplete="tel"
                value={mobileNumber}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isAnyLoading}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className='error-message' style={{
                color: '#e74c3c',
                fontSize: '14px',
                marginTop: '8px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className='success-message' style={{
                color: '#27ae60',
                fontSize: '14px',
                marginTop: '8px',
                textAlign: 'center'
              }}>
                {success}
              </div>
            )}

            <button
              className='continue-btn'
              onClick={handleContinue}
              disabled={isAnyLoading}
              style={{
                opacity: isAnyLoading ? 0.7 : 1,
                cursor: isAnyLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>

            <div className='divider'>
              <span>╾╾╾╾╾╾╾╾╾╾╾╾╾ OR ╾╾╾╾╾╾╾╾╾╾╾╾╾╾</span>
            </div>

            <div className='social-login'>
              {/* Google Login Integration */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  opacity: isAnyLoading ? 0.7 : 1,
                  pointerEvents: isAnyLoading ? 'none' : 'auto',
                }}
              >
                <div className="" style={{ position: 'relative' }}>
                  {googleLoading ? (
                    <button
                      className=""
                      disabled
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '78px',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontFamily: 'General Sans',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '110%',
                        cursor: 'not-allowed',
                        opacity: 0.8,
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          border: '2px solid #f3f3f3',
                          borderTop: '2px solid #4285F4',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />

                    </button>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSignInSuccess}
                      onError={handleGoogleSignInError}
                      useOneTap={false}
                      auto_select={false}
                      theme="outline"
                      size="large"
                      width="280"
                    />
                  )}
                </div>
              </div>
              {/* Custom styled buttons to match your design */}
              {/* <button
                className='facebook-btn'
                disabled={isAnyLoading}
                onClick={handleFacebookLogin}
                style={{
                  opacity: isAnyLoading ? 0.7 : 1,
                  cursor: isAnyLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <div className='facebook-icon'>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                Continue with Facebook
              </button> */}
            </div>

            <div className='footer-links'>
              <p>
                Don't have an account?{' '}
                <span
                  className='signup-link'
                  onClick={!isAnyLoading ? (typeof onSignup === 'function' ? onSignup : undefined) : undefined}
                  style={{
                    cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                    opacity: isAnyLoading ? 0.7 : 1
                  }}
                >
                  Sign up
                </span>
              </p>
              {/* <p>Login with password?</p> */}
            </div>
          </div>
        </div>

        {/* Add CSS for loading spinner animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginModal;