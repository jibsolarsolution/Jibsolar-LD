'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '999px',
    fontFamily: 'var(--font-sora), sans-serif',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.65 : 1,
    transition: 'all 200ms ease',
    outline: 'none',
    border: 'none',
    textDecoration: 'none',
  };

  let variantStyle: React.CSSProperties = {};
  if (variant === 'primary') {
    variantStyle = {
      background: 'linear-gradient(135deg, #f2a71f, #ffce6d)',
      color: '#04140f',
      border: '1px solid transparent',
      boxShadow: disabled ? 'none' : '0 10px 24px -8px rgba(242, 167, 31, 0.55)',
    };
  } else if (variant === 'secondary') {
    variantStyle = {
      background: '#ffffff',
      color: '#04140f',
      border: '1px solid rgba(12, 30, 22, 0.18)',
    };
  } else if (variant === 'danger') {
    variantStyle = {
      background: '#b5493f',
      color: '#ffffff',
      border: '1px solid transparent',
    };
  } else if (variant === 'ghost') {
    variantStyle = {
      background: 'transparent',
      color: '#146b48',
    };
  }

  let sizeStyle: React.CSSProperties = {};
  if (size === 'sm') {
    sizeStyle = { padding: '8px 14px', fontSize: '13px' };
  } else if (size === 'lg') {
    sizeStyle = { padding: '14px 26px', fontSize: '16px' };
  } else {
    sizeStyle = { padding: '12px 20px', fontSize: '14px' };
  }

  return (
    <button
      style={{ ...baseStyle, ...variantStyle, ...sizeStyle, ...style }}
      disabled={disabled}
      className={`btn-interactive ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
