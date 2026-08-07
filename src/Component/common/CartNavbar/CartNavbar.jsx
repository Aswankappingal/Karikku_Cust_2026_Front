import React, { useState } from 'react';
// import { ShoppingCart, Home, MapPin, CreditCard } from 'lucide-react';
import { FaCartShopping } from 'react-icons/fa6';
import { HiCreditCard } from 'react-icons/hi';
import { MdHomeFilled, MdVerified } from 'react-icons/md';
import './cartNavbar.scss'
import { Link, useLocation } from 'react-router-dom';

const CartNavbar = () => {
  const location = useLocation();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const currentPath = location.pathname;

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);
  
  // Helper function to determine if a path is active
  const isActive = (path) => currentPath === path;

  return (
    <div className="cartNavbarWrapper">
      <nav className="navbar navbar-expand-lg navbar-light bg-white  py-3">
        <div className="container-fluid  px-2 px-md-3 px-lg-5">
          {/* Left - Logo */}
          <div className="navbar-brand d-flex align-items-center">
           <Link to={'/'}>
            <img
              src="./Images/Karikku logo-bg-removed.svg"
              alt="Karikku"
              height="40"
            />
           </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="navbar-toggler border-0 d-lg-none"
            type="button"
            onClick={handleShow}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Desktop Layout */}
          <div className="collapse navbar-collapse">
            <div className="d-flex w-100 justify-content-between align-items-center">

              {/* Left spacer for desktop */}
              <div style={{ flex: 1 }}></div>

              {/* Center - Navigation Icons */}
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex gap-2 align-items-center text-decoration-none">
                  <div className={`icon d-flex align-items-center justify-content-center ${
                    isActive('/cart') 
                      ? 'active-icon' 
                      : ''
                  }`} style={isActive('/cart') ? { width: '42px', height: '42px' } : {}}>
                    <FaCartShopping size={18} className={isActive('/cart') ? 'text-white' : 'text-success'} />
                  </div>
                  <small className={`fw-medium ${isActive('/cart') ? 'text-success' : 'text-success'}`}>Cart</small>
                </div>
                <div className="divider"></div>

                <div className="d-flex gap-2 align-items-center text-decoration-none">
                  <div className={`icon d-flex align-items-center justify-content-center ${
                    isActive('/address') 
                      ? 'active-icon' 
                      : ''
                  }`} style={isActive('/address') ? { width: '42px', height: '42px' } : {}}>
                    <MdHomeFilled size={18} className={isActive('/address') ? 'text-white' : 'text-muted'} />
                  </div>
                  <small className={isActive('/address') ? 'text-success' : 'text-muted'}>Address</small>
                </div>
                <div className="divider"></div>

                <div className="d-flex gap-2 align-items-center text-decoration-none">
                  <div className={`icon d-flex align-items-center justify-content-center ${
                    isActive('/payment') 
                      ? 'active-icon' 
                      : ''
                  }`} style={isActive('/payment') ? { width: '42px', height: '42px' } : {}}>
                    <HiCreditCard size={18} className={isActive('/payment') ? 'text-white' : 'text-muted'} />
                  </div>
                  <small className={isActive('/payment') ? 'text-success' : 'text-muted'}>Payment</small>
                </div>
              </div>

              {/* Right - Security Badge */}
              <div className="d-flex align-items-center" style={{ flex: 1, justifyContent: 'flex-end' }}>
                <div className="d-flex align-items-center text-success">
                  <div className="px-2"><MdVerified size={30} />                  </div>
                  <small className="fw-medium">
                    100% Secure payments.<br />
                    Shop with confidence!
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Offcanvas */}
      <div className={`offcanvas offcanvas-end ${showOffcanvas ? 'show' : ''}`}
        tabIndex="-1"
        style={{ visibility: showOffcanvas ? 'visible' : 'hidden' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">
            <img
              src="./Images/Karikku logo-bg-removed.svg"
              alt="Karikku"
              height="40"
            />
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="d-flex flex-column gap-3">
            <div className={`d-flex align-items-center p-3 border rounded text-decoration-none ${
              isActive('/cart') ? '' : ''
            }`}>
              <div className={`icon rounded-circle p-2 me-3 ${
                isActive('/cart') 
                  ? 'active-icon' 
                  : ''
              }`}>
                <FaCartShopping size={20} className={isActive('/cart') ? 'text-white' : 'text-success'} />
              </div>
              <span className={`fw-medium ${isActive('/cart') ? '' : 'text-success'}`}>Cart</span>
            </div>

            <div className={`d-flex align-items-center p-3 border rounded text-decoration-none ${
              isActive('/address') ? 'bg-success' : ''
            }`}>
              <div className={`icon rounded-circle p-2 me-3 ${
                isActive('/address') 
                  ? '' 
                  : ''
              }`}>
                <MdHomeFilled size={20} className={isActive('/address') ? '' : 'text-muted'} />
              </div>
              <span className={isActive('/address') ? '' : 'text-muted'}>Address</span>
            </div>

            <div className={`d-flex align-items-center p-3 border rounded text-decoration-none ${
              isActive('/payment') ? 'bg-success' : ''
            }`}>
              <div className={`icon rounded-circle p-2 me-3 ${
                isActive('/payment') 
                  ? '' 
                  : ''
              }`}>
                <HiCreditCard size={20} className={isActive('/payment') ? '' : 'text-muted'} />
              </div>
              <span className={isActive('/payment') ? 'text-white' : 'text-muted'}>Payment</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-light rounded">
            <div className="d-flex align-items-center text-success">
              <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
              <small className="fw-medium">
                100% Secure payments. Shop with confidence!
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for offcanvas */}
      {showOffcanvas && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={handleClose}
        ></div>
      )}
    </div>
  );
};

export default CartNavbar;