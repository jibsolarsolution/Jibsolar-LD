'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { TimePeriodPanel } from '@/components/dashboard/TimePeriodPanel';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { Pagination } from '@/components/dashboard/Pagination';
import { IDashboardStats, IFilterOptions, IUserLead, IPaginationMeta } from '@/lib/types';

interface DashboardClientProps {
  initialStats?: IDashboardStats;
  initialFilterOptions?: IFilterOptions;
  initialLeads?: IUserLead[];
  initialPagination?: IPaginationMeta;
  initialLastUpdated?: string | null;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({
  initialStats,
  initialFilterOptions,
  initialLeads = [],
  initialPagination = { total: 0, page: 1, limit: 10, totalPages: 1 },
  initialLastUpdated = null,
}) => {
  const hasInitialData = !!(initialStats && initialLeads.length > 0);

  const [stats, setStats] = useState<IDashboardStats | undefined>(initialStats);
  const [filterOptions, setFilterOptions] = useState<IFilterOptions | undefined>(initialFilterOptions);
  const [leads, setLeads] = useState<IUserLead[]>(initialLeads);
  const [pagination, setPagination] = useState<IPaginationMeta>(initialPagination);

  const [isLoadingStats, setIsLoadingStats] = useState(!hasInitialData);
  const [isLoadingLeads, setIsLoadingLeads] = useState(!hasInitialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialLastUpdated);

  // Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<{
    search: string;
    range: 'today' | '7days' | 'custom';
    startDate: string;
    endDate: string;
    status: string;
    city: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    sort: string;
    page: number;
    limit: number;
  }>({
    search: '',
    range: 'today',
    startDate: '',
    endDate: '',
    status: '',
    city: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    sort: 'newest',
    page: 1,
    limit: 10,
  });

  // Debounced search term for API queries
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // AbortController refs for race condition protection
  const leadsAbortRef = useRef<AbortController | null>(null);
  const statsAbortRef = useRef<AbortController | null>(null);

