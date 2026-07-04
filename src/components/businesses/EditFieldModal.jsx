// src/components/businesses/EditFieldModal.jsx
//
// Small generic modal for editing a name/status pair — reused for both
// "edit branch" and "edit POS terminal" since both are just
// {name, status?} with a different endpoint. Avoids two near-identical
// modal components.

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useToast } from '../../context/ToastContext';

export default function EditFieldModal({ open, onClose, title, initialName, initialStatus, statusOptions, onSave }) {
  const toast = useToast();
  const [name, setName] = useState(initialName || '');
  const [status, setStatus] = useState(initialStatus || '');
  const [submitting, setSubmitting] = useState(false);

  // Re-seed fields whenever a different item is opened into this shared modal.
  React.useEffect(() => {
    if (open) {
      setName(initialName || '');
      setStatus(initialStatus || '');
    }
  }, [open, initialName, initialStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({ name, status: statusOptions ? status : undefined });
      toast.success('Updated successfully.');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
        {statusOptions && (
          <Select label="Status" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}
