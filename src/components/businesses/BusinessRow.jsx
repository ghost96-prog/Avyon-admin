// src/components/businesses/BusinessRow.jsx
//
// ✅ BRANCH-LEVEL MODEL: a business no longer has ONE subscription status
// — the backend's getAllBusinesses now returns the WORST status across
// all its branches (suspended > expired > trial > active) plus which
// branch that was, so this row can flag "something needs attention here"
// without claiming to show a single subscription that doesn't exist.
//
// ✅ Removed the "time left" countdown column — subscription expiry is
// per-branch now (see /admin/branches and /admin/subscriptions/:businessId/
// branches/:branchId/*), so there's no single accessExpiresAt to show here.
// If a business has a branch needing attention, we surface which branch
// that is as a subtext under the status badge instead.
//
// ✅ NEW — Actions column with a permanent-delete (trash) button. The row
// itself is a Link to the business detail page, so the delete button
// calls preventDefault/stopPropagation before invoking onDeleteClick —
// otherwise clicking it would also navigate away. Confirmation itself
// happens in the parent (BusinessesPage) via ConfirmModal; this button
// only stages the target.

import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import { formatDate } from '../../utils/countdown';

export default function BusinessRow({ business, onDeleteClick }) {
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteClick?.(business);
  };

  return (
    <Link
      to={`/businesses/${business.businessId}?ownerId=${business.ownerId}`}
      className="grid grid-cols-[1.8fr_1fr_1fr_0.9fr_auto] items-center px-5 py-3.5 hover:bg-[var(--color-neutral-bg)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
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
        {business.mostUrgentBranchName && business.branchCount > 1 && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1 truncate">{business.mostUrgentBranchName}</p>
        )}
      </div>

      <div className="text-xs text-[var(--color-text-muted)]">
        {business.branchCount} branch{business.branchCount === 1 ? '' : 'es'}
      </div>

      <div className="text-xs text-[var(--color-text-muted)]">
        {formatDate(business.createdAt)}
      </div>

      <div className="pl-3 text-right">
        <button
          type="button"
          onClick={handleDeleteClick}
          title="Permanently delete this business"
          aria-label="Delete business"
          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </Link>
  );
}