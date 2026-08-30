import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'ACTIVE' | 'ONHOLD' | 'DELETED' | 'utm' | 'none' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  let style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'var(--font-inter), sans-serif',
    whiteSpace: 'nowrap',
  };

  if (variant === 'ACTIVE') {
    style.background = 'rgba(20, 107, 72, 0.12)';
    style.color = '#146b48';
  } else if (variant === 'ONHOLD') {
    style.background = 'rgba(242, 167, 31, 0.18)';
    style.color = '#8a5a00';
  } else if (variant === 'DELETED') {
    style.background = 'rgba(181, 73, 63, 0.12)';
    style.color = '#b5493f';
  } else if (variant === 'utm') {
    style.background = 'rgba(23, 179, 163, 0.12)';
    style.color = '#0d756b';
    style.fontFamily = 'var(--font-mono), monospace';
  } else if (variant === 'none') {
    style.background = '#f0ebdc';
    style.color = '#54615a';
  } else {
    style.background = '#f0ebdc';
    style.color = '#0c1e16';
  }

  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
};
