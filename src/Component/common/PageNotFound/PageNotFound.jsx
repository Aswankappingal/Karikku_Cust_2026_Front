import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './PageNotFound.scss'
import ExploreBtn from '../../Theme/Button/ExploreBtn'

const PageNotFound = () => {
  const navigate = useNavigate()

  

  return (
    <div className="page-not-found">
      <img src="/Images/crow.svg" alt="" className="crow-img" />
      <div className="content">
        <div className="img-main">
          <img src="/Images/404-vector.svg" alt="" />
        </div>
        <div className="labels">
          <h3> OOPS!</h3>
          <p>The page you were looking for doesn’t exist</p>
          <Link to={'/'}>
          <ExploreBtn  buttonText='Go to Home'/>

          </Link>
        </div>
      </div>
    </div>
  )
}

export default PageNotFound