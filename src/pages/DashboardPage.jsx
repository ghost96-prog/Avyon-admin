// src/pages/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { Skeleton, ErrorState, EmptyState } from '../components/ui/States';
import { useLiveCountdown } from '../hooks/useLiveCountdown';

const ICON_PROPS = { className: 'w-[18px] h-[18px] text-[var(--color-navy-900)]', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' };

function ExpiringRow({ branch }) {
  const { countdownText } = useLiveCountdown(branch.accessExpiresAt);
  return (
    <Link
      to={`/businesses/${branch.businessId}?ownerId=${branch.ownerId}`}
      className="flex items-center justify-between py-3 px-1 hover:bg-[var(--color-neutral-bg)] -mx-1 rounded-lg transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">{branch.branchName}</p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">{branch.businessName}</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
        <span className="tabular text-xs font-medium text-[var(--color-warning)]">{countdownText || 'Expiring'}</span>
        <StatusBadge status={branch.subscriptionStatus} size="sm" />
      </div>
    </Link>
  );
}

function AttentionRow({ branch }) {
  return (
    <Link
      to={`/businesses/${branch.businessId}?ownerId=${branch.ownerId}`}
      className="flex items-center justify-between py-3 px-1 hover:bg-[var(--color-neutral-bg)] -mx-1 rounded-lg transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">{branch.branchName}</p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">{branch.businessName}</p>
      </div>
      <StatusBadge status={branch.subscriptionStatus} size="sm" />
    </Link>
  );
}

export default function DashboardPage() {
  const overview = useApi(() => api.get('/admin/analytics/overview'), []);
  const branchesQuery = useApi(() => api.get('/admin/branches'), []);

  const allBranches = branchesQuery.data?.branches || [];
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

  const expiringSoon = allBranches
    .filter((b) => ['trial', 'active'].includes(b.subscriptionStatus) && b.msRemaining > 0 && b.msRemaining < FORTY_EIGHT_HOURS)
    .sort((a, b) => a.msRemaining - b.msRemaining)
    .slice(0, 8);

  const needsAttention = allBranches
    .filter((b) => ['suspended', 'expired'].includes(b.subscriptionStatus))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 8);

  if (overview.error) {
    return <ErrorState message={overview.error} onRetry={overview.refetch} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {overview.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Skeleton rows={1} />
          <Skeleton rows={1} />
          <Skeleton rows={1} />
          <Skeleton rows={1} />
          <Skeleton rows={1} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            label="Total Users"
            value={overview.data.totalUsers}
            icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" /></svg>}
          />
          <StatCard
            label="Total Branches"
            value={overview.data.totalBranches}
            sublabel={`across ${overview.data.totalBusinesses} businesses`}
            icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 21h18M5 21V7l7-4 7 4v14" /></svg>}
          />
          <StatCard
            label="Active Branches"
            value={overview.data.activeSubscriptions}
            tone="success"
            icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 10h18" /></svg>}
          />
          <StatCard
            label="Expiring Soon"
            value={expiringSoon.length}
            sublabel="< 48 hours left"
            tone={expiringSoon.length > 0 ? 'warning' : 'neutral'}
            icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="New This Week"
            value={overview.data.recentSignups}
            icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" /></svg>}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <Card padded={false}>
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Expiring soon</h3>
            <Link to="/subscriptions?filter=trial" className="text-xs font-medium text-[var(--color-navy-900)] hover:underline">View all</Link>
          </div>
          <div className="px-4 sm:px-5">
            {branchesQuery.isLoading ? (
              <div className="py-4"><Skeleton rows={3} /></div>
            ) : expiringSoon.length === 0 ? (
              <EmptyState title="Nothing expiring soon" message="No branch trials or subscriptions end within 48 hours." />
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {expiringSoon.map((b) => <ExpiringRow key={b.branchId} branch={b} />)}
              </div>
            )}
          </div>
        </Card>

        <Card padded={false}>
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Needs attention</h3>
            <Link to="/subscriptions?filter=suspended" className="text-xs font-medium text-[var(--color-navy-900)] hover:underline">View all</Link>
          </div>
          <div className="px-4 sm:px-5">
            {branchesQuery.isLoading ? (
              <div className="py-4"><Skeleton rows={3} /></div>
            ) : needsAttention.length === 0 ? (
              <EmptyState title="All clear" message="No suspended or expired branches." />
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {needsAttention.map((b) => <AttentionRow key={b.branchId} branch={b} />)}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}