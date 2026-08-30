'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onOpenMobileSidebar?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date | string | null;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onExport,
  onOpenMobileSidebar,
  isRefreshing = false,
  lastUpdated = null,
}) => {
  let formattedLastUpdated = 'Not updated yet';

  if (lastUpdated) {
    const d = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
    if (!isNaN(d.getTime())) {
      formattedLastUpdated =
        'Last updated: ' +
        d.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }) +
        ' IST';
    }
  }

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          {/* Mobile Sidebar Toggle Button */}
          <button
            className="mobile-menu-btn"
            onClick={onOpenMobileSidebar}
            aria-label="Open Navigation Menu"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(12,30,22,0.18)',
              borderRadius: '10px',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#04140f" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Eyebrow Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#f2a71f',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '12px',
                letterSpacing: '0.14em',
                color: '#146b48',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              JIB SOLAR OPERATIONS
            </span>
          </div>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontFamily: 'var(--font-sora), sans-serif',
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 800,
            color: '#04140f',
            lineHeight: 1.2,
          }}
        >
          JIBSOLAR — LEADS
        </h1>

        {/* Supporting text */}
        <p style={{ color: '#54615a', fontSize: '14px', marginTop: '4px' }}>
          View and analyse incoming solar enquiries.
        </p>
      </div>

      {/* Right side controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Badge variant="none">LOCAL DATA</Badge>

          <Button variant="secondary" size="sm" onClick={onRefresh} disabled={isRefreshing}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                marginRight: '6px',
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>

          <Button variant="primary" size="sm" onClick={onExport}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export CSV
          </Button>
        </div>

        <span style={{ fontSize: '11.5px', color: '#54615a', fontFamily: 'var(--font-mono)' }}>
          {formattedLastUpdated}
        </span>
      </div>
    </header>
  );
};
