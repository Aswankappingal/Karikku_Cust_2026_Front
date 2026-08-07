import React from 'react'
import './GreenBanner.scss'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { MdStar } from 'react-icons/md';
import ExploreBtn from '../../Theme/Button/ExploreBtn';
import { Link } from 'react-router-dom';

const GreenBanner = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  return (
    <div className='FollowusMainWrapper'>
      <div className="container-fluid">
        <div className="bg-image">
          <img className='main-bg' src="./Images/bg-slide.svg" alt="" />
          <img className='mobile-bg' src="./Images/bg-background-mobile.png" alt="" />

          <div className="slider-overlay">
            <Slider className='slider' {...settings}>
              <div className="slide-content">
                <div className="stars">
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                </div>
                <h2 className="quote">"The only limit to our realization of tomorrow is our doubts of today."</h2>
                <p className="author">—Franklin D. Roosevelt</p>
              </div>
              <div className="slide-content">
                <div className="stars">
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                </div>
                <h2 className="quote">"Success is not final, failure is not fatal: It is the courage to continue that counts."</h2>
                <p className="author">—Winston Churchill</p>
              </div>
              <div className="slide-content">
                <div className="stars">
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                </div>
                <h2 className="quote">"In the middle of every difficulty lies opportunity."</h2>
                <p className="author">—Albert Einstein</p>
              </div>
              <div className="slide-content">
                <div className="stars">
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                  <MdStar className='star' />
                </div>
                <h2 className="quote">"Don't watch the clock; do what it does. Keep going."</h2>
                <p className="author">—Sam Levenson</p>
              </div>
            </Slider>
          </div>

          <div className="green-banner-wrapper">
            <div className="green-banner">
              <div className="banner-content">
                <div className="banner-label">
                  <h3>Love to hear from you!</h3>
                  <p>Whether you have questions about our products, need assistance, or are interested in collaborations, feel free to reach out</p>
                  <Link to={'/contact-us'} className="banner-image-link">
                    <ExploreBtn buttonText='Contact us today' btnBgColor='white' borderColor='white' />
                  </Link>
                </div>

                <div className="banner-images">
                  <img className='girl' src="./Images/girl.svg" alt="Contact us" />
                  <img className='banner-icon' src="./Images/girl-banner-icon.svg" alt="" />

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GreenBanner