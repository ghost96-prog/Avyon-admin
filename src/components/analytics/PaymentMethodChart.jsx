// src/components/analytics/PaymentMethodChart.jsx
//
// Which payment methods customers actually use, by total recorded
// amount — useful since you support EcoCash/Cash/InnBucks/Omari and
// might want to know where to focus.

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card from '../ui/Card';
import { Skeleton, EmptyState } from '../ui/States';

const METHOD_LABELS = {
  ecocash: 'EcoCash',
  cash: 'Cash',
  innbucks: 'InnBucks',
  omari: 'Omari',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
  unspecified: 'Unspecified',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-[var(--color-navy-950)] text-white rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="tabular text-[var(--color-teal-500)]">${entry.value.toFixed(2)}</p>
    </div>
  );
}

export default function PaymentMethodChart({ data, isLoading }) {
  const chartData = (data?.byPaymentMethod || []).map((d) => ({
    ...d,
    label: METHOD_LABELS[d.method] || d.method,
  }));

  return (
    <Card padded={false}>
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Revenue by payment method</h3>
      </div>
      <div className="p-5">
        {isLoading ? (
          <Skeleton rows={1} className="!h-48" />
        ) : chartData.length === 0 ? (
          <EmptyState title="No recorded payments yet" />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 44)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-text)' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-neutral-bg)' }} />
              <Bar dataKey="amount" fill="var(--color-teal-600)" radius={[0, 4, 4, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
