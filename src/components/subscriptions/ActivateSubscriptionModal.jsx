// src/components/subscriptions/ActivateSubscriptionModal.jsx
//
// ✅ BRANCH-LEVEL MODEL: activates ONE BRANCH's subscription. Takes a
// `branch` object (must include branchId, businessId, ownerId,
// branchName, accessExpiresAt). Hits:
//   POST /admin/subscriptions/:businessId/branches/:branchId/activate
//
// ✅ FIXES in this version:
// - Amount paid is now fully optional, both functionally (was already
//   optional in the request payload) and visually — the field no longer
//   auto-fills a suggested price when you pick a plan, so you can just
//   extend/set time without recording any payment.
// - "Extend from" now shows exactly how many days are currently
//   remaining and states plainly that choosing "Current expiry" adds
//   the new duration on top of that remaining time, while "Today"
//   recalculates purely from now. The preview box spells this out too.

import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// ✅ Calendar months, not fixed day counts. "1 Month" as a flat 30 days
// drifts by a day (or more) whenever the anchor date falls in a longer
// month — e.g. July 22 + 30 days = Aug 21, not Aug 22. Using real
// calendar-month arithmetic (see addMonths below) keeps the expiry on
// the same day-of-month the admin actually expects.
const PLAN_PRESETS = [
  { id: 'monthly', label: '1 Month', months: 1, suggestedPrice: 7 },
  { id: 'biannual', label: '6 Months', months: 6, suggestedPrice: 30 },
  { id: 'annual', label: '12 Months', months: 12, suggestedPrice: 65 },
  { id: 'custom', label: 'Custom', months: null, suggestedPrice: null },
];

const PAYMENT_METHODS = [
  { value: 'ecocash', label: 'EcoCash' },
  { value: 'cash', label: 'Cash' },
  { value: 'innbucks', label: 'InnBucks' },
  { value: 'omari', label: 'Omari' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

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

// ✅ Add calendar months to a timestamp, preserving time-of-day and
// clamping the day-of-month if the target month is shorter (e.g. Jan 31
// + 1 month -> Feb 28/29, not an overflow into March).
function addMonths(timestamp, months) {
  const d = new Date(timestamp);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, daysInTargetMonth));
  return d.getTime();
}

export default function ActivateSubscriptionModal({ open, onClose, branch, onSuccess }) {
  const toast = useToast();
  const [planId, setPlanId] = useState('monthly');
  const [extendFrom, setExtendFrom] = useState('now');
  const [exactDateTime, setExactDateTime] = useState('');
  const [useExactDate, setUseExactDate] = useState(false);
  // ✅ Amount is optional — starts blank instead of prefilled, so admins
  // can extend/set expiry without being nudged into recording a payment.
  const [amount, setAmount] = useState('7');
  const [paymentMethod, setPaymentMethod] = useState('ecocash');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedPlan = PLAN_PRESETS.find((p) => p.id === planId);

  const hasRemainingAccess = branch.accessExpiresAt > Date.now();
  // ✅ Whole days left on the current subscription, for display only.
  const daysRemaining = hasRemainingAccess
    ? Math.max(1, Math.ceil((branch.accessExpiresAt - Date.now()) / DAY_MS))
    : 0;

  const anchorTimestamp = extendFrom === 'currentExpiry' && hasRemainingAccess
    ? branch.accessExpiresAt
    : Date.now();

  const previewExpiresAt = useMemo(() => {
    if (useExactDate && exactDateTime) {
      return parseDateTimeInputValue(exactDateTime);
    }
    if (selectedPlan?.months) {
      return addMonths(anchorTimestamp, selectedPlan.months);
    }
    return null;
  }, [useExactDate, exactDateTime, selectedPlan, anchorTimestamp]);

  const handlePlanChange = (id) => {
    setPlanId(id);
    // ✅ No longer force-fills the amount field — the suggested price is
    // shown on the button itself as a hint, but typing/leaving it blank
    // is entirely up to the admin.
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
      // ✅ Always send the exact timestamp we already computed and showed
      // in the preview — whether it came from a plan (calendar months)
      // or a manually chosen exact date. This guarantees what you saw on
      // screen is what gets saved; the backend no longer redoes day math
      // that could drift by a day depending on month length.
      const explicitExpiresAt = previewExpiresAt;

      await api.post(`/admin/subscriptions/${branch.businessId}/branches/${branch.branchId}/activate`, {
        ownerId: branch.ownerId,
        plan: planId,
        durationMonths: selectedPlan?.months || null,
        explicitExpiresAt: explicitExpiresAt,
        extendFrom,
        // ✅ Amount stays fully optional — null when left blank, so this
        // can be used purely to extend/set time with no payment record.
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

        {hasRemainingAccess && (
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
                Current expiry ({daysRemaining}d left) — adds on top
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
                Today — resets, calculates fresh from now
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
            {!useExactDate && selectedPlan?.months && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                {extendFrom === 'currentExpiry' && hasRemainingAccess
                  ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining + ${selectedPlan.months} month${selectedPlan.months === 1 ? '' : 's'} added on top`
                  : `Calculated from today — ${selectedPlan.months} month${selectedPlan.months === 1 ? '' : 's'} from now`}
              </p>
            )}
            {useExactDate && exactDateTime && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                Exact date & time mode — the subscription will expire at this precise time
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount paid (USD) — optional"
            type="number"
            min="0"
            step="0.01"
            placeholder="Leave blank to just extend time"
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