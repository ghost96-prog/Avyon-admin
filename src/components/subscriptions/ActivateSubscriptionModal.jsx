// src/components/subscriptions/ActivateSubscriptionModal.jsx
//
// ✅ BRANCH-LEVEL MODEL: now activates ONE BRANCH's subscription, not a
// whole business. Takes a `branch` object (must include branchId,
// businessId, ownerId, branchName, accessExpiresAt) instead of a
// `business` object. Hits the new nested endpoint:
//   POST /admin/subscriptions/:businessId/branches/:branchId/activate
//
// Everything else — plan presets, exact date picker (always wins if
// touched), extend-from-now vs extend-from-current-expiry toggle,
// payment amount/method/note — is functionally identical to the
// business-level version, just scoped one level deeper.

import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const PLAN_PRESETS = [
  { id: 'monthly', label: '1 Month', days: 30, suggestedPrice: 7 },
  { id: 'biannual', label: '6 Months', days: 182, suggestedPrice: 50 },
  { id: 'annual', label: '12 Months', days: 365, suggestedPrice: 100 },
  { id: 'custom', label: 'Custom', days: null, suggestedPrice: null },
];

const PAYMENT_METHODS = [
  { value: 'ecocash', label: 'EcoCash' },
  { value: 'cash', label: 'Cash' },
  { value: 'innbucks', label: 'InnBucks' },
  { value: 'omari', label: 'Omari' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

// ✅ Format date with time
function formatDateTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ✅ Format for datetime-local input
function toDateTimeInputValue(timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date();
  // Adjust for timezone offset to get correct local time
  const offset = d.getTimezoneOffset();
  const localTime = new Date(d.getTime() - offset * 60000);
  return localTime.toISOString().slice(0, 16);
}

// ✅ Parse datetime-local input value to timestamp
function parseDateTimeInputValue(dateTimeString) {
  if (!dateTimeString) return null;
  const d = new Date(dateTimeString);
  return d.getTime();
}

export default function ActivateSubscriptionModal({ open, onClose, branch, onSuccess }) {
  const toast = useToast();
  const [planId, setPlanId] = useState('monthly');
  const [extendFrom, setExtendFrom] = useState('now');
  const [exactDateTime, setExactDateTime] = useState('');
  const [useExactDate, setUseExactDate] = useState(false);
  const [amount, setAmount] = useState('10');
  const [paymentMethod, setPaymentMethod] = useState('ecocash');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedPlan = PLAN_PRESETS.find((p) => p.id === planId);

  const anchorTimestamp = extendFrom === 'currentExpiry' && branch.accessExpiresAt > Date.now()
    ? branch.accessExpiresAt
    : Date.now();

  const previewExpiresAt = useMemo(() => {
    if (useExactDate && exactDateTime) {
      return parseDateTimeInputValue(exactDateTime);
    }
    if (selectedPlan?.days) {
      return anchorTimestamp + selectedPlan.days * 24 * 60 * 60 * 1000;
    }
    return null;
  }, [useExactDate, exactDateTime, selectedPlan, anchorTimestamp]);

  const handlePlanChange = (id) => {
    setPlanId(id);
    const plan = PLAN_PRESETS.find((p) => p.id === id);
    if (plan?.suggestedPrice) {
      setAmount(String(plan.suggestedPrice));
    }
    if (id === 'custom') {
      setUseExactDate(true);
      if (!exactDateTime) setExactDateTime(toDateTimeInputValue(anchorTimestamp));
    } else {
      setUseExactDate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // ✅ If using exact date, pass the full timestamp including time
      let explicitExpiresAt = null;
      if (useExactDate && exactDateTime) {
        explicitExpiresAt = parseDateTimeInputValue(exactDateTime);
      }
      
      // If using a plan (not custom), ensure we're using end of day
      if (selectedPlan?.days && !useExactDate) {
        // Already using plan duration from anchorTimestamp
      }

      await api.post(`/admin/subscriptions/${branch.businessId}/branches/${branch.branchId}/activate`, {
        ownerId: branch.ownerId,
        plan: planId,
        durationDays: selectedPlan?.days || null,
        explicitExpiresAt: explicitExpiresAt,
        extendFrom,
        amount: amount ? Number(amount) : null,
        paymentMethod,
        note: note || null,
      });
      toast.success(`${branch.branchName} activated successfully.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to activate subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Activate — ${branch.branchName}`} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Plan</label>
          <div className="grid grid-cols-4 gap-2">
            {PLAN_PRESETS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => handlePlanChange(plan.id)}
                className={`py-2.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                  planId === plan.id
                    ? 'border-[var(--color-navy-900)] bg-[var(--color-navy-900)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-navy-700)]'
                }`}
              >
                {plan.label}
                {plan.suggestedPrice && <span className="block text-[10px] opacity-70 mt-0.5">${plan.suggestedPrice}</span>}
              </button>
            ))}
          </div>
        </div>

        {branch.accessExpiresAt > Date.now() && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
              Extend from
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExtendFrom('currentExpiry')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  extendFrom === 'currentExpiry'
                    ? 'border-[var(--color-teal-600)] bg-[var(--color-success-bg)] text-[var(--color-success)]'
                    : 'border-[var(--color-border)] text-[var(--color-text)]'
                }`}
              >
                Current expiry (stacks remaining time)
              </button>
              <button
                type="button"
                onClick={() => setExtendFrom('now')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  extendFrom === 'now'
                    ? 'border-[var(--color-navy-700)] bg-[var(--color-navy-100)] text-[var(--color-navy-900)]'
                    : 'border-[var(--color-border)] text-[var(--color-text)]'
                }`}
              >
                Today (resets remaining time)
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)] mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useExactDate}
              onChange={(e) => {
                setUseExactDate(e.target.checked);
                if (e.target.checked && !exactDateTime) setExactDateTime(toDateTimeInputValue(anchorTimestamp));
              }}
              className="rounded"
            />
            Set an exact expiry date & time instead
          </label>
          {useExactDate && (
            <Input
              type="datetime-local"
              value={exactDateTime}
              onChange={(e) => setExactDateTime(e.target.value)}
              min={toDateTimeInputValue(Date.now())}
            />
          )}
        </div>

        {previewExpiresAt && (
          <div className="bg-[var(--color-success-bg)] rounded-lg px-3.5 py-2.5">
            <p className="text-xs text-[var(--color-success)]">
              New access expiry: <span className="font-semibold">{formatDateTime(previewExpiresAt)}</span>
            </p>
            {useExactDate && exactDateTime && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                Exact date & time mode — the subscription will expire at this precise time
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount paid (USD)"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Select
            label="Payment method"
            options={PAYMENT_METHODS}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </div>

        <Input
          label="Note (optional)"
          placeholder="e.g. Paid via EcoCash, ref #1234"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting} disabled={!previewExpiresAt}>
            Activate
          </Button>
        </div>
      </form>
    </Modal>
  );
}