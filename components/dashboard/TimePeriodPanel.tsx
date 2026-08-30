'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { isValidCalendarDate } from '@/lib/date';

interface TimePeriodPanelProps {
  range: string;
  startDate: string;
  endDate: string;
  onRangeChange: (range: 'today' | '7days' | 'custom') => void;
  onApplyCustomDates: (startDate: string, endDate: string) => void;
}

export const TimePeriodPanel: React.FC<TimePeriodPanelProps> = ({
  range,
  startDate,
  endDate,
  onRangeChange,
  onApplyCustomDates,
}) => {
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    height: '38px',
    background: '#ffffff',
    border: '1px solid rgba(12, 30, 22, 0.18)',
    borderRadius: '8px',
    padding: '0 10px',
    fontSize: '13px',
    fontFamily: 'var(--font-inter), sans-serif',
    color: '#0c1e16',
    outline: 'none',
  };

  const handleApply = () => {
    if (!tempStart || !tempEnd) {
      setValidationError('Both start and end dates are required.');
      return;
    }
    if (!isValidCalendarDate(tempStart) || !isValidCalendarDate(tempEnd)) {
      setValidationError('Please select valid calendar dates (YYYY-MM-DD).');
      return;
    }
    if (new Date(tempStart).getTime() > new Date(tempEnd).getTime()) {
      setValidationError('Start date cannot be later than end date.');
      return;
    }

    setValidationError(null);
    onApplyCustomDates(tempStart, tempEnd);
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(12, 30, 22, 0.10)',
        borderRadius: '18px',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 16px 30px -18px rgba(4, 20, 15, 0.12)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-sora)', color: '#04140f' }}>
            Time Period (IST):
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant={range === 'today' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setValidationError(null);
                onRangeChange('today');
              }}
            >
              Today (IST)
            </Button>

            <Button
              variant={range === '7days' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setValidationError(null);
                onRangeChange('7days');
              }}
            >
              Last 7 Days
            </Button>

            <Button
              variant={range === 'custom' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setValidationError(null);
                onRangeChange('custom');
              }}
            >
              Custom Range
            </Button>
          </div>
        </div>

        {/* Custom Range Inputs & Apply Trigger */}
        {range === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="tp-start-date" style={{ fontSize: '12px', color: '#54615a', fontWeight: 600 }}>
                From:
              </label>
              <input
                id="tp-start-date"
                type="date"
                value={tempStart || startDate}
                onChange={(e) => setTempStart(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="tp-end-date" style={{ fontSize: '12px', color: '#54615a', fontWeight: 600 }}>
                To:
              </label>
              <input
                id="tp-end-date"
                type="date"
                value={tempEnd || endDate}
                onChange={(e) => setTempEnd(e.target.value)}
                style={inputStyle}
              />
            </div>

            <Button variant="primary" size="sm" onClick={handleApply}>
              Apply Range
            </Button>
          </div>
        )}
      </div>

      {validationError && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#b5493f', fontWeight: 600 }}>
          {validationError}
        </div>
      )}
    </div>
  );
};
