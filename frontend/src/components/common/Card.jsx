import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  variant = 'default',
  padding = true,
  hoverable = false,
  onClick,
  className = '',
  header,
  footer,
  ...props 
}) => {
  const cardClasses = [
    'card',
    `card-${variant}`,
    padding && 'card-padded',
    hoverable && 'card-hoverable',
    onClick && 'card-clickable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      {...props}
    >
      {header && (
        <div className="card-header">
          {header}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;


