// src/components/businesses/BranchSubscriptionCard.jsx
//
// ✅ BRANCH-LEVEL MODEL: this REPLACES the old SubscriptionHeaderCard,
// which was one big block at the top of the business detail page for the
// (single, business-wide) subscription. Now every branch has its own
// subscription, so this renders once PER BRANCH inside BranchesSection —
// a compact card rather than a full-width hero, since a business with
// several branches needs to show several of these without overwhelming
// the page.

import React from 'react';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import { useLiveCountdown } from '../../hooks/useLiveCountdown';
import { formatDateTime } from '../../utils/countdown';

const PLAN_LABELS = {
  monthly: '1 Month Plan',
  biannual: '6 Month Plan',
  annual: '12 Month Plan',
  custom: 'Custom Plan',
};

export default function BranchSubscriptionCard({ branch, onActivate, onSuspend, onResume }) {
  const { countdownText, msRemaining } = useLiveCountdown(branch.accessExpiresAt);
  const isLowTime = msRemaining !== null && msRemaining > 0 && msRemaining < 24 * 60 * 60 * 1000;
  const isSuspended = branch.subscriptionStatus === 'suspended';

  return (
    <div className="bg-[var(--color-navy-950)] rounded-xl p-5 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h4 className="text-sm font-semibold">
              {branch.name}
              {branch.isMain && <span className="text-[10px] text-white/40 ml-1.5 font-normal">MAIN</span>}
            </h4>
            <StatusBadge status={branch.subscriptionStatus} size="sm" />
          </div>
          <p className="text-xs text-white/40">
            {branch.subscriptionPlan && <>{PLAN_LABELS[branch.subscriptionPlan] || branch.subscriptionPlan} · </>}
            Last payment: {branch.lastPaymentAmount ? `$${branch.lastPaymentAmount} via ${branch.lastPaymentMethod || '—'}` : 'none recorded'}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          {isSuspended ? (
            <Button variant="success" size="sm" onClick={onResume}>Resume</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="!border-white/20 !text-white hover:!bg-white/10" onClick={onSuspend}>
                Suspend
              </Button>
              <Button variant="primary" size="sm" className="!bg-[var(--color-teal-600)] hover:!bg-[var(--color-teal-500)]" onClick={onActivate}>
                Activate / Extend
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-0.5">
            {isSuspended ? 'Suspended reason' : branch.subscriptionStatus === 'trial' ? 'Trial ends in' : 'Subscription ends in'}
          </p>
          {isSuspended ? (
            <p className="text-xs text-white/90">{branch.suspendedReason || 'No reason given'}</p>
          ) : (
            <p className={`tabular text-base font-semibold ${isLowTime ? 'text-[var(--color-warning)]' : 'text-white'}`}>
              {countdownText || 'Expired'}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-0.5">Access expires</p>
          <p className="text-xs text-white/90">{formatDateTime(branch.accessExpiresAt)}</p>
        </div>
      </div>
    </div>
  );
}
