import React from 'react';

const variantStyles = {
  primary: {
    backgroundColor: '#ffffff', 
    color: '#343434',
    border: '1px solid #d1d5db'
  },
  secondary: {
    backgroundColor: '#94a3b8', 
    color: '#fff',
  },
  success: {
    backgroundColor: '#22c55e', 
    color: '#fff',
  },
  danger: {
    backgroundColor: 'rgb(236, 126, 126)', // red-500
    color: '#fff',
  },
  gray: {
    backgroundColor: '#e5e7eb', // gray-200
    color: '#1f2937', // gray-800
  },
  disabled: {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  }
};

const Button = ({
  children,
  onClick,
  style = {},
  disabled = false,
  type = 'button',
  variant = 'primary'
}) => {
  const baseStyle = {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ...(
      disabled
        ? variantStyles.disabled
        : variantStyles[variant] || variantStyles.primary
    ),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
    >
      {children}
    </button>
  );
};

export default Button;
