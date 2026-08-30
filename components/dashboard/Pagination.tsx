'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginTop: '24px',
        padding: '16px 20px',
        background: '#ffffff',
        border: '1px solid rgba(12, 30, 22, 0.10)',
        borderRadius: '18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '13px', color: '#54615a', fontFamily: 'var(--font-inter)' }}>
          Showing <strong style={{ color: '#04140f' }}>{startItem}</strong> to{' '}
          <strong style={{ color: '#04140f' }}>{endItem}</strong> of{' '}
          <strong style={{ color: '#04140f' }}>{total}</strong> leads (Total: {total})
        </div>

        {/* Rows per page selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#54615a' }}>
          <label htmlFor="rows-per-page-select">Rows per page:</label>
          <select
            id="rows-per-page-select"
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
            style={{
              height: '34px',
              padding: '0 8px',
              borderRadius: '8px',
              border: '1px solid rgba(12, 30, 22, 0.18)',
              background: '#ffffff',
              fontSize: '13px',
              fontFamily: 'var(--font-inter)',
              color: '#0c1e16',
              outline: 'none',
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 14px',
            borderRadius: '999px',
            background: '#083a29',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-sora)',
          }}
        >
          Page {page} of {totalPages || 1}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
