// Button.jsx component

import './Button.css';

export const Button = ({ children, onClick, className, ...props }) => {
  return (
    <button className={`button ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};
