'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IUserLead, ILeadDetails } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface LeadTableProps {
  leads: IUserLead[];
  page: number;
  limit: number;
  isLoading?: boolean;
  error?: string | null;
  onClearFilters?: () => void;
  onRetry?: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  page,
  limit,
  isLoading = false,
  error = null,
  onClearFilters,
  onRetry,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<ILeadDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const detailsAbortRef = useRef<AbortController | null>(null);
  const expandedIdRef = useRef<string | null>(null);

  useEffect(() => {
    expandedIdRef.current = expandedId;
  }, [expandedId]);

  const toggleRow = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedDetails(null);
      setDetailsError(null);
    } else {
      setExpandedId(id);
      setExpandedDetails(null);
      setDetailsError(null);
    }
  };

  // Fetch full details with AbortController and stale-response protection
  useEffect(() => {
    if (detailsAbortRef.current) {
      detailsAbortRef.current.abort();
    }

    if (!expandedId) {
      return;
    }

    const controller = new AbortController();
    detailsAbortRef.current = controller;
    const currentTargetId = expandedId;

    async function loadDetails() {
      setIsLoadingDetails(true);
      setDetailsError(null);

      try {
        const res = await fetch(`/api/leads/${currentTargetId}`, {
          signal: controller.signal,
        });

        if (expandedIdRef.current !== currentTargetId) return;

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          let errMsg = 'Unable to load lead details.';
          try {
            const errJson = JSON.parse(errText);
            if (errJson.message) errMsg = errJson.message;
          } catch {
            // Fallback for non-JSON error payloads
          }
          if (expandedIdRef.current === currentTargetId) {
            setDetailsError(errMsg);
            setIsLoadingDetails(false);
          }
          return;
        }

        const json = await res.json().catch(() => null);

        if (expandedIdRef.current !== currentTargetId) return;

        if (json && json.success && json.data) {
          setExpandedDetails(json.data);
        } else {
          setDetailsError(json?.message || 'Unable to load lead details.');
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError' && expandedIdRef.current === currentTargetId) {
          setDetailsError('Unable to load lead details.');
        }
      } finally {
        if (expandedIdRef.current === currentTargetId) {
          setIsLoadingDetails(false);
        }
      }
    }

    loadDetails();

    return () => {
      controller.abort();
    };
  }, [expandedId]);

  // Error state
  if (error) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(181, 73, 63, 0.30)',
          borderRadius: '18px',
          padding: '40px 24px',
          textAlign: 'center',
          backgroundColor: 'rgba(181, 73, 63, 0.04)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(181, 73, 63, 0.12)',
            color: '#b5493f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 style={{ color: '#b5493f', fontSize: '18px', marginBottom: '8px' }}>
          Unable to load lead data. Please try again.
        </h3>
        <p style={{ color: '#54615a', fontSize: '14px', marginBottom: '20px' }}>
          {error}
        </p>
        {onRetry && (
          <Button variant="secondary" size="md" onClick={onRetry}>
            Retry loading data
          </Button>
        )}
      </div>
    );
  }

  // Loading skeleton state
  if (isLoading) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(12, 30, 22, 0.10)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -24px rgba(4, 20, 15, 0.20)',
        }}
      >
        <div style={{ padding: '16px 24px', background: '#f0ebdc' }}>
          <Skeleton height="20px" width="30%" />
        </div>
        <div style={{ padding: '24px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <Skeleton width="10%" height="24px" />
              <Skeleton width="25%" height="24px" />
              <Skeleton width="20%" height="24px" />
              <Skeleton width="25%" height="24px" />
              <Skeleton width="15%" height="24px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (leads.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(12, 30, 22, 0.10)',
          borderRadius: '18px',
          padding: '56px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#f0ebdc',
            color: '#146b48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8v4l3 3"></path>
          </svg>
        </div>
        <h3 style={{ fontFamily: 'var(--font-sora)', fontSize: '20px', color: '#04140f', marginBottom: '8px' }}>
          No leads found
        </h3>
        <p style={{ color: '#54615a', fontSize: '14px', marginBottom: '24px' }}>
          Try changing or clearing the current filters to display leads.
        </p>
        {onClearFilters && (
          <Button variant="primary" size="md" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(12, 30, 22, 0.10)',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -24px rgba(4, 20, 15, 0.20)',
      }}
    >
      <div className="table-responsive-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <caption style={{ display: 'none' }}>JIBSOLAR Leads Enquiries Table</caption>
          <thead>
            <tr
              style={{
                background: '#f0ebdc',
                color: '#54615a',
                fontSize: '12px',
                fontFamily: 'var(--font-sora), sans-serif',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: '1px solid rgba(12, 30, 22, 0.10)',
              }}
            >
              <th style={{ padding: '14px 16px', width: '50px' }}>#</th>
              <th style={{ padding: '14px 16px' }}>Name</th>
              <th style={{ padding: '14px 16px' }}>Phone</th>
              <th style={{ padding: '14px 16px' }}>Email</th>
              <th style={{ padding: '14px 16px' }}>City</th>
              <th style={{ padding: '14px 16px' }}>Created Date/Time (IST)</th>
              <th style={{ padding: '14px 16px', width: '50px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => {
              const serialNo = (page - 1) * limit + idx + 1;
              const isExpanded = expandedId === lead.id;

              return (
                <React.Fragment key={lead.id}>
                  {/* Primary Compact Lead Row */}
                  <tr
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    aria-controls={`lead-details-${lead.id}`}
                    onClick={() => toggleRow(lead.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleRow(lead.id);
                      }
                    }}
                    className="lead-table-row"
                    style={{
                      minHeight: '52px',
                      borderBottom: '1px solid rgba(12, 30, 22, 0.08)',
                      cursor: 'pointer',
                      transition: 'background 150ms ease',
                      background: isExpanded ? 'rgba(240, 235, 220, 0.45)' : 'transparent',
                    }}
                  >
                    {/* Serial Number */}
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#54615a' }}>
                      {serialNo}
                    </td>

                    {/* Name */}
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-sora)', fontWeight: 600, fontSize: '14px', color: '#04140f' }}>
                      {lead.name}
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '13.5px', color: '#0c1e16', whiteSpace: 'nowrap' }}>
                      {lead.phone}
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 16px', fontSize: '13.5px', color: '#54615a' }}>
                      {lead.email}
                    </td>

                    {/* City */}
                    <td style={{ padding: '14px 16px', fontSize: '13.5px', color: '#0c1e16' }}>
                      {lead.city || '—'}
                    </td>

                    {/* Created Date/Time (IST) */}
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: '#54615a', whiteSpace: 'nowrap' }}>
                      {new Date(lead.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>

                    {/* Expand Indicator Chevron */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#146b48"
                        strokeWidth="2"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 200ms ease',
                        }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </td>
                  </tr>

                  {/* Inline Expandable Details Section */}
                  {isExpanded && (
                    <tr id={`lead-details-${lead.id}`}>
                      <td colSpan={7} style={{ padding: 0, background: '#faf7ee', borderBottom: '1px solid rgba(12, 30, 22, 0.12)' }}>
                        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {isLoadingDetails && (
                            <div style={{ padding: '12px' }}>
                              <Skeleton height="80px" borderRadius="12px" style={{ marginBottom: '12px' }} />
                              <Skeleton height="120px" borderRadius="12px" />
                            </div>
                          )}

                          {detailsError && (
                            <div style={{ padding: '16px', background: 'rgba(181, 73, 63, 0.08)', borderRadius: '10px', color: '#b5493f', fontSize: '13px' }}>
                              {detailsError}
                            </div>
                          )}

                          {expandedDetails && !isLoadingDetails && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                              {/* Card 1: Contact Details */}
                              <div style={{ background: '#ffffff', border: '1px solid rgba(12, 30, 22, 0.10)', borderRadius: '12px', padding: '16px' }}>
                                <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-sora)', color: '#04140f', marginBottom: '12px', borderBottom: '1px solid rgba(12,30,22,0.08)', paddingBottom: '6px' }}>
                                  Contact Details
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px' }}>
                                  <div><span style={{ color: '#54615a', display: 'block', fontSize: '11px' }}>Full Name</span><strong>{expandedDetails.name}</strong></div>
                                  <div><span style={{ color: '#54615a', display: 'block', fontSize: '11px' }}>Phone</span><strong style={{ fontFamily: 'var(--font-mono)' }}>{expandedDetails.phone} ({expandedDetails.countryCode})</strong></div>
                                  <div><span style={{ color: '#54615a', display: 'block', fontSize: '11px' }}>Email</span><strong style={{ wordBreak: 'break-all' }}>{expandedDetails.email}</strong></div>
                                  <div><span style={{ color: '#54615a', display: 'block', fontSize: '11px' }}>City</span><strong>{expandedDetails.city || 'N/A'}</strong></div>
                                  <div><span style={{ color: '#54615a', display: 'block', fontSize: '11px' }}>Profession</span><strong>{expandedDetails.profession || 'N/A'}</strong></div>
                                  <div><span style={{ color: '#54615a', display: 'block', fontSize: '11px' }}>Record Status</span><div style={{ marginTop: '2px' }}><Badge variant={expandedDetails.status}>{expandedDetails.status}</Badge></div></div>
                                </div>
                              </div>

                              {/* Card 2: Solar Requirement */}
                              <div style={{ background: '#ffffff', border: '1px solid rgba(12, 30, 22, 0.10)', borderRadius: '12px', padding: '16px' }}>
                                <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-sora)', color: '#04140f', marginBottom: '12px', borderBottom: '1px solid rgba(12,30,22,0.08)', paddingBottom: '6px' }}>
                                  Solar Requirement
                                </h4>
                                <div>
                                  <span style={{ color: '#54615a', display: 'block', fontSize: '11px' }}>Monthly Power Bill</span>
                                  <strong style={{ fontSize: '18px', fontFamily: 'var(--font-sora)', color: '#04140f' }}>
                                    {expandedDetails.monthlyPowerBill ? `₹${parseInt(expandedDetails.monthlyPowerBill, 10).toLocaleString('en-IN')}` : 'Not specified'}
                                  </strong>
                                </div>
                              </div>

                              {/* Card 3: Tracking & Touchpoint History */}
                              <div style={{ gridColumn: '1 / -1', background: '#ffffff', border: '1px solid rgba(12, 30, 22, 0.10)', borderRadius: '12px', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(12,30,22,0.08)', paddingBottom: '6px' }}>
                                  <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-sora)', color: '#04140f' }}>
                                    Tracking & Touchpoint Timeline
                                  </h4>
                                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#146b48', fontWeight: 600 }}>
                                    {expandedDetails.touchpoints.length} {expandedDetails.touchpoints.length === 1 ? 'Touchpoint' : 'Touchpoints'}
                                  </span>
                                </div>

                                {expandedDetails.touchpoints.length === 0 ? (
                                  <p style={{ color: '#54615a', fontSize: '12.5px', fontStyle: 'italic' }}>
                                    No attribution campaign touchpoints recorded.
                                  </p>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {expandedDetails.touchpoints.map((tp, tIdx) => (
                                      <div
                                        key={tp.id}
                                        style={{
                                          background: '#faf7ee',
                                          borderRadius: '8px',
                                          padding: '10px 12px',
                                          border: '1px solid rgba(12, 30, 22, 0.08)',
                                        }}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0d5138', fontFamily: 'var(--font-mono)' }}>
                                            Touchpoint #{expandedDetails.touchpoints.length - tIdx} — {tp.route}
                                          </span>
                                          <span style={{ fontSize: '11px', color: '#54615a', fontFamily: 'var(--font-mono)' }}>
                                            {new Date(tp.createdAt).toLocaleString('en-IN', {
                                              timeZone: 'Asia/Kolkata',
                                              day: '2-digit',
                                              month: 'short',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: true,
                                            })} IST
                                          </span>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                                          {tp.utm_source ? <Badge variant="utm">source: {tp.utm_source}</Badge> : <Badge variant="none">Direct</Badge>}
                                          {tp.utm_medium && <Badge variant="none">medium: {tp.utm_medium}</Badge>}
                                          {tp.utm_campaign && <Badge variant="none">campaign: {tp.utm_campaign}</Badge>}
                                          {tp.utm_content && <Badge variant="none">content: {tp.utm_content}</Badge>}
                                          {tp.utm_term && <Badge variant="none">term: {tp.utm_term}</Badge>}
                                        </div>

                                        {(tp.gclid || tp.fbclid || tp.fbp || tp.fbc) && (
                                          <div style={{ marginTop: '6px', fontSize: '11px', color: '#54615a', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                                            {tp.gclid && <div>GCLID: {tp.gclid}</div>}
                                            {tp.fbclid && <div>FBCLID: {tp.fbclid}</div>}
                                            {tp.fbp && <div>FBP: {tp.fbp}</div>}
                                            {tp.fbc && <div>FBC: {tp.fbc}</div>}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
