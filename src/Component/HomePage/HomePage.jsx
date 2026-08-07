import React, { useEffect } from 'react'
import Banner from './Banner/Banner'
import About from './About/About'
import './HomePage.scss'
import OneDrop from './OneDrop/OneDrop'
import OurStory from './OurStory/OurStory'
import ProductCards from './ProductCards/ProductCards'
import Commitment from './Commitment/Commitment'
import GreenBanner from './GreenBanner/GreenBanner'
import FollowusandBlog from './FollowusandBlog/FollowusandBlog'
import Footer from '../common/Footer/Footer'
import Navbar from '../common/Navbar/Navbar'

import { useAuth } from '../../store/hook/useUser'
import WhatsAppFloat from '../common/Whatsapp/WhatsappFloat'

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  // log user details on page load
  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ Logged-in user details:", user);
    } else {
      console.log("❌ No user is logged in");
    }
  }, [user, isAuthenticated]);

  return (


    <div className='HomePageWrapper mt-3'>
      <Navbar bgColor={"#FFFFFF"} />
    
      <Banner />
      <About />
      <OneDrop />
      <OurStory />
      <ProductCards />
      <Commitment />
      <GreenBanner />
      <FollowusandBlog />

      <WhatsAppFloat/>
      <Footer />



    </div>
  )
}

export default HomePage
