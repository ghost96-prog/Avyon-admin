// src/components/ui/StatCard.jsx
import React from 'react';
import Card from './Card';

export default function StatCard({ label, value, sublabel, tone = 'neutral', icon }) {
  const toneColors = {
    neutral: 'text-[var(--color-navy-900)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    danger: 'text-[var(--color-danger)]',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
          <p className={`text-2xl font-semibold mt-1.5 tabular ${toneColors[tone]}`}>{value}</p>
          {sublabel && <p className="text-xs text-[var(--color-text-muted)] mt-1">{sublabel}</p>}
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-[var(--color-neutral-bg)] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
