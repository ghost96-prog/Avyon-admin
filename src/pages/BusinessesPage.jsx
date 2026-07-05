// src/pages/BusinessesPage.jsx
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import BusinessRow from '../components/businesses/BusinessRow';
import { Skeleton, ErrorState, EmptyState } from '../components/ui/States';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function BusinessesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(
    STATUS_OPTIONS.some((o) => o.value === initialFilter) ? initialFilter : 'all'
  );

  const { data, error, isLoading, refetch } = useApi(() => api.get('/admin/businesses'), []);
  const businesses = useMemo(() => data?.businesses || [], [data]);

  const filtered = useMemo(() => {
    let list = businesses;

    if (statusFilter !== 'all') {
      list = list.filter((b) => b.subscriptionStatus === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.businessName?.toLowerCase().includes(q) ||
          b.ownerEmail?.toLowerCase().includes(q) ||
          b.ownerName?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [businesses, statusFilter, search]);

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
          placeholder="Search by business name, owner name, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="sm:w-48"
        />
      </div>

      <Card padded={false}>
        {/* Responsive table - horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
       <div className="grid grid-cols-[1.8fr_1fr_1fr_0.9fr] px-4 sm:px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-neutral-bg)] rounded-t-xl">
  <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Business</span>
  <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Status</span>
  <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Branches</span>
  <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Joined</span>
</div>

            {isLoading ? (
              <div className="p-5"><Skeleton rows={6} /></div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No businesses found"
                message={search || statusFilter !== 'all' ? 'Try adjusting your search or filter.' : 'No businesses have registered yet.'}
              />
            ) : (
              filtered.map((b) => <BusinessRow key={b.businessId} business={b} />)
            )}
          </div>
        </div>
      </Card>

      <p className="text-xs text-[var(--color-text-muted)] px-1">
        Showing {filtered.length} of {businesses.length} businesses
      </p>
    </div>
  );
}