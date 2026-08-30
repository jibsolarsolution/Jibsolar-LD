import React from 'react';
import { IDashboardStats } from '@/lib/types';
import { Skeleton } from '@/components/ui/Skeleton';

interface SummaryCardsProps {
  stats?: IDashboardStats;
  isLoading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, isLoading = false }) => {
  if (isLoading || !stats) {
    return (
      <div className="summary-cards-grid-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(12, 30, 22, 0.10)',
              borderRadius: '18px',
              padding: '20px',
              boxShadow: '0 16px 30px -18px rgba(4, 20, 15, 0.18)',
            }}
          >
            <Skeleton width="42px" height="42px" borderRadius="12px" style={{ marginBottom: '16px' }} />
            <Skeleton width="60%" height="16px" style={{ marginBottom: '8px' }} />
            <Skeleton width="40%" height="32px" />
          </div>
        ))}
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid rgba(12, 30, 22, 0.10)',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 16px 30px -18px rgba(4, 20, 15, 0.18)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '150px',
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#f0ebdc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#146b48',
    marginBottom: '14px',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-inter), sans-serif',
    fontSize: '13px',
    fontWeight: 600,
    color: '#54615a',
    marginBottom: '4px',
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sora), sans-serif',
    fontSize: 'clamp(26px, 3vw, 34px)',
    fontWeight: 700,
    color: '#04140f',
    lineHeight: 1.1,
  };

  const subtextStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono), monospace',
    fontSize: '12px',
    color: '#54615a',
    marginTop: '6px',
  };

  return (
    <div className="summary-cards-grid-4">
      {/* 1. Total Leads */}
      <div style={cardStyle}>
        <div>
          <div style={iconContainerStyle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <p style={labelStyle}>Total Leads</p>
        </div>
        <div>
          <p style={valueStyle}>{stats.totalLeads.toLocaleString()}</p>
          <p style={subtextStyle}>Selected period</p>
        </div>
      </div>

      {/* 2. With Attribution */}
      <div style={cardStyle}>
        <div>
          <div style={iconContainerStyle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <p style={labelStyle}>With Attribution</p>
        </div>
        <div>
          <p style={valueStyle}>{stats.withAttribution.attributedCount.toLocaleString()}</p>
          <p style={subtextStyle}>
            {stats.withAttribution.attributedCount} attributed · {stats.withAttribution.directCount} direct
          </p>
        </div>
      </div>

      {/* 3. Cities */}
      <div style={cardStyle}>
        <div>
          <div style={iconContainerStyle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <p style={labelStyle}>Cities</p>
        </div>
        <div>
          <p style={valueStyle}>{stats.cities.distinctCount.toLocaleString()}</p>
          <p style={subtextStyle}>Top: {stats.cities.topCity}</p>
        </div>
      </div>

      {/* 4. Top Campaign */}
      <div
        style={{
          ...cardStyle,
          background: 'linear-gradient(135deg, #083a29, #0d5138)',
          color: '#ffffff',
        }}
      >
        <div>
          <div
            style={{
              ...iconContainerStyle,
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffce6d',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <p style={{ ...labelStyle, color: '#a9cabb' }}>Top Campaign</p>
        </div>
        <div>
          {stats.topCampaign ? (
            <>
              <p
                style={{
                  fontFamily: 'var(--font-sora), sans-serif',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={`${stats.topCampaign.utm_source} / ${stats.topCampaign.utm_campaign}`}
              >
                {stats.topCampaign.utm_source} / {stats.topCampaign.utm_campaign}
              </p>
              <p style={{ ...subtextStyle, color: '#a9cabb' }}>
                {stats.topCampaign.count} touchpoints
              </p>
            </>
          ) : (
            <p style={{ fontSize: '15px', color: '#a9cabb', fontStyle: 'italic' }}>No campaign data</p>
          )}
        </div>
      </div>
    </div>
  );
};
