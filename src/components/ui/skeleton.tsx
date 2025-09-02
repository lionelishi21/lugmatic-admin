import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`} {...props} />
);

export default Skeleton;

