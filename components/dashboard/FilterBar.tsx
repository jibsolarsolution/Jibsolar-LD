'use client';

import React, { useState } from 'react';
import { IFilterOptions } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface FilterBarProps {
  filters: {
    search: string;
    status: string;
    city: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    sort: string;
  };
  options?: IFilterOptions;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  options,
  onChange,
  onClear,
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const inputStyle: React.CSSProperties = {
    height: '42px',
    background: '#ffffff',
    border: '1px solid rgba(12, 30, 22, 0.18)',
    borderRadius: '10px',
    padding: '0 12px',
    fontSize: '13.5px',
    fontFamily: 'var(--font-inter), sans-serif',
    color: '#0c1e16',
    outline: 'none',
    width: '100%',
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#54615a',
    marginBottom: '4px',
    fontFamily: 'var(--font-inter), sans-serif',
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(12, 30, 22, 0.10)',
        borderRadius: '18px',
        padding: '16px 20px',
        marginBottom: '24px',
      }}
    >
      {/* Primary Always-Visible Compact Filter Row */}
      <div className="filter-primary-row">
        {/* Search */}
        <div style={{ flex: 2, minWidth: '220px' }}>
          <label htmlFor="filter-search" style={labelStyle}>
            Search Leads
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="filter-search"
              type="text"
              placeholder="Search by name, phone, or email..."
              value={filters.search}
              onChange={(e) => onChange('search', e.target.value)}
              style={{ ...inputStyle, paddingLeft: '36px' }}
            />
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#54615a"
              strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '13px' }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        {/* UTM Source */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="filter-utm_source" style={labelStyle}>
            UTM Source
          </label>
          <select
            id="filter-utm_source"
            value={filters.utm_source}
            onChange={(e) => onChange('utm_source', e.target.value)}
            style={inputStyle}
          >
            <option value="">All Sources</option>
            {options?.utmSources?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* UTM Campaign */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="filter-utm_campaign" style={labelStyle}>
            UTM Campaign
          </label>
          <select
            id="filter-utm_campaign"
            value={filters.utm_campaign}
            onChange={(e) => onChange('utm_campaign', e.target.value)}
            style={inputStyle}
          >
            <option value="">All Campaigns</option>
            {options?.utmCampaigns?.map((cmp) => (
              <option key={cmp} value={cmp}>
                {cmp}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            style={{ height: '42px', padding: '0 14px' }}
          >
            {showMoreFilters ? 'Less Filters ▲' : 'More Filters ▼'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onClear}
            style={{ height: '42px', padding: '0 14px' }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Collapsible Compact "More Filters" Section */}
      {showMoreFilters && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(12, 30, 22, 0.08)',
          }}
        >
          <div className="filter-secondary-grid">
            {/* City */}
            <div>
              <label htmlFor="filter-city" style={labelStyle}>
                City
              </label>
              <select
                id="filter-city"
                value={filters.city}
                onChange={(e) => onChange('city', e.target.value)}
                style={inputStyle}
              >
                <option value="">All Cities</option>
                {options?.cities?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Record Status */}
            <div>
              <label htmlFor="filter-status" style={labelStyle}>
                System Record Status
              </label>
              <select
                id="filter-status"
                value={filters.status}
                onChange={(e) => onChange('status', e.target.value)}
                style={inputStyle}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ONHOLD">ONHOLD</option>
                <option value="DELETED">DELETED</option>
              </select>
            </div>

            {/* UTM Medium */}
            <div>
              <label htmlFor="filter-utm_medium" style={labelStyle}>
                UTM Medium
              </label>
              <select
                id="filter-utm_medium"
                value={filters.utm_medium}
                onChange={(e) => onChange('utm_medium', e.target.value)}
                style={inputStyle}
              >
                <option value="">All Mediums</option>
                {options?.utmMediums?.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="filter-sort" style={labelStyle}>
                Sort Order
              </label>
              <select
                id="filter-sort"
                value={filters.sort}
                onChange={(e) => onChange('sort', e.target.value)}
                style={inputStyle}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
