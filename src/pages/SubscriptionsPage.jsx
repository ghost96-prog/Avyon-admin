// src/pages/SubscriptionsPage.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SubscriptionBranchRow from '../components/subscriptions/SubscriptionBranchRow';
import { Skeleton, ErrorState, EmptyState } from '../components/ui/States';

const STATUS_OPTIONS = [
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PLAN_OPTIONS = [
  { value: 'all', label: 'All plans' },
  { value: 'monthly', label: '1 Month' },
  { value: 'biannual', label: '6 Months' },
  { value: 'annual', label: '12 Months' },
  { value: 'custom', label: 'Custom' },
  { value: 'none', label: 'No plan (trial)' },
];

const SORT_OPTIONS = [
  { value: 'urgency', label: 'Soonest expiring first' },
  { value: 'recent', label: 'Most recently created' },
  { value: 'payment', label: 'Highest last payment' },
];

// Multi-select dropdown for status only
const MultiSelectStatus = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter(s => s !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const getLabel = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === options.length) return 'All statuses';
    if (selected.length === 1) {
      return options.find(o => o.value === selected[0])?.label || selected[0];
    }
    return `${selected.length} selected`;
  };

  return (
    <div className="relative w-40" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors flex items-center justify-between"
      >
        <span className={`text-sm ${selected.length === 0 ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
          {getLabel()}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-72 overflow-y-auto">
          <div className="p-3">
            <div className="flex justify-between items-center px-2 py-1.5 mb-2 border-b border-[var(--color-border)]">
              <button 
                onClick={() => onChange(options.map(o => o.value))}
                className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
              >
                Select All
              </button>
              <button 
                onClick={() => onChange([])}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
              >
                Clear
              </button>
            </div>
            <div className="space-y-0.5">
              {options.map(opt => (
                <label 
                  key={opt.value} 
                  className="flex items-center gap-2.5 px-2 py-2 hover:bg-[var(--color-neutral-bg)] cursor-pointer rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                    className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text)]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SubscriptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get status filters from URL (multiple)
  const initialStatus = searchParams.getAll('status') || [];
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  const { data, error, isLoading, refetch } = useApi(() => api.get('/admin/branches'), []);
  const branches = useMemo(() => data?.branches || [], [data]);

  const updateURL = (values) => {
    searchParams.delete('status');
    values.forEach(v => searchParams.append('status', v));
    setSearchParams(searchParams, { replace: true });
  };

  const handleStatusChange = (values) => {
    setStatusFilter(values);
    updateURL(values);
  };

  const clearStatusFilter = () => {
    setStatusFilter([]);
    searchParams.delete('status');
    setSearchParams(searchParams, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = branches;

    // Status filter (OR - multiple)
    if (statusFilter.length > 0) {
      list = list.filter(b => statusFilter.includes(b.subscriptionStatus));
    }

    // Plan filter (single)
    if (planFilter !== 'all') {
      list = planFilter === 'none'
        ? list.filter(b => !b.subscriptionPlan)
        : list.filter(b => b.subscriptionPlan === planFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(b =>
        b.branchName?.toLowerCase().includes(q) ||
        b.businessName?.toLowerCase().includes(q) ||
        b.ownerEmail?.toLowerCase().includes(q) ||
        b.ownerName?.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...list];
    if (sortBy === 'urgency') {
      sorted.sort((a, b) => {
        const aLive = ['trial', 'active'].includes(a.subscriptionStatus);
        const bLive = ['trial', 'active'].includes(b.subscriptionStatus);
        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;
        return (a.msRemaining ?? Infinity) - (b.msRemaining ?? Infinity);
      });
    } else if (sortBy === 'recent') {
      sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sortBy === 'payment') {
      sorted.sort((a, b) => (b.lastPaymentAmount || 0) - (a.lastPaymentAmount || 0));
    }

    return sorted;
  }, [branches, statusFilter, planFilter, search, sortBy]);

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by branch, business, owner name, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        
        {/* Multi-select for status only */}
        <MultiSelectStatus
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onChange={handleStatusChange}
          placeholder="All statuses"
        />
        
        {/* Plan stays as single select */}
        <Select 
          options={PLAN_OPTIONS} 
          value={planFilter} 
          onChange={(e) => setPlanFilter(e.target.value)} 
          className="w-40"
        />
        
        <Select 
          options={SORT_OPTIONS} 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          className="w-48"
        />
      </div>

      {/* Active status filter tags */}
      {statusFilter.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {statusFilter.map(s => {
            const opt = STATUS_OPTIONS.find(o => o.value === s);
            return (
              <span key={s} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {opt?.label}
                <button 
                  onClick={() => handleStatusChange(statusFilter.filter(v => v !== s))}
                  className="hover:text-red-600 transition-colors ml-0.5"
                >
                  ×
                </button>
              </span>
            );
          })}
          <button 
            onClick={clearStatusFilter} 
            className="text-xs text-[var(--color-text-muted)] hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <Card padded={false}>
        <div className="overflow-x-auto">
          <div className="min-w-[768px]">
            <div className="grid grid-cols-[1.4fr_1.2fr_0.8fr_0.9fr_0.9fr_0.8fr] px-4 sm:px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-neutral-bg)] rounded-t-xl">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Branch</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Owner</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Status</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Plan</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Time left</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Last paid</span>
            </div>

            {isLoading ? (
              <div className="p-5"><Skeleton rows={6} /></div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No branches found"
                message={search || statusFilter.length > 0 || planFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No branches exist yet.'}
              />
            ) : (
              filtered.map((b) => <SubscriptionBranchRow key={b.branchId} branch={b} />)
            )}
          </div>
        </div>
      </Card>

      <p className="text-xs text-[var(--color-text-muted)] px-1">
        Showing {filtered.length} of {branches.length} branches
      </p>
    </div>
  );
}