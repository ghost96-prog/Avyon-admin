// src/pages/SubscriptionsPage.jsx
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SubscriptionBranchRow from '../components/subscriptions/SubscriptionBranchRow';
import { Skeleton, ErrorState, EmptyState } from '../components/ui/States';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
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

export default function SubscriptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(
    STATUS_OPTIONS.some((o) => o.value === initialFilter) ? initialFilter : 'all'
  );
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  const { data, error, isLoading, refetch } = useApi(() => api.get('/admin/branches'), []);
  const branches = useMemo(() => data?.branches || [], [data]);

  const filtered = useMemo(() => {
    let list = branches;

    if (statusFilter !== 'all') {
      list = list.filter((b) => b.subscriptionStatus === statusFilter);
    }

    if (planFilter !== 'all') {
      list = planFilter === 'none'
        ? list.filter((b) => !b.subscriptionPlan)
        : list.filter((b) => b.subscriptionPlan === planFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.branchName?.toLowerCase().includes(q) ||
          b.businessName?.toLowerCase().includes(q) ||
          b.ownerEmail?.toLowerCase().includes(q) ||
          b.ownerName?.toLowerCase().includes(q)
      );
    }

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

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    if (value === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', value);
    }
    setSearchParams(searchParams, { replace: true });
  };

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
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)} className="sm:w-40" />
        <Select options={PLAN_OPTIONS} value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="sm:w-40" />
        <Select options={SORT_OPTIONS} value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sm:w-48" />
      </div>

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
                message={search || statusFilter !== 'all' || planFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No branches exist yet.'}
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