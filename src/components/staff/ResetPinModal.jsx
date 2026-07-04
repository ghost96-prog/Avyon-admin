// src/components/staff/ResetPinModal.jsx
//
// The exact feature requested: "we do this for users that may forget
// their employee pins." Enforces 4-digit numeric on the client as a fast
// fail, but the real duplicate-PIN check happens server-side (see
// adminBusinessControllers.updateStaffMember) since that requires
// querying every other staff member's PIN, which the client doesn't have
// visibility into (PINs are deliberately never sent to the client — see
// getBusinessDetail's `hasPin` stripping).

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ResetPinModal({ open, onClose, business, staff, onSuccess }) {
  const toast = useToast();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!/^\d{4}$/.test(pin)) {
      setLocalError('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setLocalError('PINs do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/admin/businesses/${business.businessId}/staff/${staff.staffId}`, {
        ownerId: business.ownerId,
        newPin: pin,
      });
      toast.success(`PIN reset for ${staff.name}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      // Server returns 409 specifically for PIN collisions — surface that
      // message directly rather than a generic failure.
      setLocalError(err.message || 'Failed to reset PIN.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinInput = (value, setter) => {
    setter(value.replace(/\D/g, '').slice(0, 4));
  };

  return (
    <Modal open={open} onClose={onClose} title={`Reset PIN — ${staff.name}`} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          {staff.role === 'owner'
            ? 'This is the business owner. Resetting their PIN changes how they sign into the POS terminal.'
            : `${staff.name} (${staff.role}) will need to use this new PIN next time they sign in.`}
        </p>

        {localError && (
          <div className="text-xs text-[var(--color-danger)] bg-[var(--color-danger-bg)] rounded-lg px-3 py-2">{localError}</div>
        )}

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">New 4-digit PIN</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => handlePinInput(e.target.value, setPin)}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-center text-lg tracking-[0.5em] tabular focus:border-[var(--color-teal-500)] outline-none"
            placeholder="••••"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Confirm PIN</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-center text-lg tracking-[0.5em] tabular focus:border-[var(--color-teal-500)] outline-none"
            placeholder="••••"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting} disabled={pin.length !== 4}>Reset PIN</Button>
        </div>
      </form>
    </Modal>
  );
}
