import React from 'react';

export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ children, className = '', ...props }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${className}`} {...props}>{children}</span>
);

export default Badge;

