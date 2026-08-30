'use client';

import React from 'react';
import Image from 'next/image';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile = false, onCloseMobile }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px 20px',
      }}
    >
      {/* Brand Logo Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
        }}
      >
        <Image
          src="/logo.png"
          alt="JIB Solar Logo"
          width={150}
          height={40}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>

      {/* Navigation items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#0d5138',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '14px',
            position: 'relative',
            borderLeft: '4px solid #f2a71f',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f2a71f" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <polyline points="16 11 18 13 22 9"></polyline>
          </svg>
          <span>Leads Enquiries</span>
        </div>
      </nav>

      {/* Footer Info */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '16px' }}>
        <p style={{ fontSize: '11px', color: '#a9cabb', fontFamily: 'var(--font-mono)' }}>
          JIBSOLAR — LEADS v1.0
        </p>
        <p style={{ fontSize: '11px', color: '#54615a', marginTop: '4px' }}>
          Internal Local Workspace
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="desktop-sidebar"
        style={{
          width: '248px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: '#04140f',
          zIndex: 40,
          overflowY: 'auto',
        }}
      >
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 20, 15, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
          onClick={onCloseMobile}
        >
          <div
            style={{
              width: '260px',
              height: '100%',
              background: '#04140f',
              boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
