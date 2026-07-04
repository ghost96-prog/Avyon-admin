// src/components/subscriptions/SubscriptionBranchRow.jsx
//
// Row for the dedicated Subscriptions page — one row per BRANCH (the
// actual billable unit), distinct from BusinessRow (one row per business,
// used on the Businesses page for browsing by company). Clicking through
// still lands on the business detail page, since that's where the actual
// activate/suspend/resume actions live (nested per-branch there) — this
// page is for finding and reviewing, not acting.

import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import { useLiveCountdown } from '../../hooks/useLiveCountdown';

const PLAN_LABELS = {
  monthly: '1 Month',
  biannual: '6 Months',
  annual: '12 Months',
  custom: 'Custom',
};

export default function SubscriptionBranchRow({ branch }) {
  const { countdownText, msRemaining } = useLiveCountdown(branch.accessExpiresAt);
  const isLowTime = msRemaining !== null && msRemaining > 0 && msRemaining < 24 * 60 * 60 * 1000;
  const countdownColor = !countdownText
    ? 'text-[var(--color-text-muted)]'
    : isLowTime
      ? 'text-[var(--color-warning)]'
      : 'text-[var(--color-text)]';

  return (
    <Link
      to={`/businesses/${branch.businessId}?ownerId=${branch.ownerId}`}
      className="grid grid-cols-[1.4fr_1.2fr_0.8fr_0.9fr_0.9fr_0.8fr] items-center px-5 py-3.5 hover:bg-[var(--color-neutral-bg)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
    >
      <div className="min-w-0 pr-3">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">
          {branch.branchName}
          {branch.isMain && <span className="text-[10px] text-[var(--color-text-muted)] ml-1.5 font-normal">MAIN</span>}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">{branch.businessName}</p>
      </div>

      <div className="text-xs text-[var(--color-text-muted)] truncate pr-2">{branch.ownerEmail}</div>

      <div><StatusBadge status={branch.subscriptionStatus} size="sm" /></div>

      <div className="text-xs text-[var(--color-text-muted)]">
        {branch.subscriptionPlan ? (PLAN_LABELS[branch.subscriptionPlan] || branch.subscriptionPlan) : '—'}
      </div>

      <div className={`tabular text-xs font-medium ${countdownColor}`}>
        {countdownText || (branch.subscriptionStatus === 'suspended' ? '—' : 'Expired')}
      </div>

      <div className="text-xs text-[var(--color-text-muted)]">
        {branch.lastPaymentAmount ? `$${branch.lastPaymentAmount}` : '—'}
      </div>
    </Link>
  );
}
