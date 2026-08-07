import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './OtpLoginModal.scss'
import baseUrl from '../../../baseUrl'

const OtpLoginModal = ({ onClose, otpSession, mobileNumber, onLoginSuccess, onSignupRequired, sendOTP }) => {
    const [otp, setOtp] = useState(["", "", "", ""]) // 4 digits for MSG91
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [resendLoading, setResendLoading] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [currentOtpSession, setCurrentOtpSession] = useState(otpSession)

    // Resend cooldown timer
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    // Handle OTP input
    const handleChange = (value, index) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp]
            newOtp[index] = value
            setOtp(newOtp)

            // Clear error when user starts typing
            if (error) {
                setError("")
            }

            // Auto-focus next input
            if (value && index < 3) { // 0, 1, 2, 3 - so focus next until index 2
                document.getElementById(`otp-input-${index + 1}`)?.focus()
            }
        }
    }

    // Handle backspace and auto-focus previous input
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-input-${index - 1}`)?.focus()
        }
    }

    // Resend OTP function
    const handleResendOtp = async () => {
        if (resendCooldown > 0 || resendLoading) return;

        setResendLoading(true);
        setError("");
        setSuccess("");

        try {
            console.log('📤 Resending OTP to:', mobileNumber);

            const response = await axios.post(`${baseUrl}/check-mobile-send-otp`, {
                mobileNumber: mobileNumber
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('✅ Resend OTP response:', response.data);

            const data = response.data;

            if (data.success) {
                setCurrentOtpSession(data.otpSession);
                setSuccess('OTP resent successfully! Please check your phone.');
                setResendCooldown(30); // 30 seconds cooldown

                // Clear the OTP inputs
                setOtp(["", "", "", ""]);

                // Focus first input
                setTimeout(() => {
                    document.getElementById('otp-input-0')?.focus();
                }, 100);
            } else {
                setError(data.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            console.error('❌ Error resending OTP:', error);

            if (error.response) {
                const errorMessage = error.response.data?.message || 'Server error. Please try again.';
                setError(errorMessage);
            } else if (error.request) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setResendLoading(false);
        }
    };

    // Verify OTP with backend
    const handleContinue = async () => {
        const enteredOtp = otp.join("")

        console.log('🔍 Entered OTP:', enteredOtp);
        console.log('📱 Mobile Number:', mobileNumber);

        if (enteredOtp.length !== 4) {
            setError("Please enter the complete 4-digit OTP")
            return
        }

        setLoading(true)
        setError("")
        setSuccess("")

        try {
            console.log('📤 Sending verification request...');

            const response = await axios.post(`${baseUrl}/verify-otp`, {
                mobileNumber: mobileNumber,
                otp: enteredOtp
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            console.log('✅ OTP Verification Response:', response.data);

            const data = response.data

            if (data.success) {
                console.log('✅ OTP verified, logging in user...');

                // Store token and user data
                localStorage.setItem("authToken", data.token)
                localStorage.setItem("user", JSON.stringify(data.user))
                localStorage.setItem("userData", JSON.stringify(data.user))

                // Call onLoginSuccess regardless of isNewUser status
                onLoginSuccess?.({ token: data.token, user: data.user })

                // Show success message if it's a new user
                if (data.isNewUser) {
                    console.log('🆕 New user created and logged in successfully');
                } else {
                    console.log('👤 Existing user logged in successfully');
                }
            } else {
                setError(data.message || "Invalid OTP")
            }
        } catch (err) {
            console.error('❌ OTP verification error:', err)

            if (err.response) {
                const errorMessage = err.response.data?.message || 'Verification failed. Please try again.';
                setError(errorMessage);
            } else if (err.request) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false)
        }
    }

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleContinue();
        }
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    // Format mobile number for display
    const formatMobileNumber = (number) => {
        if (number && number.length === 10) {
            return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
        }
        return number;
    };

    return (
        <div className='otp-LoginModalMainWrapper' onClick={handleOverlayClick}>
            <div className='otp-modal-content'>
                <div className='otp-modal-header'>
                    <h3>Glad You're back!</h3>
                    <button className='close-button' onClick={onClose}>×</button>
                </div>

                <div className='otp-modal-body'>
                    {/* <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                        Enter the <strong>4-digit OTP</strong> sent to <strong>{formatMobileNumber(mobileNumber)}</strong>
                    </p> */}

                    <div className='input-group-otp'>
                        <label htmlFor='verification-code'>Enter OTP</label>
                        <div className="otp-input-wrapper">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className='inputs-otp'
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onKeyPress={handleKeyPress}
                                    disabled={loading}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <p className="otp-error" style={{
                            color: '#e74c3c',
                            fontSize: '14px',
                            textAlign: 'center',
                            margin: '10px 0',
                            fontWeight: '500'
                        }}>
                            {error}
                        </p>
                    )}

                    {/* Success message */}
                    {success && (
                        <p className="otp-success" style={{
                            color: '#27ae60',
                            fontSize: '14px',
                            textAlign: 'center',
                            margin: '10px 0',
                            fontWeight: '500'
                        }}>
                            {success}
                        </p>
                    )}

                    <button
                        className='continue-btn-otp'
                        onClick={handleContinue}
                        disabled={loading}
                        style={{
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? "Verifying..." : "Continue"}
                    </button>

                   

                    {/* <div className='social-login-otp'>
                        <button className='google-btn' disabled={loading}>
                            <div className='google-icon'>
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75 4.8 4.8 0 0 1-4.52-3.36H1.83v2.07A8 8 0 0 0 8.98 17z" />
                                    <path fill="#FBBC05" d="M4.46 10.41a4.8 4.8 0 0 1 0-3.06V5.28H1.83A8 8 0 0 0 1.83 12.7l2.63-2.29z" />
                                    <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.59A8.025 8.025 0 0 0 8.98 1a8 8 0 0 0-7.15 4.42l2.63 2.29c.7-2.05 2.66-3.36 4.52-3.36z" />
                                </svg>
                            </div>
                            Continue with Google
                        </button>
                    </div> */}

                    <div className='footer-links-otp'>
                        <p>
                            Didn't get a text?
                            <span
                                className='signup-link'
                                onClick={handleResendOtp}
                                style={{
                                    cursor: (resendCooldown > 0 || resendLoading) ? 'not-allowed' : 'pointer',
                                    opacity: (resendCooldown > 0 || resendLoading) ? 0.6 : 1,
                                    color: (resendCooldown > 0 || resendLoading) ? '#999' : '#007bff',
                                    marginLeft: '5px',
                                    fontWeight: '600'
                                }}
                            >
                                {resendLoading
                                    ? 'Resending...'
                                    : resendCooldown > 0
                                        ? `Resend OTP (${resendCooldown}s)`
                                        : 'Resend OTP'
                                }
                            </span>
                        </p>
                        <p>Login with password?</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OtpLoginModal