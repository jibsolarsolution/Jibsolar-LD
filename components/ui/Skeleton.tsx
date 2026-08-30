import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '10px',
  className = '',
  style,
}) => {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: '#f0ebdc',
        animation: 'pulse 1.5s infinite ease-in-out',
        ...style,
      }}
    />
  );
};
