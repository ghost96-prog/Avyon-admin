// src/components/subscriptions/SubscriptionHistoryCard.jsx
//
// ✅ BRANCH-LEVEL: reads ONE branch's combined history — the backend now
// merges the base `subscriptionHistory` subcollection with every
// module's `moduleSubscriptionHistory` subcollection (Inventory
// Management / Advanced Inventory Management / Analytics add-ons) into a
// single createdAt-sorted timeline (see getSubscriptionHistory). Entries
// that came from a module carry a `moduleId` + `moduleLabel` so they can
// be labeled distinctly from base-subscription events instead of just
// showing "Activated" with no indication of which plan it was.

import React from 'react';
import Card from '../ui/Card';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import { Skeleton, EmptyState } from '../ui/States';
import { formatDateTime } from '../../utils/countdown';

const EVENT_CONFIG = {
  activated: { label: 'Activated', color: 'var(--color-success)' },
  suspended: { label: 'Suspended', color: 'var(--color-danger)' },
  resumed: { label: 'Resumed', color: 'var(--color-success)' },
  auto_expired: { label: 'Auto-expired', color: 'var(--color-warning)' },
  trial_started: { label: 'Trial started', color: 'var(--color-success)' },
};

function HistoryRow({ entry }) {
  const config = EVENT_CONFIG[entry.type] || { label: entry.type, color: 'var(--color-neutral)' };
  // ✅ Module-sourced entries (moduleId present) get their plan name
  // prefixed onto the label so "Activated" doesn't read as ambiguous
  // between the base subscription and an add-on module.
  const label = entry.moduleId ? `${entry.moduleLabel || entry.moduleId} — ${config.label}` : config.label;

  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: config.color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
          <span className="text-xs text-[var(--color-text-muted)] shrink-0">{formatDateTime(entry.createdAt)}</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {entry.type === 'activated' && (
            <>
              {entry.amount ? `$${entry.amount} via ${entry.paymentMethod || '—'}` : 'No amount recorded'}
              {entry.note && ` — "${entry.note}"`}
            </>
          )}
          {entry.type === 'suspended' && entry.reason}
          {entry.type === 'resumed' && `Restored to ${entry.restoredStatus}`}
          {entry.type === 'auto_expired' && `${entry.previousStatus} → ${entry.newStatus}`}
          {entry.type === 'trial_started' && 'Free trial started'}
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionHistoryCard({ branch }) {
  const { data, isLoading } = useApi(
    () => api.get(`/admin/subscriptions/${branch.businessId}/branches/${branch.branchId}/history?ownerId=${branch.ownerId}`),
    [branch.businessId, branch.branchId, branch.ownerId]
  );

  const history = data?.history || [];

  return (
    <Card padded={false}>
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">History — {branch.branchName}</h3>
      </div>
      {isLoading ? (
        <div className="p-5"><Skeleton rows={3} /></div>
      ) : history.length === 0 ? (
        <EmptyState title="No history yet" message="Activation, suspension, and resume events for this branch will appear here." />
      ) : (
        <div className="divide-y divide-[var(--color-border)] max-h-72 overflow-y-auto">
          {history.map((entry) => <HistoryRow key={entry.id} entry={entry} />)}
        </div>
      )}
    </Card>
  );
}