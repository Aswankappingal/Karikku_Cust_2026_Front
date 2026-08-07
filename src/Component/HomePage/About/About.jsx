import React from 'react'
import './About.scss'
import { Link } from 'react-router-dom'
import { BsArrowUpRightCircleFill } from 'react-icons/bs'
import ExploreBtn from '../../Theme/Button/ExploreBtn'

const About = () => {
  return (
    <div className='AboutMainWrapper'>
      <div className="about-top">
        <div className="about-header-section">
          <h3> Feel Freshness</h3>
          <h2 className='about-header-image'><img src="./Images/Coconut-leaf.svg" className='images-pure' alt="" /> Pure Hydration. <br className="d-none d-sm-block" /> Naturally! <img src="./Images/about us icon 2.png" alt="" />
          </h2>
        </div>
        <div className="description">
          <p>Refresh and replenish with nature's ultimate thirst quencher. Karikku Tender coconut water <br className="d-none d-md-block" /> is packed with electrolytes, naturally low in sugar, and bursting with tropical goodness.</p>
          <Link to={'/about-us'}><button>Read more

            {/* <span id='about-us'>about us</span>  */}
            <BsArrowUpRightCircleFill className='btn-icon' />
          </button></Link>
        </div>
      </div>
      {/* Achievement section */}
      {/* <div className="container achievements">
        <div className="row achv-main">
          <div className=" col-lg-3 achv-item">
            <h3>12,000+</h3>
            <p>Satisfied customers <br className="d-none d-md-block" /> enjoying our products daily.​</p>
          </div>
          <div className="col-lg-3 achv-item">
            <h3>100%</h3>
            <p> Pure, cold-pressed<br className="d-none d-md-block" /> coconut oil in every bottle.​</p>
          </div>
          <div className="col-lg-3 achv-item">
            <h3>5,000+</h3>
            <p> Liters of tender coconut water <br className="d-none d-md-block" />  delivered monthly.​</p>
          </div>
          <div className="col-lg-3 achv-item">
            <h3>75+</h3>
            <p> Retail partners <br className="d-none d-md-block" />  across Kerala.​</p>
          </div>
        </div>
      </div> */}

      <div className="container commitment-features">
        <div className="why-choose-head">
          <h2>Why choose karikku?</h2>
        </div>
        <div className="row choose-row">
          <div className="col-lg-3">
            <div className="why-images">
              <img src="./Images/why-2.svg" alt="" />
            </div>
            <div className="feature-head">
              <h3>100% Natural</h3>
            </div>
            <div className="feature-para">
              <p>
                No added sugar or Chemical preservatives.
              </p>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="why-images">
              <img src="./Images/why-1.svg" alt="" />
            </div>                        <div className="feature-head">
              <h3>Natural Hydration</h3>
            </div>
            <div className="feature-para">
              <p>
                Healthier than sugary drinks.
              </p>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="why-images">
              <img src="./Images/why-3.svg" alt="" />
            </div>
            <div className="feature-head">
              <h3>Rich in Electrolytes</h3>
            </div>
            <div className="feature-para">
              <p>
                Loaded with Potassium, Magnesium, and Calcium.
              </p>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="why-images">
              <img src="./Images/why-4.svg" alt="" />
            </div>
            <div className="feature-head">
              <h3>Low Calorie</h3>
            </div>
            <div className="feature-para">
              <p>
                The perfect refreshingly light drink.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Marquie Section */}
      <div className="container-fluid marque-main">
        <div className="marquee-container">
          <div className="marquee">
            <div className="pill image-pill"><img src="./Images/m1.svg" alt="Fresh fruits" /></div>
            <div className="pill text-pill">Freshness Inside</div>
            <div className="pill text-pill">Healthy Hydration</div>
            <div className="pill image-pill"><img src="./Images/m2.svg" alt="Hydration" /></div>
            <div className="pill text-pill">Nature's Goodness</div>
            <div className="pill image-pill"><img src="./Images/m3.svg" alt="Natural ingredients" /></div>
            <div className="pill text-pill">Savor the Purity</div>
            <div className="pill text-pill">Tropical Bliss</div>
            <div className="pill text-pill">Pure & Simple</div>
            <div className="pill image-pill"><img src="./Images/m5.svg" alt="Fresh fruits" /></div>
            <div className="pill text-pill">Sip the Sunshine</div>
            <div className="pill text-pill">Pure & simple</div>

          </div>
        </div>

        <div className="marquee-container">
          <div className="marquee reverse">
            <div className="pill text-pill">Nourish Naturally</div>
            <div className="pill text-pill">Vitality in Every Sip</div>
            <div className="pill text-pill">Wellness within</div>
            <div className="pill image-pill"><img src="./Images/m7.svg" alt="Hydration" /></div>
            <div className="pill text-pill">Sip the Sunshine</div>
            <div className="pill text-pill">Stay Refreshed</div>
            <div className="pill image-pill"><img src="./Images/m4.svg" alt="Sunshine" /></div>
            <div className="pill text-pill">Stay Refreshed</div>
            <div className="pill text-pill">Wellness in a Bottle</div>
            <div className="pill image-pill"><img src="./Images/m1.svg" alt="Refreshment" /></div>
            <div className="pill text-pill">Sip the Sunshine</div>

          </div>
        </div>

        <div className="marquee-container">
          <div className="marquee">
            <div className="pill image-pill"><img src="./Images/m5.svg" alt="Health drink" /></div>
            <div className="pill text-pill">Drink to Health</div>
            <div className="pill image-pill"><img src="./Images/m6.svg" alt="Energy" /></div>
            <div className="pill text-pill">Natural Energy Boost</div>
            <div className="pill text-pill">Feel the Freshness</div>
            <div className="pill text-pill">Hydrate & Thrive</div>
            <div className="pill image-pill"><img src="./Images/m2.svg" alt="Thriving" /></div>

            <div className="pill text-pill">Pure Hydration</div>
            <div className="pill text-pill">Tropical Delight</div>
            <div className="pill text-pill">Nature's Exilir</div>
            <div className="pill image-pill"><img src="./Images/m7.svg" alt="Freshness" /></div>

          </div>
        </div>

      </div>


    </div>
  )
}

export default About
