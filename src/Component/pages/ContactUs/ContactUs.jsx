import React from 'react'
import './ContactUs.scss'
import ContactForm from './ContactForm'
import Footer from '../../common/Footer/Footer'
import ExploreBtn from '../../Theme/Button/ExploreBtn'
import Navbar from '../../common/Navbar/Navbar'
import ScrollToTopOnMount from '../../common/ScrollToTopOnMount'
import { BsArrowUpRightCircleFill } from 'react-icons/bs'
import { Link } from 'react-router-dom'

const ContactUs = () => {
    return (
        <div className='contact-Main-wrapper'>
            <Navbar />
            <ScrollToTopOnMount />
            <div className="contact-wrapper">
                <div className="container-fluid contact-hero-container">
                    <div className="row align-items-center">
                        <div className="col-12 col-md-12 col-lg-6">
                            <div className="left-content">
                                <div className="contactus-lef-side">
                                    <h1>Contact Karikku</h1>
                                    <h2>We’d love to hear <br />from you!</h2>
                                    <div className="girl-img-wrap">
                                        <img src="./Images/girl.svg" alt="Contact Karikku: customer support team" className="img-fluid my-2" />
                                    </div>
                                    <p className="contact-description">
                                        Got questions about our natural products, bulk orders, or partnership opportunities? Drop us a message – we’re here to help!
                                    </p>

                                    <div className="bulk-wholesale-section mt-4 p-3 rounded-3">
                                        <h5 className="section-subtitle">Bulk and Wholesale Orders</h5>
                                        <p className="section-text">
                                            Interested in commercial orders or supply? Browse our pack sizes and{' '}
                                            <Link to="/products" className="policy-link">
                                                buy tender coconut water online
                                            </Link>.
                                        </p>
                                    </div>

                                    <div className="order-support-section mt-3 p-3 rounded-3">
                                        <h5 className="section-subtitle">Order Support & Policies</h5>
                                        <p className="section-text">
                                            Have questions about dispatch or returns? View our{' '}
                                            <Link to="/shipping-policy" className="policy-link">
                                                karikku shipping policy
                                            </Link>{' '}
                                            and{' '}
                                            <Link to="/refund-policy" className="policy-link">
                                                karikku refund policy
                                            </Link>.
                                        </p>
                                    </div>

                                    <div className="read-more-wrapper mt-4">
                                        <Link to='/about-us'>
                                            <button className='ReadMoreBtn'>
                                                Read more about us
                                                <BsArrowUpRightCircleFill className='btn-icon' />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-12 col-lg-6">
                            <ContactForm />
                        </div>
                    </div>
                </div>

                <div className="container commitment-features">
                    <div className="row g-4">
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="feature-card">
                                <img src="./Images/contact-location.svg" alt="Location" className="feature-icon" />
                                <div className="feature-head">
                                    <h3>Address</h3>
                                </div>
                                <div className="feature-para">
                                    <p>
                                        Karikku ventures private limited <br />perinthalmanna, kerala, india, 679322
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="feature-card">
                                <img src="./Images/contact-msg.svg" alt="Email" className="feature-icon" />
                                <div className="feature-head">
                                    <h3>Emails</h3>
                                </div>
                                <div className="feature-para">
                                    <p>
                                        care@karikku.co <br />
                                        sales@karikku.co
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="feature-card">
                                <img src="./Images/contact-clock.svg" alt="Working Hours" className="feature-icon" />
                                <div className="feature-head">
                                    <h3>Open</h3>
                                </div>
                                <div className="feature-para">
                                    <p>
                                        Mon - Sat: 9.30am - 6.00pm
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="feature-card">
                                <img src="./Images/contact-phone.svg" alt="Phone" className="feature-icon" />
                                <div className="feature-head">
                                    <h3>Call us</h3>
                                </div>
                                <div className="feature-para">
                                    <p>
                                        (+91) 8589 8585 22 <br />
                                        (+91) 8589 8585 44
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="map-section">
                    <div className="map-container">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d125361.95957810729!2d76.1428516!3d10.920912!3m2!1i1024!2i768!4f13.1!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7cd55e35cec03%3A0x4b535c135113c33!2sKARIKKU%20VENTURES%20PRIVATE%20LIMITED!5e0!3m2!1sen!2sin!4v1776927080627!5m2!1sen!2sin" 
                            style={{ width: '100%', height: '100%', border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Karikku Location Map"
                        />
                    </div>
                </div>

                <div className="footer">
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default ContactUs
