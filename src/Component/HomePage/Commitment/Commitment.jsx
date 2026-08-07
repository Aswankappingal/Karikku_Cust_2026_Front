import React from 'react'
import './Commitment.scss'
import { MdExplore } from 'react-icons/md'
import ExploreBtn from '../../Theme/Button/ExploreBtn'
import { Link } from 'react-router-dom'
const Commitment = () => {
    return (
        <div className='CommitmentMainWrapper'>
            {/* <img className='gradient' src="./Images/Vector-commit.svg" alt="" /> */}

            <div className="commitment-head">
                <h2>Commitment to  <br className="d-none d-md-block" /> Sustainability and  <br className="d-none d-md-block" /> Community</h2>
                <div className="commitment-description">
                    <p>Beyond delivering exceptional products, we are dedicated to sustainable practices that support local farmers and preserve the environment. By choosing Karikku, you are not only experiencing the true essence of Kerala but also contributing to a tradition that values purity, health, and community well-being.</p>
                </div>
                <Link to={'/products'}><ExploreBtn buttonText='Explore our products' arrowBgcolor='#3DAE4A' /></Link>
            </div>
            <div className="container-fluid commitment">
                <div className="commitment-images">

                    <img className='img1' src="./Images/coconut-still-life 1.svg" alt="" />
                    <img className='img2' src="./Images/broked coconut.svg" alt="" />
                    <img className='img3' src="./Images/commit-vector.svg" alt="" />
                    <img className='img4' src="./Images/Karikku logo-bg-removed.svg" alt="" />
                    <img className='img5' src="./Images/commit-forest.svg" alt="" />
                    <img className='img6' src="./Images/coconut-man-1.svg" alt="" />
                    <img className='img7' src="./Images/coconut-still-life (2) 1.svg" alt="" />
                    <img className='img8' src="./Images/coconut-man-2.svg" alt="" />
                    {/* <img className='img8' src="./Images/our-story-gradient.png" alt="" /> */}

                </div>

            </div>
            <div className="container commitment-features">
                <div className="row">
                    <div className="col-lg-3">
                        <img src="./Images/hydration-logo.svg" alt="" />
                        <div className="feature-head">
                            <h3>Natural Hydration</h3>
                        </div>
                        <div className="feature-para">
                            <p>
                                Karikku's Tender Coconut Water is rich in electrolytes, providing effective hydration.
                            </p>
                        </div>
                    </div>
                    <div className="col-lg-3">
                        <img src="./Images/nutrient-logo.svg" alt="" />
                        <div className="feature-head">
                            <h3>Nutrient Rich</h3>
                        </div>
                        <div className="feature-para">
                            <p>
                                Contains essential nutrients like vitamin C and potassium, supporting overall health
                            </p>
                        </div>
                    </div>                    <div className="col-lg-3">
                        <img src="./Images/pure-natural-logo.svg" alt="" />
                        <div className="feature-head">
                            <h3>100% Pure and Natural</h3>
                        </div>
                        <div className="feature-para">
                            <p>
                                Free from chemicals, additives, and preservatives, ensuring a natural product
                            </p>
                        </div>
                    </div>
                    <div className="col-lg-3">
                        <img src="./Images/verstile-logo.svg" alt="" />
                        <div className="feature-head">
                            <h3>Versatile Use</h3>
                        </div>
                        <div className="feature-para">
                            <p>
                                Karikku's coconut oil suitable for cooking, skincare, and haircare, offering multiple health benefits.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Commitment
