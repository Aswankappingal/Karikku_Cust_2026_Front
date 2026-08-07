import React, { useState } from 'react'
import { BsArrowUpRightCircleFill } from 'react-icons/bs'

const ExploreBtn = ({ 
  buttonText, 
  btnBgColor = '#FFFFFF', 
  arrowBgcolor, 
  btnColor = '#0E3E13', 
  borderColor = '1px solid #0E3E13',
  hoverBgColor,  
  hoverTextColor,
  hoverArrowColor,
  hoverBorderColor
}) => {
  // Add state to track hover
  const [isHovered, setIsHovered] = useState(false)
  
  const buttonStyle = {
    marginTop: '2rem',
    color: isHovered && hoverTextColor ? hoverTextColor : btnColor,
    padding: '7px 7px 7px 15px',
    backgroundColor: isHovered && hoverBgColor ? hoverBgColor : btnBgColor,
    border: isHovered && hoverBorderColor ? hoverBorderColor : borderColor,
    fontFamily: 'General Sans',
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '125%',
    letterSpacing: '0%',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease', // Add smooth transition for hover effect
  }

  const iconStyle = {
    marginLeft: '12px',
    width: '24px',
    height: '24px',
    color: isHovered && hoverArrowColor ? hoverArrowColor : arrowBgcolor||'#3DAE4A',
    transition: 'all 0.3s ease', // Add smooth transition for the icon color
   
    
  }

  return (
    <div>
      <button 
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {buttonText}
        <BsArrowUpRightCircleFill style={iconStyle} />
      </button>
    </div>
  )
}

export default ExploreBtn