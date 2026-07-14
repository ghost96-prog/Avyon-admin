// src/pages/BusinessDetailPage.jsx
import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { ErrorState, Skeleton } from '../components/ui/States';
import BranchesSection from '../components/businesses/BranchesSection';
import AccountStatusCard from '../components/businesses/AccountStatusCard';
import StaffSection from '../components/staff/StaffSection';
import ModuleSubscriptionsCard from '../components/subscriptions/ModuleSubscriptionsCard';

export default function BusinessDetailPage() {
  const { businessId } = useParams();
  const [searchParams] = useSearchParams();
  const ownerId = searchParams.get('ownerId');

  const { data, error, isLoading, refetch } = useApi(
    () => api.get(`/admin/businesses/${businessId}?ownerId=${ownerId}`),
    [businessId, ownerId]
  );

  if (!ownerId) {
    return (
      <ErrorState message="Missing ownerId in the URL — navigate here from the Businesses list rather than typing the URL directly." />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton rows={1} className="!h-32" />
        <Skeleton rows={4} />
      </div>
    );
  }

  const { business, branches, staff } = data;
  const businessWithIds = { ...business, businessId, ownerId };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link 
        to="/businesses" 
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        style={{ cursor: 'pointer' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Businesses
      </Link>

      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)] break-words">{businessWithIds.businessName}</h2>
        <p className="text-sm text-[var(--color-text-muted)] break-words">
          {businessWithIds.email} · {businessWithIds.country || '—'} · {businessWithIds.baseCurrency || 'USD'} · {branches.length} branch{branches.length === 1 ? '' : 'es'}
        </p>
      </div>

      <AccountStatusCard business={businessWithIds} onRefetch={refetch} />

      <BranchesSection business={businessWithIds} branches={branches} onRefetch={refetch} />

      <ModuleSubscriptionsCard business={businessWithIds} branches={branches} onRefetch={refetch} />

      <StaffSection business={businessWithIds} staff={staff} onRefetch={refetch} />
    </div>
  );
}