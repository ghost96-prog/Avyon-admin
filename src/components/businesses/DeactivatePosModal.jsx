// src/components/businesses/DeactivatePosModal.jsx
//
// Quick-action counterpart to ResetPinModal for POS terminals: lets an
// admin deactivate an active terminal (e.g. a lost, stolen or replaced
// device) without opening the full edit form. Uses the same admin
// endpoint as the Edit modal — it just sends { status: 'inactive' }.

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function DeactivatePosModal({ open, onClose, business, branch, pos, onSuccess }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (submitting) return;
    setError('');
    onClose();
  };

  const handleConfirm = async () => {
    setError('');
    setSubmitting(true);
    try {
      await api.put(
        `/admin/businesses/${business.businessId}/branches/${branch.branchId}/pos-terminals/${pos.posId}`,
        {
          ownerId: business.ownerId,
          status: 'inactive',
        }
      );
      toast.success(`${pos.name} has been deactivated.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to deactivate POS terminal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!pos) return null;

  return (
    <Modal open={open} onClose={handleClose} title={`Deactivate — ${pos.name}`} maxWidth="max-w-sm">
      <div className="space-y-4">
        <div className="bg-[var(--color-danger-bg)] rounded-lg px-3.5 py-2.5">
          <p className="text-xs text-[var(--color-danger)]">
            This changes <strong>{pos.name}</strong> at <strong>{branch.name}</strong> from Active to Inactive.
            Other terminals at this branch are not affected.
          </p>
        </div>

        {error && (
          <div className="text-xs text-[var(--color-danger)] bg-[var(--color-danger-bg)] rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose} type="button">Cancel</Button>
          <Button variant="danger" onClick={handleConfirm} loading={submitting}>Deactivate</Button>
        </div>
      </div>
    </Modal>
  );
}