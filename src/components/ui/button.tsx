import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
  size?: string;
};

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export default Button;

