import React from 'react'
import './OurStory.scss'
import ExploreBtn from '../../Theme/Button/ExploreBtn'
import { Link } from 'react-router-dom'

const OurStory = () => {
    return (
        <div className='OurStoryMainWrapper'>
            <div className="our-story">
                <div className="our-story-leaf">
                    <img className='our-leaf' src="./Images/our-story-leaf.png" alt="" />
                </div>
                <div className="row main-container-two">
                    <div className="col-lg-6 col-md-12 our-story-left">
                        <div className="image-section">


                            <img className='arrow' src="./Images/Arrow.svg" alt="" />
                            <img className='forest' src="./Images/story-forest.svg" alt="" />
                            <img className='coconut-1' src="./Images/story-coconut-1.png" alt="" />
                            <img className='coconut-2' src="./Images/story-coconut-2.png" alt="" />
                            <img className='coconut-3' src="./Images/story-coconut-3.png" alt="" />

                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6 our-story-right">
                        <img className='our-story-logo' src="./Images/karikku-our-story-logo.png" alt="" />
                        <div className="our-story-head">
                            <h3>Our Story</h3>
                            <h2>Savour the spirit <br className="d-none d-md-block" /> of Kerala's <br className="d-none d-md-block" /> coconuts </h2>
                            <div className="our-story-description">
                                <p>At <span>Karikku</span>, our journey is deeply intertwined with the lush landscapes of Kerala, where coconuts flourish under nature's nurturing care. We are committed to delivering products that encapsulate the purity and richness of our homeland.</p>
                            </div>
                            <div className="d-flex justify-content-center justify-content-lg-start">
                                {/* <Link to={'/products'}><ExploreBtn buttonText='Explore our products' /></Link> */}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bottom-arrow">
                    <img src="./Images/Arrow-bottom.svg" alt="" />
                </div>
                <div className="our-story-bottom-description">
                    <p>Karikku offers pure and natural products, including tender coconut water sourced from <span>Kerala's coastal groves, <span style={{ color: "#3DAE4A" }}> rich in electrolytes and free from additives</span>, and double-filtered coconut oil crafted from handpicked coconuts, suitable for cooking, skincare, and haircare.</span></p>
                </div>
            </div>
        </div>
    )
}

export default OurStory