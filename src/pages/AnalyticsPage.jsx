// src/pages/AnalyticsPage.jsx
import React from 'react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import StatCard from '../components/ui/StatCard';
import RevenueChart from '../components/analytics/RevenueChart';
import GrowthChart from '../components/analytics/GrowthChart';
import StatusBreakdownChart from '../components/analytics/StatusBreakdownChart';
import PaymentMethodChart from '../components/analytics/PaymentMethodChart';
import { ErrorState } from '../components/ui/States';

const ICON_PROPS = { className: 'w-[18px] h-[18px] text-[var(--color-navy-900)]', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' };

export default function AnalyticsPage() {
  const revenue = useApi(() => api.get('/admin/analytics/revenue'), []);
  const growth = useApi(() => api.get('/admin/analytics/users/growth'), []);
  const branchesQuery = useApi(() => api.get('/admin/branches'), []);

  if (revenue.error) {
    return <ErrorState message={revenue.error} onRetry={revenue.refetch} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Total Recorded Revenue"
          value={revenue.data ? `$${revenue.data.totalRevenue.toFixed(2)}` : '—'}
          tone="success"
          sublabel="All-time, from activation records"
          icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.66 0-3 .9-3 2s1.34 2 3 2 3 .9 3 2-1.34 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2" /></svg>}
        />
        <StatCard
          label="Total Payments Recorded"
          value={revenue.data?.totalPayments ?? '—'}
          icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 10h18" /></svg>}
        />
        <StatCard
          label="Average Payment"
          value={revenue.data ? `$${revenue.data.averagePayment.toFixed(2)}` : '—'}
          icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 3v18h18M7 16l4-6 3 3 5-7" /></svg>}
        />
      </div>

      <RevenueChart data={revenue.data} isLoading={revenue.isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <GrowthChart data={growth.data} isLoading={growth.isLoading} />
        <StatusBreakdownChart branches={branchesQuery.data?.branches} isLoading={branchesQuery.isLoading} />
      </div>

      <PaymentMethodChart data={revenue.data} isLoading={revenue.isLoading} />

      <p className="text-xs text-[var(--color-text-muted)] text-center pt-2 px-2">
        Revenue figures reflect amounts you've manually recorded during subscription activation —
        this panel doesn't connect to a payment gateway, so these numbers are only as accurate as
        what's entered on each activation.
      </p>
    </div>
  );
}