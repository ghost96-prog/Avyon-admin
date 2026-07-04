// src/components/analytics/StatusBreakdownChart.jsx
//
// ✅ BRANCH-LEVEL MODEL: derived from the FLAT BRANCH list
// (GET /admin/branches), not the businesses list. Branches are the
// actual billable unit, so a true status breakdown ("how many things we
// bill are in each state") has to count branches, not businesses — a
// business-level count would either double-count multi-branch businesses
// under one status or hide their per-branch nuance entirely.

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../ui/Card';
import { Skeleton, EmptyState } from '../ui/States';

const STATUS_COLORS = {
  trial: '#64748b',
  active: '#16a34a',
  expired: '#dc2626',
  suspended: '#991b1b',
  cancelled: '#94a3b8',
};

const STATUS_LABELS = {
  trial: 'Trial',
  active: 'Active',
  expired: 'Expired',
  suspended: 'Suspended',
  cancelled: 'Cancelled',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-[var(--color-navy-950)] text-white rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">{STATUS_LABELS[entry.name] || entry.name}: {entry.value}</p>
    </div>
  );
}

export default function StatusBreakdownChart({ branches, isLoading }) {
  const counts = {};
  for (const b of branches || []) {
    const status = b.subscriptionStatus || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  }
  const data = Object.entries(counts).map(([status, value]) => ({ name: status, value }));

  return (
    <Card padded={false}>
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Branch subscription status breakdown</h3>
      </div>
      <div className="p-5">
        {isLoading ? (
          <Skeleton rows={1} className="!h-64" />
        ) : data.length === 0 ? (
          <EmptyState title="No branches yet" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => STATUS_LABELS[value] || value}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
