// src/components/analytics/RevenueChart.jsx
//
// Bar chart of recorded payments over time. This is the one chart that
// didn't exist as raw data anywhere before this chunk — it's aggregated
// server-side from subscriptionHistory's `activated` entries (see
// backend chunk 5, getRevenueAnalytics).

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card from '../ui/Card';
import { Skeleton, EmptyState } from '../ui/States';

function formatPeriodLabel(period) {
  // "2026-06" -> "Jun 2026"; "2026-06-15" -> "Jun 15"; "2026" -> "2026"
  const parts = period.split('-');
  if (parts.length === 1) return parts[0];
  const date = new Date(parts.length === 2 ? `${period}-01` : period);
  return date.toLocaleDateString(undefined, parts.length === 2 ? { month: 'short', year: 'numeric' } : { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-navy-950)] text-white rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium mb-0.5">{formatPeriodLabel(label)}</p>
      <p className="tabular text-[var(--color-teal-500)]">${payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export default function RevenueChart({ data, isLoading }) {
  return (
    <Card padded={false}>
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Revenue from recorded payments</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Based on amounts entered during subscription activation — not a live payment gateway.</p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <Skeleton rows={1} className="!h-64" />
        ) : !data?.series?.length ? (
          <EmptyState title="No recorded payments yet" message="Revenue will appear here once you activate a subscription with a payment amount." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="period"
                tickFormatter={formatPeriodLabel}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-neutral-bg)' }} />
              <Bar dataKey="revenue" fill="var(--color-navy-900)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
