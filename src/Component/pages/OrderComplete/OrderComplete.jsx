import React from 'react'
import { useState } from 'react';
import './OrderComplete.scss'
import { Link } from 'react-router-dom'
import ExploreBtn from '../../Theme/Button/ExploreBtn'
import { MdDone } from 'react-icons/md'

const OrderComplete = () => {
 
    
  return (
    <div className='OrderCompleteWrapper'>
          {/* <img src="/Images/crow.svg" alt="" className="crow-img" /> */}
      <div className="content">
        <div className="icon-background">
          <div className="layer">
              <div className="success">
                <MdDone className='icon' />
            </div>
          </div>
        </div>
         <div className="labels">
          <h3> Order placed Successful!</h3>
          <p>Payment of ₹15600 for Karikku pure <br class="d-none d-sm-block" /> Coconut Oil is successfully paid</p>
          <div className="transaction">
            <p>Transaction ID</p>
            <h5>5645647</h5>
          </div>
          <Link to={'/'}>
          <ExploreBtn  buttonText='Continue shopping'/>

          </Link>
        </div>
        <div className="img-main">
          <img src="/Images/payment-vector.svg" alt="" />
        </div>
       
      </div>
    </div>
  )
}

export default OrderComplete
