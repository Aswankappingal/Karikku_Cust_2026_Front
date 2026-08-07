import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './EmptyCart.scss'
import ExploreBtn from '../../Theme/Button/ExploreBtn'
import Footer from '../../common/Footer/Footer'
import Navbar from '../../common/Navbar/Navbar'

const EmptyCart = () => {
    const navigate = useNavigate()



    return (
        <div className="Empty-cart">
            <Navbar />
            <div className="content">
                <div className="img-main">
                    <img src="/Images/EmptyCart-Sun.svg" className='img-sun' alt="" />
                    <img src="/Images/EmptyCart-Cart.png" className='img-cart' alt="" />
                    <img src="/Images/EmptyCart-Mountain.png" className='img-mountain' alt="" />
                </div>
                <div className="labels">
                    <h3> OOPS! Your Cart is Empty</h3>
                    <p>Get our amazing products & offers</p>
                    <Link to={'/wishlist'}>
                        <ExploreBtn buttonText='Add item from wishlist' />
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default EmptyCart;