  // Load Filter Options
  useEffect(() => {
    let isMounted = true;
    async function loadOptions() {
      try {
        const res = await fetch('/api/filter-options');
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setFilterOptions(json.data);
        }
      } catch {
        // Ignore background filter options fetch errors
      }
    }
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Stats on Range/Date Filter Change
  useEffect(() => {
    if (statsAbortRef.current) {
      statsAbortRef.current.abort();
    }
    const controller = new AbortController();
    statsAbortRef.current = controller;
    let isMounted = true;

    async function loadStats() {
      try {
        setIsLoadingStats(true);
        const params = new URLSearchParams();
        params.set('range', filters.range);
        if (filters.range === 'custom' && filters.startDate) params.set('startDate', filters.startDate);
        if (filters.range === 'custom' && filters.endDate) params.set('endDate', filters.endDate);

        const res = await fetch(`/api/stats?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Stats request failed');
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setStats(json.data);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          // Preserve stats on background error
        }
      } finally {
        if (isMounted) setIsLoadingStats(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [filters.range, filters.startDate, filters.endDate]);

  // Load Leads List on Filter or Page Change
  useEffect(() => {
    if (leadsAbortRef.current) {
      leadsAbortRef.current.abort();
    }
    const controller = new AbortController();
    leadsAbortRef.current = controller;
    let isMounted = true;

    async function loadLeads() {
      try {
        setIsLoadingLeads(true);

        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (filters.range) params.set('range', filters.range);
        if (filters.range === 'custom' && filters.startDate) params.set('startDate', filters.startDate);
        if (filters.range === 'custom' && filters.endDate) params.set('endDate', filters.endDate);
        if (filters.status) params.set('status', filters.status);
        if (filters.city) params.set('city', filters.city);
        if (filters.utm_source) params.set('utm_source', filters.utm_source);
        if (filters.utm_medium) params.set('utm_medium', filters.utm_medium);
        if (filters.utm_campaign) params.set('utm_campaign', filters.utm_campaign);
        if (filters.sort) params.set('sort', filters.sort);
        params.set('page', String(filters.page));
        params.set('limit', String(filters.limit));

        const res = await fetch(`/api/leads?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          if (isMounted) {
            setError('Unable to load lead data. Please try again.');
            setIsLoadingLeads(false);
          }
          return;
        }

        const json = await res.json();
        if (isMounted) {
          if (json.success && json.data) {
            setLeads(json.data.leads);
            setPagination(json.data.pagination);
            setError(null);
            setLastUpdated(new Date().toISOString());
          } else {
            setError(json.message || 'Unable to load lead data. Please try again.');
          }
        }
      } catch (err: unknown) {
        if (isMounted && (err as Error).name !== 'AbortError') {
          setError('Unable to load lead data. Please try again.');
        }
      } finally {
        if (isMounted) setIsLoadingLeads(false);
      }
    }

    loadLeads();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedSearch, filters]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoadingLeads(true);
    setIsLoadingStats(true);
    try {
      const statsParams = new URLSearchParams();
      statsParams.set('range', filters.range);
      if (filters.range === 'custom' && filters.startDate) statsParams.set('startDate', filters.startDate);
      if (filters.range === 'custom' && filters.endDate) statsParams.set('endDate', filters.endDate);

      const leadsParams = new URLSearchParams();
      if (debouncedSearch) leadsParams.set('search', debouncedSearch);
      leadsParams.set('range', filters.range);
      if (filters.range === 'custom' && filters.startDate) leadsParams.set('startDate', filters.startDate);
      if (filters.range === 'custom' && filters.endDate) leadsParams.set('endDate', filters.endDate);
      if (filters.status) leadsParams.set('status', filters.status);
      if (filters.city) leadsParams.set('city', filters.city);
      if (filters.utm_source) leadsParams.set('utm_source', filters.utm_source);
      if (filters.utm_medium) leadsParams.set('utm_medium', filters.utm_medium);
      if (filters.utm_campaign) leadsParams.set('utm_campaign', filters.utm_campaign);
      if (filters.sort) leadsParams.set('sort', filters.sort);
      leadsParams.set('page', String(filters.page));
      leadsParams.set('limit', String(filters.limit));

      const [statsRes, optionsRes, leadsRes] = await Promise.all([
        fetch(`/api/stats?${statsParams.toString()}`),
        fetch('/api/filter-options'),
        fetch(`/api/leads?${leadsParams.toString()}`),
      ]);

      if (statsRes.ok) {
        const sJson = await statsRes.json();
        if (sJson.success && sJson.data) setStats(sJson.data);
      }
      if (optionsRes.ok) {
        const oJson = await optionsRes.json();
        if (oJson.success && oJson.data) setFilterOptions(oJson.data);
      }
      if (leadsRes.ok) {
        const lJson = await leadsRes.json();
        if (lJson.success && lJson.data) {
          setLeads(lJson.data.leads);
          setPagination(lJson.data.pagination);
          setError(null);
          setLastUpdated(new Date().toISOString());
        }
      }
    } catch {
      setError('Unable to load lead data. Please try again.');
    } finally {
      setIsRefreshing(false);
      setIsLoadingLeads(false);
      setIsLoadingStats(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleRangeChange = (newRange: 'today' | '7days' | 'custom') => {
    setFilters((prev) => ({
      ...prev,
      range: newRange,
      page: 1,
    }));
  };

  const handleApplyCustomDates = (startDate: string, endDate: string) => {
    setFilters((prev) => ({
      ...prev,
      range: 'custom',
      startDate,
      endDate,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      range: 'today',
      startDate: '',
      endDate: '',
      status: '',
      city: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      sort: 'newest',
      page: 1,
      limit: filters.limit,
    });
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    params.set('range', filters.range);
    if (filters.range === 'custom' && filters.startDate) params.set('startDate', filters.startDate);
    if (filters.range === 'custom' && filters.endDate) params.set('endDate', filters.endDate);
    if (filters.status) params.set('status', filters.status);
    if (filters.city) params.set('city', filters.city);
    if (filters.utm_source) params.set('utm_source', filters.utm_source);
    if (filters.utm_medium) params.set('utm_medium', filters.utm_medium);
    if (filters.utm_campaign) params.set('utm_campaign', filters.utm_campaign);
    if (filters.sort) params.set('sort', filters.sort);

    const exportUrl = `/api/export?${params.toString()}`;
    const a = document.createElement('a');
    a.href = exportUrl;
    a.download = 'jibsolar_leads_export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf7ee' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <main
        style={{
          flex: 1,
          marginLeft: '248px',
          padding: '28px 32px 40px',
          maxWidth: '1440px',
          width: '100%',
        }}
        className="main-workspace"
      >
        {/* 1. Header */}
        <Header
          onRefresh={handleRefresh}
          onExport={handleExport}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
        />

        {/* 2. Time Period Panel */}
        <TimePeriodPanel
          range={filters.range}
          startDate={filters.startDate}
          endDate={filters.endDate}
          onRangeChange={handleRangeChange}
          onApplyCustomDates={handleApplyCustomDates}
        />

        {/* 3. Four Summary Cards */}
        <div style={{ marginBottom: '24px' }}>
          <SummaryCards stats={stats} isLoading={isLoadingStats} />
        </div>

        {/* 4. Search and UTM Filters */}
        <FilterBar
          filters={filters}
          options={filterOptions}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          isLoading={isLoadingLeads}
        />

        {/* 5. Lead Enquiries Table */}
        <LeadTable
          leads={leads}
          page={pagination.page}
          limit={pagination.limit}
          isLoading={isLoadingLeads}
          error={error}
          onClearFilters={handleClearFilters}
          onRetry={handleRefresh}
        />

        {/* 6. Pagination Controls */}
        {!isLoadingLeads && !error && leads.length > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(newPage) => setFilters((prev) => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setFilters((prev) => ({ ...prev, limit: newLimit, page: 1 }))}
          />
        )}
      </main>
    </div>
  );
};
