import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.scss'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa'

const Footer = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubscribe = () => {
        if (!email) {
            setMessage('Please enter an email address.');
            setIsError(true);
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage('Please enter a valid email address.');
            setIsError(true);
            return;
        }

        setMessage('Subscribed successfully!');
        setIsError(false);
        setEmail('');
    };

    return (
        <div className='FootermainWrapper'>
            <img className='vector' src="/Images/footer-vector cr.png" alt="" />
            <div className="footer">
                <div className="container-fluid px-4">
                    {/* Newsletter Section */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-12 col-md-8 col-lg-6 text-center newsletter-outer-line">
                            <div className="karikku-logo mb-3">
                                <img src="/Images/Karikku-footer-logo.svg" alt="Karikku" className="logo" />
                            </div>
                            <h3 className="newsletter-title mb-4">
                                Subscribe to Karikku for<br />
                                future updates
                            </h3>
                            <div className="newsletter-form">
                                <div className="email">
                                    <input 
                                        type="email" 
                                        className="form-control newsletter-input" 
                                        placeholder='Your email'
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setMessage(''); // clear message on typing
                                        }}
                                    />

                                </div>
                                <div className="subscribe-btn">
                                    <button className="btn btn-success newsletter-btn" onClick={handleSubscribe}>Subscribe</button>

                                </div>
                            </div>
                            {message && (
                                <div className={`validation-message ${isError ? 'error' : 'success'}`}>
                                    {message}
                                </div>
                            )}


                        </div>
                    </div>

                    {/* Footer Content */}


                    <div className="footer-content-full">
                        <div className="row main-row  footer-content-row ">
                            {/* Location Section */}
                            <div className="col-12 col-lg-4 mb-4 footer-locations-section">
                                <h5 className="footer-heading">Location</h5>
                                <p className="footer-text mb-2">
                                    Karikku ventures private limited,<br />
                                    Perinthalmanna, Kerala, India, <br /> 679322
                                </p>
                                <p className="footer-text mb-2">
                                    <span className='only-91'>  (+91)
                                    </span>
                                    <span className='number-only'>  8589 8585 22/44/66/88  </span> <br />
                                    <span className='sales-karikku-only'>
                                        sales@karikku.co <br />care@karikku.co

                                    </span>

                                </p>
                            </div>

                            {/* Quick Links 1 */}
                            <div className="col-6 col-lg-3 mb-3  quick-links">
                                <h5 className="footer-heading">Shop</h5>
                                <ul className="footer-links">
                                    <li><Link to="/products">Our products</Link></li>
                                    <li><Link to="/about-us">About us</Link></li>
                                    <li><Link to="/store">Stores</Link></li>
                                    {/* <li><Link to="/terms-of-service">Terms of service</Link></li> */}
                                    {/* <li><Link to="/blogs">Blog</Link></li> */}
                                    {/* <li><Link to="/process">Our process</Link></li> */}
                                    <li><Link to="/Faq">Faq</Link></li>
                                </ul>
                            </div>

                            {/* Quick Links 2 */}
                            <div className="col-6 col-lg-3 mb-4 quick-links">
                                <h5 className="footer-heading">Help</h5>
                                <ul className="footer-links">
                                    <li><Link to="/privacy-policy">Privacy policy</Link></li>

                                    {/* <li><Link to="/contact-us">Contact Us</Link></li> */}
                                    {/* <li><Link to="#">  Privacy policy </Link></li> */}
                                    {/* <li><Link to="/blogs">Blog</Link></li> */}
                                    <li><Link to="/refund-policy"> Refund policy</Link></li>
                                    <li><Link to="/shipping-policy"> Shipping policy</Link></li>
                                    <li><Link to="/terms-of-service">Terms & conditions</Link></li>
                                    <li><Link to="/contact-us">Contact Us</Link></li>

                                </ul>
                            </div>


                            {/* Social Media */}
                            <div className="col-12 col-lg-2 mb-4">
                                <div className="social-links">
                                    <Link to="https://www.linkedin.com/in/karikku-india-8685ba238" className="social-link">
                                        <FaLinkedinIn />
                                    </Link>
                                    <Link to="https://www.facebook.com/share/16duaYVySd/" className="social-link">
                                        <FaFacebookF />
                                    </Link>
                                    <Link to="https://www.instagram.com/karikkuindia/?hl=en" className="social-link">
                                        <FaInstagram />
                                    </Link>
                                    <Link to="https://youtube.com/@karikkuindia" className="social-link">
                                        <FaYoutube />
                                    </Link>
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="row mt-4 pt-4 border-top">
                        <div className="col-lg-12 col-sm-12 col-md-12 col-12">
                            <p className="footer-copyright mb-0">
                                Karikku@All Rights Reserved
                            </p>
                        </div>
                        <div className="col-lg-12 col-md-4 col-sm-4 col-4 text-md-end">
                            {/* <Link to="/privacy" className="privacy-link-first-mob">
                                Privacy policy   <br />
                            </Link> */}
                            {/* 
                            <Link to="/privacy" className="privacy-link-first-mob">
                                Refund policy
                            </Link> */}

                            {/* <Link to="/privacy" className="privacy-link-first">
                                Privacy policy
                            </Link> */}

                            {/* <Link to="/privacy" className="privacy-link-first">
                                Refund policy
                            </Link> */}

                        </div>

                        <div className="col-lg-12 col-md-12 col-sm-12 col-4 text-md-end">
                            {/* <Link to="/privacy" className="privacy-link">
                                Shipping policy
                            </Link> */}

                            {/* <Link to="/privacy" className="privacy-link">
                                Terms of service
                            </Link> */}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer