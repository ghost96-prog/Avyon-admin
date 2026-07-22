// src/components/subscriptions/ModuleActivateModal.jsx
//
// Activates/extends ONE module on ONE branch. Same UX pattern as
// ActivateSubscriptionModal (plan presets, exact-date override,
// extend-from toggle, payment fields) hitting the module-scoped endpoint:
//   POST /admin/module-subscriptions/:businessId/branches/:branchId/:moduleId/activate
//
// ✅ FIXES in this version:
// - Amount paid is now fully optional and no longer auto-fills a
//   suggested price when a plan is picked — you can extend/set time
//   with no payment recorded.
// - "Extend from" shows the number of days currently remaining and
//   makes explicit that "Current expiry" stacks the new duration on
//   top of that remaining time, while "Today" recalculates from now.

import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getModuleInfo } from '../../utils/moduleCatalog';

// ✅ Calendar months, not fixed day counts — see addMonths below. A flat
// 30-day "month" drifts by a day whenever the anchor date falls in a
// longer month (e.g. July 22 + 30 days = Aug 21, not Aug 22).
const PLAN_PRESETS = [
  { id: 'monthly', label: '1 Month', months: 1, suggestedPrice: 5 },
  { id: 'biannual', label: '6 Months', months: 6, suggestedPrice: 25 },
  { id: 'annual', label: '12 Months', months: 12, suggestedPrice: 50 },
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

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function toDateTimeInputValue(timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
}
function parseDateTimeInputValue(s) {
  return s ? new Date(s).getTime() : null;
}

// ✅ Add calendar months to a timestamp, preserving time-of-day and
// clamping the day-of-month if the target month is shorter.
function addMonths(timestamp, months) {
  const d = new Date(timestamp);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, daysInTargetMonth));
  return d.getTime();
}

export default function ModuleActivateModal({ open, onClose, branch, moduleId, moduleState, onSuccess }) {
  const toast = useToast();
  const info = getModuleInfo(moduleId);
  const [planId, setPlanId] = useState('monthly');
  const [extendFrom, setExtendFrom] = useState('now');
  const [exactDateTime, setExactDateTime] = useState('');
  const [useExactDate, setUseExactDate] = useState(false);
  // ✅ Amount is optional — starts blank instead of prefilled with the
  // module's list price, so admins can extend/set expiry with no
  // payment recorded.
  const [amount, setAmount] = useState('5');
  const [paymentMethod, setPaymentMethod] = useState('ecocash');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedPlan = PLAN_PRESETS.find((p) => p.id === planId);

  const hasRemainingAccess = moduleState?.accessExpiresAt > Date.now();
  // ✅ Whole days left on the current module subscription, display only.
  const daysRemaining = hasRemainingAccess
    ? Math.max(1, Math.ceil((moduleState.accessExpiresAt - Date.now()) / DAY_MS))
    : 0;

  const anchorTimestamp = extendFrom === 'currentExpiry' && hasRemainingAccess
    ? moduleState.accessExpiresAt
    : Date.now();

  const previewExpiresAt = useMemo(() => {
    if (useExactDate && exactDateTime) return parseDateTimeInputValue(exactDateTime);
    if (selectedPlan?.months) return addMonths(anchorTimestamp, selectedPlan.months);
    return null;
  }, [useExactDate, exactDateTime, selectedPlan, anchorTimestamp]);

  const handlePlanChange = (id) => {
    setPlanId(id);
    // ✅ No longer force-fills the amount field — the suggested price is
    // shown on the button itself as a hint only.
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
      // ✅ Always send the exact timestamp already computed and shown in
      // the preview, so nothing gets recalculated (and potentially
      // drifted by a day) on the backend.
      const explicitExpiresAt = previewExpiresAt;
      await api.post(
        `/admin/module-subscriptions/${branch.businessId}/branches/${branch.branchId}/${moduleId}/activate`,
        {
          ownerId: branch.ownerId,
          durationMonths: selectedPlan?.months || null,
          explicitExpiresAt,
          extendFrom,
          // ✅ Amount stays fully optional — null when left blank.
          amount: amount ? Number(amount) : null,
          paymentMethod,
          note: note || null,
        }
      );
      toast.success(`${info.label} activated for ${branch.branchName}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to activate module.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!info) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Activate ${info.label} — ${branch.branchName}`} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Duration</label>
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
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Extend from</label>
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
              New module access expiry: <span className="font-semibold">{formatDateTime(previewExpiresAt)}</span>
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
          <Select label="Payment method" options={PAYMENT_METHODS} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
        </div>

        <Input label="Note (optional)" placeholder="e.g. Paid via EcoCash, ref #1234" value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting} disabled={!previewExpiresAt}>Activate</Button>
        </div>
      </form>
    </Modal>
  );
}