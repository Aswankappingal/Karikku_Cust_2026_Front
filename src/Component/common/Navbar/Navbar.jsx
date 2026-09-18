import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthFromStorage } from '../../../store/slice/userSlice';
import './Navbar.scss';
import { BsBasket3 } from 'react-icons/bs';
import LoginModal from '../../Theme/LoginModal/LoginModal';
import OtpLoginModal from '../../Theme/OTPLoginModal/OtpLoginModal';
import SignupLoginModal from '../../Theme/SignupLoginModal/SignuploginModal';
import LoginModal2 from '../../Theme/LoginModal2/LoginModal2';
import EmailModal from '../../Theme/EmailModal/EmailModal';
import { useAuth } from '../../../store/hook/useUser';
import { isTokenExpired } from '../../../utils/authUtils';

const Navbar = ({ bgColor = "#f9f9f9ff" }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [activeNavItem, setNavItem] = useState('');
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [otpModalIsOpen, setOtpModalIsOpen] = useState(false);
  const [SignupModalIsOpen, setSignupModalIsOpen] = useState(false);
  const [LoginModal2IsOpen, setLoginModal2IsOpen] = useState(false);
  const [logoutConfirmModalIsOpen, setLogoutConfirmModalIsOpen] = useState(false);
  const [emailModalIsOpen, setEmailModalIsOpen] = useState(false);
  // Email pre-filled in LoginModal2 when opened automatically after signup
  const [prefillSignupEmail, setPrefillSignupEmail] = useState('');


  // Add state for OTP session data
  const [otpSessionData, setOtpSessionData] = useState({
    otpSession: null,
    mobileNumber: null,
    userExists: false,
    isNewUser: false
  });

  // Use both Redux selector and localStorage for more reliable auth state
  const reduxAuthState = useSelector((state) => state.auth?.isAuthenticated);
  const [localAuthState, setLocalAuthState] = useState(false);

  // Add useAuth hook
  const { login, isLoading, error, clearError, isAuthenticated, logout } = useAuth();

  // Combined authentication state - use both Redux and local check
  const combinedAuthState = reduxAuthState || localAuthState || isAuthenticated;

  // Check localStorage for auth state
  const checkAuthFromStorage = () => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const userStr = localStorage.getItem("user") || localStorage.getItem("userData");
      
      // Check if token exists AND is not expired
      const isAuth = !!(token && userStr) && !isTokenExpired(token);
      
      if (token && isTokenExpired(token)) {
        console.warn('Navbar: Token expired detected. Clearing storage.');
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userData");
        // Trigger Redux update to ensure consistency
        dispatch(setAuthFromStorage());
      }
      
      setLocalAuthState(isAuth);
      return isAuth;
    } catch (error) {
      console.error('Error checking auth from storage:', error);
      return false;
    }
  };

  // Initialize auth state from localStorage on component mount - THIS IS CRITICAL
  useEffect(() => {
    console.log('Initializing auth state from storage...');
    dispatch(setAuthFromStorage());
    checkAuthFromStorage();
  }, [dispatch]);

  // Listen for auth state changes and update local state
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'user') {
        console.log('Storage changed, updating auth state');
        checkAuthFromStorage();
        dispatch(setAuthFromStorage());
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically (in case of same-tab updates)
    const interval = setInterval(() => {
      checkAuthFromStorage();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [dispatch]);

  // Update active nav item when location changes
  useEffect(() => {
    setNavItem(location.pathname);
  }, [location.pathname]);

  // Close all modals when user becomes authenticated
  useEffect(() => {
    if (combinedAuthState) {
      console.log('User authenticated - closing modals');
      setLoginModalIsOpen(false);
      setOtpModalIsOpen(false);
      setSignupModalIsOpen(false);
      setLoginModal2IsOpen(false);
      // Clear session data when authenticated
      setOtpSessionData({
        otpSession: null,
        mobileNumber: null,
        userExists: false,
        isNewUser: false
      });
    }
  }, [combinedAuthState]);

  // Open login modal if redirected from a protected route
  useEffect(() => {
    if (location.state?.showLogin && !combinedAuthState && !loginModalIsOpen) {
      console.log('Redirected from protected route - opening login modal');
      setLoginModalIsOpen(true);
      // Clear the state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, combinedAuthState, loginModalIsOpen]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    const isAnyModalOpen = LoginModal2IsOpen || logoutConfirmModalIsOpen || loginModalIsOpen || otpModalIsOpen || SignupModalIsOpen;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [loginModalIsOpen, otpModalIsOpen, SignupModalIsOpen, LoginModal2IsOpen, logoutConfirmModalIsOpen]);

  console.log('Auth States - Redux:', reduxAuthState, 'Local:', localAuthState, 'useAuth:', isAuthenticated, 'Combined:', combinedAuthState);

  // Function to open the login modal - ONLY if not authenticated
  const openLoginModal = () => {
    if (!combinedAuthState) {
      console.log('Opening login modal - user not authenticated');
      setLoginModalIsOpen(true);
      setSignupModalIsOpen(false);
      setOtpModalIsOpen(false);
      setLoginModal2IsOpen(false);
      // Reset OTP session data when opening login modal
      setOtpSessionData({
        otpSession: null,
        mobileNumber: null,
        userExists: false,
        isNewUser: false
      });
    } else {
      console.log('Login modal not opened - user is already authenticated');
    }
  };

  // Function to close the login modal
  const closeLoginModal = () => {
    setLoginModalIsOpen(false);
  };

  // Functions to open/close OTP Modal - Updated to handle session data
  const openOtpModal = (sessionData = null) => {
    if (!combinedAuthState) {
      if (sessionData) {
        setOtpSessionData(sessionData);
      }
      setOtpModalIsOpen(true);
      setLoginModalIsOpen(false);
      setSignupModalIsOpen(false);
      setLoginModal2IsOpen(false);
    }
  };

  const closeOtpModal = () => {
    setOtpModalIsOpen(false);
    // Reset session data when closing OTP modal
    setOtpSessionData({
      otpSession: null,
      mobileNumber: null,
      userExists: false,
      isNewUser: false
    });
  };

  // Functions to open/close Signup Modal
  const openSignupModal = () => {
    if (!combinedAuthState) {
      setSignupModalIsOpen(true);
      setLoginModalIsOpen(false);
      setOtpModalIsOpen(false);
      setLoginModal2IsOpen(false);
    }
  };

  const closeSignupModal = () => {
    setSignupModalIsOpen(false);
  };

  // Functions to open/close Login Modal2
  const openLoginpModal2 = () => {
    if (!combinedAuthState) {
      setLoginModal2IsOpen(true);
      setSignupModalIsOpen(false);
      setLoginModalIsOpen(false);
      setOtpModalIsOpen(false);
    }
  };

  const closeLoginModal2 = () => {
    setLoginModal2IsOpen(false);
    setPrefillSignupEmail(''); // Clear pre-filled email when modal is closed
  };

  // ✅ Opens LoginModal2 after successful signup, pre-filling the registered email
  const openLoginAfterSignup = (signedUpEmail) => {
    if (!combinedAuthState) {
      setPrefillSignupEmail(signedUpEmail || '');
      setLoginModal2IsOpen(true);
      setSignupModalIsOpen(false);
      setLoginModalIsOpen(false);
      setOtpModalIsOpen(false);
    }
  };

  // Handle successful login - Updated with better error handling and forced Redux update
  const handleLoginSuccess = ({ token, user }) => {
    try {
      console.log('Login success handler called:', { token, user });

      // ✅ Save token & user
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userData", JSON.stringify(user));

      // ✅ Update both local state and Redux state immediately
      setLocalAuthState(true);
      dispatch(setAuthFromStorage());

      // ✅ Close all modals
      setOtpModalIsOpen(false);
      setLoginModalIsOpen(false);
      setSignupModalIsOpen(false);
      setLoginModal2IsOpen(false);

      // Reset OTP session data
      setOtpSessionData({
        otpSession: null,
        mobileNumber: null,
        userExists: false,
        isNewUser: false,
      });

      console.log("✅ User logged in. Showing Email Modal.");

      // Open Email modal instead of reloading immediately
      setEmailModalIsOpen(true);
    } catch (error) {
      console.error("Error in handleLoginSuccess:", error);
    }
  };

  const handleEmailModalClose = () => {
    setEmailModalIsOpen(false);
    // Force a reload to ensure all components (Cart, Wishlist, etc.) sync with the new auth state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };




  // Handle case when signup is required (new user)
  const handleSignupRequired = ({ mobileNumber }) => {
    console.log('Signup required for:', mobileNumber);
    // Close OTP modal and open signup modal
    setOtpModalIsOpen(false);
    // setSignupModalIsOpen(true);
  };

  // Add logout functionality
  const handleLogout = async () => {
    try {
      // Clear all possible auth keys from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userData");
      localStorage.removeItem("tokenExpiry");

      // Update local state
      setLocalAuthState(false);

      // Call logout from useAuth hook if available
      if (logout) {
        await logout();
      }

      setLogoutConfirmModalIsOpen(false);

      // Clear any stored session data
      setOtpSessionData({
        otpSession: null,
        mobileNumber: null,
        userExists: false,
        isNewUser: false
      });

      // Force Redux state update to reflect logout
      dispatch(setAuthFromStorage());

      console.log('Logout successful');
      
      // Force reload to home page
      setTimeout(() => {
        window.location.href = '/';
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to open logout confirmation modal
  const openLogoutConfirmModal = () => {
    if (combinedAuthState) {
      setLogoutConfirmModalIsOpen(true);
    }
  };

  // Function to close logout confirmation modal
  const closeLogoutConfirmModal = () => {
    setLogoutConfirmModalIsOpen(false);
  };


  const closeMobileNavbar = () => {
    const offcanvasElement = document.getElementById('offcanvasRight');
    if (offcanvasElement) {
      // Bootstrap 5 Offcanvas API
      const offcanvasInstance = window.bootstrap?.Offcanvas?.getInstance(offcanvasElement);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      } else {
        // Fallback: manually hide if Bootstrap instance not found
        offcanvasElement.classList.remove('show');
        offcanvasElement.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('offcanvas-backdrop');
      }
    }
  };




  // Function to handle login/logout button click
  const handleAuthButtonClick = () => {
    console.log('Auth button clicked. CombinedAuthState:', combinedAuthState);

    closeMobileNavbar();      // 🔹 Close offcanvas before showing logout modal

    if (combinedAuthState) {
      console.log('User is authenticated - opening logout confirmation');
      openLogoutConfirmModal();
    }


    else {
      console.log('User is not authenticated - opening login modal');
      openLoginModal();
    }
  };

  return (
    <div className="NavbarMainWrapper">
      {/* Desktop Navbar */}
      <nav className={`navbar-desktop navbar-expand-lg fixed-top py-3 `} style={{ backgroundColor: bgColor, }}>
        <div className="container-fluid d-flex justify-content-between align-items-center navbar-sub">
          {/* Left Links */}
          <div className="nav-item d-flex">
            <Link className={`nav-link mx-2 ${activeNavItem === '/' ? 'active' : ''}`} to="/">Home</Link>
            {/* <Link className={`nav-link mx-2 ${activeNavItem === '/about-us' ? 'active' : ''}`} to="/about-us">About Us</Link> */}
            <Link className={`nav-link mx-2 ${activeNavItem === '/store' ? 'active' : ''}`} to="/store">Stores</Link>
            {combinedAuthState && (
              <>
                <Link className={`nav-link mx-2 ${activeNavItem === '/order-details' ? 'active' : ''}`} to="/order-details">My Orders</Link>
              </>
            )}
            {/* <Link className={`nav-link mx-2 ${activeNavItem === '/contact-us' ? 'active' : ''}`} to="/contact-us">Contact Us</Link> */}
            <Link className={`nav-link mx-2 ${activeNavItem === '/blogs' ? 'active' : ''}`} to="/blogs">Blog</Link>
          </div>

          {/* Center Logo */}
          <div className="Nav-logo mx-auto position-absolute start-50 translate-middle-x">
            <Link className="navbar-brand" to="/">
              <img src="/Images/Karikku logo 2.svg" alt="Karikku Logo" style={{ height: '40px' }} />
            </Link>
          </div>

          {/* Right Links */}
          <div className="nav-item d-flex align-items-center">
            <Link className={`nav-link mx-2 ${activeNavItem === '/products' ? 'active' : ''}`} to="/products">Our Products</Link>
            {combinedAuthState ? (
              <>
                <Link
                  className={`nav-link mx-2 ${activeNavItem === '/wishlist' ? 'active' : ''}`}
                  to="/wishlist"
                >
                  Wishlist
                </Link>
                <Link
                  className={`nav-link mx-2 ${activeNavItem === '/cart' ? 'active' : ''}`}
                  to="/cart"
                >
                  Cart
                </Link>
              </>
            ) : (
              <>
                {/* <Link
                  className={`nav-link mx-2 ${activeNavItem === '/Faq' ? 'active' : ''}`}
                  to="/Faq"
                >
                  FAQ
                </Link> */}
                <Link
                  className={`nav-link mx-2 ${activeNavItem === '/about-us' ? 'active' : ''}`}
                  to="/about-us"
                >
                  About Us
                </Link>
              </>
            )}

            <div
              className={`ms-2 px-3 py-1 rounded-pill ${combinedAuthState ? 'btn btn-danger' : ''}`}
              style={
                !combinedAuthState
                  ? { backgroundColor: "#3DAE4A", color: "#fff", cursor: "pointer" }
                  : { cursor: "pointer" }
              }
              onClick={handleAuthButtonClick}
            >
              {combinedAuthState ? 'Logout' : 'Login / Register'}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <div className="Mobile-Navbar">
        {/* Top navbar */}
        <nav className="navbar bg-white  mobile-fixed-top">
          <div className='navbar-logo'>
            <Link className="navbar-brand" to="/">
              <img src="/Images/Karikku-Nav-logo-mobile.svg" alt="Karikku" width="55" />
            </Link>
          </div>

          <div className='btn-sections'>
            <button
              className="btn"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasRight"
              aria-controls="offcanvasRight"
            >
              <img src="/Images/Menu icons.svg" alt="Menu" />
            </button>
          </div>
        </nav>

        {/* Offcanvas Menu */}
        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasRight"
          aria-labelledby="offcanvasRightLabel"
        >
          <img
            src="/Images/img_greenleafe.svg"
            alt="Palm Leaf"
            className="palm-leaf-overlay"
          />
          <img
            src="/Images/Vector.svg"
            alt="Bottom Leaf"
            className="leaf-bottom"
          />
          <div className="offcanvas-header text-white">
            <h5 className="offcanvas-title" id="offcanvasRightLabel"></h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body text-white d-flex flex-column justify-content-between p-4">
            <ul className="navbar flex-column gap-4 mt-0.5" style={{ listStyle: 'none' }}>
              <li>
                <Link to="/" className="text-white text-decoration-none offcanvas-link">
                  <img className='off-image' src="/Images/Karikku logo (1) 1.png" alt="Logo" />
                </Link>
              </li>
              <li>
                <NavLink to="/" className={({ isActive }) =>
                  `offcanvas-link ${isActive ? "active-link" : "text-white"}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/store" className={({ isActive }) =>
                  `offcanvas-link ${isActive ? "active-link" : "text-white"}`}>
                  Stores
                </NavLink>
              </li>
              {combinedAuthState && (
                <li>
                  <NavLink to="/order-details" className={({ isActive }) =>
                    `offcanvas-link ${isActive ? "active-link" : "text-white"}`}>
                    My Orders
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/blogs" className={({ isActive }) =>
                  `offcanvas-link ${isActive ? "active-link" : "text-white"}`}>
                  Blog
                </NavLink>
              </li>
              <li>
                <NavLink to="/products" className={({ isActive }) =>
                  `offcanvas-link ${isActive ? "active-link" : "text-white"}`}>
                  Our Products
                </NavLink>
              </li>
              {combinedAuthState ? (
                <>
                  <li>
                    <NavLink to="/wishlist" className={({ isActive }) =>
                      `offcanvas-link ${isActive ? "active-link" : "text-white"}`}>
                      Wishlist
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/cart" className={({ isActive }) =>
                      `offcanvas-link ${isActive ? "active-link" : "text-white"}`}>
                      Cart
                    </NavLink>
                  </li>
                </>
              ) : (
                <li>
                  <NavLink to="/about-us" className={({ isActive }) =>
                    `offcanvas-link ${isActive ? "active-link" : "text-white"}`}>
                    About Us
                  </NavLink>
                </li>
              )}
            </ul>

            <div className="text-center mt-4">
              <div
                className={`btn-login-reg rounded-pill px-4 ${combinedAuthState ? 'btn-danger text-white' : 'btn-light text-success'
                  }`}
                onClick={handleAuthButtonClick}
              >
                <span className={combinedAuthState ? 'logout' : 'login'}>
                  {combinedAuthState ? 'Logout' : 'Login / Register'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal - Only render when not authenticated */}
      {loginModalIsOpen && !combinedAuthState && (
        <LoginModal
          onClose={closeLoginModal}
          onContinue={openOtpModal}
          onSignup={openSignupModal}
        />
      )}

      {/* OTP Modal - Only render when not authenticated */}
      {otpModalIsOpen && !combinedAuthState && (
        <OtpLoginModal
          onClose={closeOtpModal}
          otpSession={otpSessionData.otpSession}
          mobileNumber={otpSessionData.mobileNumber}
          onLoginSuccess={handleLoginSuccess}
          onSignupRequired={handleSignupRequired}
        />
      )}

      {/* Signup Modal — opens Login modal after successful signup */}
      {SignupModalIsOpen && !combinedAuthState && (
        <SignupLoginModal
          onClose={closeSignupModal}
          onLogin={openLoginAfterSignup}
          onSignupSuccess={handleLoginSuccess}
        />
      )}

      {/* LoginModal2 — email+password login, opened after signup or manually */}
      {LoginModal2IsOpen && !combinedAuthState && (
        <LoginModal2
          onClose={closeLoginModal2}
          onSignup={openSignupModal}
          prefillEmail={prefillSignupEmail}
        />
      )}

      {/* Email Modal - Render when authenticated but email might be missing */}
      {emailModalIsOpen && combinedAuthState && (
        <EmailModal onClose={handleEmailModalClose} />
      )}

      {/* Logout Confirmation Modal - Only render when authenticated */}
      {logoutConfirmModalIsOpen && combinedAuthState && (
        <div className="logout-confirmation-modal">
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body">
                  <p className="logout-message">Are you sure you want to logout?</p>
                  <p className="logout-description">You will need to login again to access your account.</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeLogoutConfirmModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        {' '}Logging out...
                      </>
                    ) : (
                      'Logout'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;