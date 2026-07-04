// src/components/ui/StatusBadge.jsx
//
// Single source of truth for how subscription/account status is rendered
// as a colored badge — used in the businesses table, business detail
// header, and anywhere else a status needs to be shown. Keeping this in
// one component means "what color is 'suspended'?" only has one answer
// in the whole app.

import React from 'react';

const STATUS_CONFIG = {
  trial: { label: 'Trial', bg: 'var(--color-neutral-bg)', fg: 'var(--color-neutral)' },
  active: { label: 'Active', bg: 'var(--color-success-bg)', fg: 'var(--color-success)' },
  expired: { label: 'Expired', bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)' },
  suspended: { label: 'Suspended', bg: '#fef2f2', fg: '#991b1b' },
  cancelled: { label: 'Cancelled', bg: 'var(--color-neutral-bg)', fg: 'var(--color-neutral)' },
  unknown: { label: 'Unknown', bg: 'var(--color-neutral-bg)', fg: 'var(--color-neutral)' },
};

// Trial/active with < 24h remaining gets a distinct "low time" treatment
// even though the underlying status is still trial/active — this is the
// signal an admin actually cares about scanning for ("who's about to lapse").
const LOW_TIME_CONFIG = { label: 'Ending soon', bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)' };

export default function StatusBadge({ status, msRemaining = null, size = 'md' }) {
  const isLowTime = msRemaining !== null && msRemaining > 0 && msRemaining < 24 * 60 * 60 * 1000 && ['trial', 'active'].includes(status);
  const config = isLowTime ? LOW_TIME_CONFIG : (STATUS_CONFIG[status] || STATUS_CONFIG.unknown);

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: config.bg, color: config.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.fg }} />
      {config.label}
    </span>
  );
}
