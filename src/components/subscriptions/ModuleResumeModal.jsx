// src/components/subscriptions/ModuleResumeModal.jsx
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getModuleInfo } from '../../utils/moduleCatalog';

export default function ModuleResumeModal({ open, onClose, branch, moduleId, onSuccess }) {
  const toast = useToast();
  const info = getModuleInfo(moduleId);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const result = await api.put(`/admin/module-subscriptions/${branch.businessId}/branches/${branch.branchId}/${moduleId}/resume`, {
        ownerId: branch.ownerId,
      });
      toast.success(`${info.label} restored (${result.status}) for ${branch.branchName}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to resume module.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!info) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Resume ${info.label} — ${branch.branchName}`}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text)]">
          Lifts the suspension on <strong>{info.label}</strong> and restores whatever trial or paid period was
          previously in effect. Doesn't grant new time — use "Activate / Extend" for that.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="success" onClick={handleConfirm} loading={submitting}>Resume Module</Button>
        </div>
      </div>
    </Modal>
  );
}