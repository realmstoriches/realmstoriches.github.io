
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, title, className, actions }) => {
  return (
    <div className={`bg-slate-800 shadow-xl rounded-xl overflow-hidden ${className || ''}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
    