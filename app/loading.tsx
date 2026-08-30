import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div style={{ padding: '32px', background: '#faf7ee', minHeight: '100vh' }}>
      <Skeleton height="36px" width="300px" style={{ marginBottom: '24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Skeleton height="100px" borderRadius="18px" />
        <Skeleton height="100px" borderRadius="18px" />
        <Skeleton height="100px" borderRadius="18px" />
      </div>
      <Skeleton height="80px" borderRadius="18px" style={{ marginBottom: '24px' }} />
      <Skeleton height="300px" borderRadius="18px" />
    </div>
  );
}
