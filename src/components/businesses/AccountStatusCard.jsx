// src/components/businesses/AccountStatusCard.jsx
//
// Distinct from subscription suspend/resume (SuspendModal/ResumeModal).
// That lever is "non-payment" with customer-facing messaging. This lever
// is `business.status` ('active'/'suspended') — meant for abuse/fraud,
// shown smaller and separately so the two are never confused. Toggling
// this does NOT touch subscriptionStatus or accessExpiresAt at all.

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AccountStatusCard({ business, onRefetch }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isSuspended = business.status === 'suspended';

  const handleToggle = async () => {
    const nextStatus = isSuspended ? 'active' : 'suspended';
    const confirmed = window.confirm(
      nextStatus === 'suspended'
        ? `Suspend ${business.businessName}'s account entirely? This is for abuse/fraud — separate from subscription billing.`
        : `Reactivate ${business.businessName}'s account?`
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await api.put(`/admin/businesses/${business.businessId}/account-status`, {
        ownerId: business.ownerId,
        status: nextStatus,
      });
      toast.success(`Account ${nextStatus}.`);
      onRefetch();
    } catch (err) {
      toast.error(err.message || 'Failed to update account status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-dashed">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text)]">Account status (abuse / fraud lever)</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Separate from subscription billing. Use this only for policy violations, not non-payment —
            use Suspend on the subscription card above for that.
          </p>
        </div>
        <Button
          variant={isSuspended ? 'success' : 'ghost'}
          size="sm"
          loading={submitting}
          onClick={handleToggle}
          className="shrink-0"
        >
          {isSuspended ? 'Reactivate account' : 'Suspend account'}
        </Button>
      </div>
    </Card>
  );
}
