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
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <div className="left-content">
                                <div className="contactus-lef-side">
                                    <h2>Contact Us</h2>
                                    <h1>We’d love to hear <br />from you!</h1>
                                    <p>Got questions about our natural products, bulk orders, or partnership opportunities? Drop us a message – we’re here to help!</p>
                                    {/* <ExploreBtn className='' buttonText='read more about us'/> */}
     
                                    <Link to='/about-us'>
                                        <button className='ReadMoreBtn'>
                                            Read more about us

                                            <BsArrowUpRightCircleFill className='btn-icon' />
                                        </button>
                                    </Link>

                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                            <ContactForm />
                        </div>
                    </div>

                    <div className="container commitment-features">
                        <div className="row">
                            <div className="col-lg-3 col-md-6 col-sm-4">
                                <img src="./Images/contact-location.svg" alt="" />
                                <div className="feature-head">
                                    <h3>Address</h3>
                                </div>
                                <div className="feature-para">
                                    <p>
                                        Karikku ventures private limited <br />perinthakmanna,kerala,india,679322
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-4">
                                <img src="./Images/contact-msg.svg" alt="" />
                                <div className="feature-head">
                                    <h3>Emails</h3>
                                </div>
                                <div className="feature-para">
                                    <p>
                                        care@karikku.co <br />
                                        sales@karikku.co
                                    </p>
                                </div>
                            </div>                    <div className="col-lg-3 col-md-6 col-sm-4 ">
                                <img src="./Images/contact-clock.svg" alt="" />
                                <div className="feature-head">
                                    <h3>Open</h3>
                                </div>
                                <div className="feature-para">
                                    <p>
                                        Mon - Sat  :9.30am - 6.00pm <br />
                                        {/* Saturday- Sunday: 10 am- 10pm */}
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <img src="./Images/contact-phone.svg" alt="" />
                                <div className="feature-head">
                                    <h3>call us</h3>
                                </div>
                                <div className="feature-para">
                                    <p>
                                        (+91)8589 8585 22 <br />
                                        (+91)8589 8585 44
                                    </p>
                                    {/* <p>
                                       (+91)8589 8585 66 <br />
                                       (+91)8589 8585 88
                                    </p> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="map-section">
                        <div className="map-container">
                            {/* <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15666.832865844273!2d76.21380879624957!3d10.985382510468837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7cd4a22db1855%3A0x41234b4a9e52a1cc!2sTHARA%20CART%20INDIA%20PVT%20LTD!5e0!3m2!1sen!2sin!4v1751866880569!5m2!1sen!2sin" style={{ width: '100%', height: '100%' }} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
                            <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d125361.95957810729!2d76.1428516!3d10.920912!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7cd55e35cec03%3A0x4b535c135113c33!2sKARIKKU%20VENTURES%20PRIVATE%20LIMITED!5e0!3m2!1sen!2sin!4v1776927080627!5m2!1sen!2sin" style={{ width: '100%', height: '100%' }} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                        </div>
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