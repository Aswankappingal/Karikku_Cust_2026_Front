import React, { useState } from 'react'
import Breadcrumb from '../../common/BreadCrumb/BreadCrumb'
import Navbar from '../../common/Navbar/Navbar';
import './Store.scss'
import { IoSearch, IoSearchOutline } from 'react-icons/io5';
import { FaWhatsapp } from 'react-icons/fa';
import Footer from '../../common/Footer/Footer';
import { Link } from 'react-router-dom';

const Store = () => {
    const breadcrumbItems = [
        { label: 'Homepage', path: '/' },
        { label: 'Store', path: '/store' }
    ];

    // Branch data object
    const branches = [
        {
            id: 3,
            name: 'INDIA (Head Office)',
            image: '/Images/br-3.svg',
            address: 'KARIKKU VENTURES PRIVATE LIMITED, PERINTHALMANNA, KERALA, INDIA, 679322',
            email: 'sales@karikku.co',
            phone: '+91 8589 8585 44/22/88',
            direction: 'https://maps.app.goo.gl/9WLAtLamQ3Nn6nwM7'
        }
    ];

    const [searchTerm, setSearchTerm] = useState('');

    const filteredBranches = branches.filter((branch) =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='storeMainWrapper'>
            <div className="container-fluid p-0">
                <Navbar />
                <div className="gradient">
                    <img src="/Images/Stores-mask.svg" className='mask-img' alt="Where to buy Karikku coconut water: map of retail partners" />
                    <div className="container breadcrumb">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <div className="our-branches">
                        <div className="branch-header">
                            <h1>Where to Buy Karikku Coconut Water</h1>
                            <p style={{ color: '#072C0B', fontWeight: 500, fontSize: '18px', marginTop: '4px' }}>Our Branches & Retail Outlets</p>
                        </div>
                        <img className='palm' src="/Images/palm-vector.svg" alt="" />
                        <div className="branch-para">
                            <p>
                                Experience authentic Kerala refreshment near you. Prefer home delivery? You can always{' '}
                                <Link to="/products" style={{ color: '#3DAE4A', fontWeight: 600, textDecoration: 'underline' }}>
                                    buy tender coconut water online
                                </Link>{' '}
                                and enjoy fresh bottles shipped right to your location.
                            </p>
                        </div>
                    </div>

                    <div className="sub-head">
                        <h3>Branches & Major Stores</h3>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder='Search for store by name or address'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="search-icon">
                                <IoSearch style={{ color: "#ffffff" }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* col-section */}
                <div className="branches">
                    <div className="container-fluid">
                        <div className="row">
                            {filteredBranches.length > 0 ? (
                                <>
                                    {filteredBranches.map((branch) => (
                                        <div key={branch.id} className="col-lg-4 col-md-6 col-sm-6 col-12">
                                            <div className="cards">
                                                <div className="card-image">
                                                    <img src={branch.image} alt={branch.name} />
                                                </div>
                                                <div className="labels">
                                                    <h4>{branch.name}</h4>
                                                    <div className="label-para">
                                                        <p>{branch.address}</p>
                                                    </div>
                                                    <a className='direction' href={branch.direction} target="_blank" rel="noopener noreferrer">Get direction</a>
                                                    <div className='contact-wp-icon'>
                                                        <div className="contact">
                                                            <p>Mail: {branch.email}</p>
                                                            <p className='call'>Call Us: <span className='call-num'>{branch.phone}</span></p>
                                                        </div>
                                                        <a href="https://wa.me/918589858522" target="_blank" rel="noopener noreferrer">
                                                            <div className="wp-icon">
                                                                <img src="/Images/Wp logo.svg" alt="WhatsApp" />
                                                            </div>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="Cards-down-section">
                                        <h4>
                                            Working Days : Monday - Saturday
                                        </h4>
                                        <p>
                                            Time : 9:30 AM - 6:00 PM.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="col-12 text-center my-5 w-100">
                                    <h4 style={{ color: '#fff' }}>No stores found</h4>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Retailer enquiry section */}
                    <div className="container my-5 p-4 rounded-4" style={{ backgroundColor: '#F3F9F1', border: '1px solid #D8EAD4' }}>
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <h4 style={{ fontFamily: 'Nohemi', fontSize: '24px', fontWeight: 600, color: '#072C0B', marginBottom: '8px' }}>
                                    Interested in becoming a Karikku retail partner?
                                </h4>
                                <p style={{ fontSize: '15px', color: '#4a5568', margin: 0 }}>
                                    Join our network of retail partners and supermarkets across Kerala and India. Reach out to our retail team today:
                                </p>
                            </div>
                            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                                <Link to="/contact-us" style={{ display: 'inline-block', backgroundColor: '#3DAE4A', color: '#fff', padding: '12px 28px', borderRadius: '50px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 15px rgba(61,174,74,0.3)' }}>
                                    contact karikku
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Store; 