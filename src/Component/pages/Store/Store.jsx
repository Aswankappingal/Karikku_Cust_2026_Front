import React from 'react'
import Breadcrumb from '../../common/BreadCrumb/BreadCrumb'
import Navbar from '../../common/Navbar/Navbar';
import './Store.scss'
import { IoSearch, IoSearchOutline } from 'react-icons/io5';
import { FaWhatsapp } from 'react-icons/fa';
import Footer from '../../common/Footer/Footer';

const Store = () => {
    const breadcrumbItems = [
        { label: 'Homepage', path: '/' },
        { label: 'Store', path: '/store' }
    ];

    // Branch data object
    const branches = [
        // {
        //     id: 1,
        //     name: 'Malappuram',
        //     image: '/Images/br-1.svg',
        //     address: 'Malappuram - Al-Marwa 3 District - Sultan bin Salman Road towards the west (between Al-Arbaeen Road and Al-Sab\'een Road)',
        //     email: 'sales@karikku',
        //     phone: '+91 1220 031 515',
        //     direction: '#'
        // },
        // {
        //     id: 2,
        //     name: 'Kozhikode',
        //     image: '/Images/br-2.svg',
        //     address: 'Kozhikode District - Sultan bin Salman Road towards the west (between Al-Arbaeen Road and Al-Sab\'een Road)',
        //     email: 'sales@karikku',
        //     phone: '+91 1220 031 515',
        //     direction: '#'
        // },
        {
            id: 3,
            name: 'INDIA (Head Office)',
            image: '/Images/br-3.svg',
            address: 'KARIKKU VENTURES PRIVATE LIMITED, PERINTHALMANNA, KERALA, INDIA, 679322',
            email: 'sales@karikku.co',
            phone: '+91 8589 8585 44/22/88',
            direction: '#'
        }
        // {
        //     id: 4,
        //     name: 'Kochi',
        //     image: '/Images/br-4.svg',
        //     address: 'Kochi - Al-Marwa 3 District - Sultan bin Salman Road towards the west (between Al-Arbaeen Road and Al-Sab\'een Road)',
        //     email: 'sales@karikku',
        //     phone: '+91 1220 031 515',
        //     direction: '#'
        // },
        // {
        //     id: 5,
        //     name: 'Alappuzha',
        //     image: '/Images/br-5.svg',
        //     address: 'Alappuzha - Al-Marwa 3 District - Sultan bin Salman Road towards the west (between Al-Arbaeen Road and Al-Sab\'een Road)',
        //     email: 'sales@karikku',
        //     phone: '+91 1220 031 515',
        //     direction: '#'
        // }
    ];

    // Working hours data
    const workingHours = [
        {
            id: 1,
            days: 'Saturday-Sunday',
            periods: [
                { time: '10:30 AM - 1:30 PM' },
                { time: '2:30 PM - 6:30 PM' }
            ]
        },
        {
            id: 2,
            days: 'Monday-Friday',
            periods: [
                { time: '10:30 AM - 1:30 PM' },
                { time: '2:30 PM - 6:30 PM' }
            ]
        }
    ];

    return (
        <div className='storeMainWrapper'>
            <div className="container-fluid p-0">
                <Navbar />
                <div className="gradient">
                    <img src="/Images/Stores-mask.svg" className='mask-img' alt="" />
                    <img src="" alt="" />
                    <div className="container breadcrumb">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <div className="our-branches">
                        <div className="branch-header">
                            <h3>Branches & Major Stores <span className='our-branches-span'>-</span><br />always close to you!</h3>
                        </div>
                        <img className='palm' src="/Images/palm-vector.svg" alt="" />
                        <div className="branch-para">
                            <p>Visit a Store Near You for Exceptional Service
                                With locations in India, Qatar, and the UAE, we’re dedicated to providing you with unmatched convenience, quality, and excellence. </p>
                        </div>
                    </div>

                    <div className="sub-head">
                        <h3>Branches & Major Stores</h3>
                        <div className="search-bar">
                            <input type="text" placeholder='Search for store by code' />
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
                            {branches.map((branch) => (
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
                                            <a className='direction' href={branch.direction}>Get direction</a>
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
                        </div>
                    </div>

                    <div className="working-days">
                        {/* <h3 className='main-head'>Working hours</h3> */}
                        <div className="content">


                            {/* {workingHours.map((schedule, index) => (
                                <React.Fragment key={schedule.id}>
                                    {index > 0 && <div className="seperator"></div>}
                                    <div className="left">
                                        <h3>{schedule.days}</h3>
                                        {schedule.periods.map((period, periodIndex) => (
                                            <h6 key={periodIndex}>{period.time}</h6>
                                        ))}
                                    </div>
                                </React.Fragment>
                            ))} */}




                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Store; 