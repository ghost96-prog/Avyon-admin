// src/components/subscriptions/SuspendModal.jsx
//
// ✅ BRANCH-LEVEL: suspends ONE branch. Other branches on the same
// business are unaffected — the warning text says this explicitly so an
// admin doesn't assume this is a business-wide action.

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SuspendModal({ open, onClose, branch, onSuccess }) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/subscriptions/${branch.businessId}/branches/${branch.branchId}/suspend`, {
        ownerId: branch.ownerId,
        reason: reason || 'Suspended by admin',
      });
      toast.success(`${branch.branchName} has been suspended.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to suspend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Suspend — ${branch.branchName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[var(--color-danger-bg)] rounded-lg px-3.5 py-2.5">
          <p className="text-xs text-[var(--color-danger)]">
            This immediately blocks POS access at <strong>{branch.branchName}</strong> only, regardless of
            remaining trial or subscription time. Other branches on this business are not affected.
            Staff at this branch will see this reason on their device.
          </p>
        </div>

        <Input
          label="Reason (shown to staff at this branch)"
          placeholder="e.g. Payment overdue — please contact us to resolve"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="danger" type="submit" loading={submitting}>Suspend Branch</Button>
        </div>
      </form>
    </Modal>
  );
}
