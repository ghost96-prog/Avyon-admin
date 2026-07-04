// src/components/businesses/BusinessRow.jsx
//
// ✅ BRANCH-LEVEL MODEL: a business no longer has ONE subscription status
// — the backend's getAllBusinesses now returns the WORST status across
// all its branches (suspended > expired > trial > active) plus which
// branch that was, so this row can flag "something needs attention here"
// without claiming to show a single subscription that doesn't exist.

import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import { useLiveCountdown } from '../../hooks/useLiveCountdown';
import { formatDate } from '../../utils/countdown';

export default function BusinessRow({ business }) {
  const { countdownText, msRemaining } = useLiveCountdown(business.accessExpiresAt);

  const isLowTime = msRemaining !== null && msRemaining > 0 && msRemaining < 24 * 60 * 60 * 1000;
  const countdownColor = !countdownText
    ? 'text-[var(--color-text-muted)]'
    : isLowTime
      ? 'text-[var(--color-warning)]'
      : 'text-[var(--color-text)]';

  return (
    <Link
      to={`/businesses/${business.businessId}?ownerId=${business.ownerId}`}
      className="grid grid-cols-[1.6fr_1fr_0.9fr_1fr_0.8fr] items-center px-5 py-3.5 hover:bg-[var(--color-neutral-bg)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
    >
      <div className="min-w-0 pr-3">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">{business.businessName}</p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">{business.ownerEmail}</p>
      </div>

      <div>
        <StatusBadge status={business.subscriptionStatus} size="sm" />
        {business.businessStatus === 'suspended' && (
          <p className="text-[10px] text-[var(--color-danger)] mt-1">Account suspended</p>
        )}
      </div>

      <div className="text-xs text-[var(--color-text-muted)]">
        {business.branchCount} branch{business.branchCount === 1 ? '' : 'es'}
      </div>

      <div className={`tabular text-xs font-medium ${countdownColor}`}>
        {countdownText || (business.subscriptionStatus === 'suspended' ? '—' : 'Expired')}
        {business.mostUrgentBranchName && business.branchCount > 1 && (
          <span className="block text-[10px] text-[var(--color-text-muted)] font-normal mt-0.5">{business.mostUrgentBranchName}</span>
        )}
      </div>

      <div className="text-xs text-[var(--color-text-muted)]">
        {formatDate(business.createdAt)}
      </div>
    </Link>
  );
}
