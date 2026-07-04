// src/components/subscriptions/ResumeModal.jsx
//
// ✅ BRANCH-LEVEL: resumes ONE branch.

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ResumeModal({ open, onClose, branch, onSuccess }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const result = await api.put(`/admin/subscriptions/${branch.businessId}/branches/${branch.branchId}/resume`, {
        ownerId: branch.ownerId,
      });
      toast.success(`${branch.branchName} access restored (${result.subscriptionStatus}).`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to resume.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Resume — ${branch.branchName}`}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text)]">
          This lifts the manual suspension on <strong>{branch.branchName}</strong> and restores whatever trial
          or subscription window was previously in effect for this branch. It does <strong>not</strong> grant
          new time — if it needs a fresh period, use "Activate / Extend" separately after resuming.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="success" onClick={handleConfirm} loading={submitting}>Resume Branch</Button>
        </div>
      </div>
    </Modal>
  );
}
