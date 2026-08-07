import React from 'react'
import './PaymentFailed.scss'
import { Link } from 'react-router-dom'
import ExploreBtn from '../../Theme/Button/ExploreBtn'
import { MdDone } from 'react-icons/md'
import { FaExclamation } from 'react-icons/fa6'

const PaymentFailed = () => {
  return (
    <div className='payment'>
       {/* <img src="/Images/crow.svg" alt="" className="crow-img" /> */}
      <div className="content">
        <div className="icon-background">
          <div className="layer">
              <div className="success">
                <FaExclamation  className='icon' />

            </div>
          </div>
        </div>
         <div className="labels">
          <h3> Oh, your Payment Failed!</h3>
          <p>Don't worry, we’ll try your payment again <br class="d-none d-sm-block" /> over the next few days.</p>
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

export default PaymentFailed
