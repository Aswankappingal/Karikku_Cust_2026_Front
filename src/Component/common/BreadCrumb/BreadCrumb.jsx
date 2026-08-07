import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.scss';

const Breadcrumb = ({ items }) => {
  return (
    <div className="breadcrumb-wrapper">
      <nav className="breadcrumb-nav">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index === items.length - 1 ? (
              // Last item - not clickable
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              // Clickable items
              <Link to={item.path} className="breadcrumb-link">
                {item.label}
              </Link>
            )}
            
            {/* Add separator except for the last item */}
            {index < items.length - 1 && (
              <span className="breadcrumb-separator">›</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

export default Breadcrumb;
