'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#faf7ee',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(181, 73, 63, 0.30)',
          borderRadius: '18px',
          padding: '40px 32px',
          textAlign: 'center',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 40px -24px rgba(4, 20, 15, 0.20)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(181, 73, 63, 0.12)',
            color: '#b5493f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'var(--font-sora)', fontSize: '20px', color: '#04140f', marginBottom: '8px' }}>
          Dashboard Unavailable
        </h2>
        <p style={{ color: '#54615a', fontSize: '14px', marginBottom: '24px' }}>
          Unable to load lead data. Please try again.
        </p>
        <Button variant="primary" size="md" onClick={() => reset()}>
          Retry loading data
        </Button>
      </div>
    </div>
  );
}
