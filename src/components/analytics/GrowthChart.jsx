// src/components/analytics/GrowthChart.jsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card from '../ui/Card';
import { Skeleton, EmptyState } from '../ui/States';

function formatPeriodLabel(period) {
  const parts = period.split('-');
  if (parts.length === 1) return parts[0];
  const date = new Date(`${period}-01`);
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-navy-950)] text-white rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium mb-0.5">{formatPeriodLabel(label)}</p>
      <p className="tabular text-[var(--color-teal-500)]">{payload[0].value} new users</p>
    </div>
  );
}

export default function GrowthChart({ data, isLoading }) {
  return (
    <Card padded={false}>
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">User growth</h3>
      </div>
      <div className="p-5">
        {isLoading ? (
          <Skeleton rows={1} className="!h-64" />
        ) : !data?.growth?.length ? (
          <EmptyState title="No signup data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.growth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-teal-500)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-teal-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="period"
                tickFormatter={formatPeriodLabel}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={32}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
              <Area type="monotone" dataKey="count" stroke="var(--color-teal-600)" strokeWidth={2} fill="url(#growthGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
