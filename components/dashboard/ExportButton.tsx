'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ExportButtonProps {
  filterParams: Record<string, string>;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ filterParams }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const query = new URLSearchParams(filterParams).toString();
      const exportUrl = `/api/export?${query}`;

      const res = await fetch(exportUrl);
      if (!res.ok) {
        throw new Error('Export request failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jibsolar_leads_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Unable to generate CSV export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="primary" size="sm" onClick={handleExport} disabled={isExporting}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
};
