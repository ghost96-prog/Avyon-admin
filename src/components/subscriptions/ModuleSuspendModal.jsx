// src/components/subscriptions/ModuleSuspendModal.jsx
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getModuleInfo } from '../../utils/moduleCatalog';

export default function ModuleSuspendModal({ open, onClose, branch, moduleId, onSuccess }) {
  const toast = useToast();
  const info = getModuleInfo(moduleId);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/module-subscriptions/${branch.businessId}/branches/${branch.branchId}/${moduleId}/suspend`, {
        ownerId: branch.ownerId,
        reason: reason || 'Suspended by admin',
      });
      toast.success(`${info.label} suspended for ${branch.branchName}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to suspend module.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!info) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Suspend ${info.label} — ${branch.branchName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[var(--color-danger-bg)] rounded-lg px-3.5 py-2.5">
          <p className="text-xs text-[var(--color-danger)]">
            This blocks access to <strong>{info.label}</strong> at <strong>{branch.branchName}</strong> only —
            the base POS subscription and other modules are unaffected.
          </p>
        </div>
        <Input
          label="Reason (shown in the module's gate screen)"
          placeholder="e.g. Payment overdue"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="danger" type="submit" loading={submitting}>Suspend Module</Button>
        </div>
      </form>
    </Modal>
  );
}