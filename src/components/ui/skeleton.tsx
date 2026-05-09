import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`animate-pulse bg-zinc-800 ${className}`} {...props} />
);

export default Skeleton;

