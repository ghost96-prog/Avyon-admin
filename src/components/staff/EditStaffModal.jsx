// src/components/staff/EditStaffModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'stock_controller', label: 'Stock Controller' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function EditStaffModal({ open, onClose, business, staff, onSuccess }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [role, setRole] = useState('cashier');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && staff) {
      setName(staff.name || '');
      setRole(staff.role || 'cashier');
      setStatus(staff.status || 'active');
    }
  }, [open, staff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/businesses/${business.businessId}/staff/${staff.staffId}`, {
        ownerId: business.ownerId,
        name,
        role,
        status,
      });
      toast.success(`${name} updated.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!staff) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Edit staff — ${staff.name}`} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        <Select label="Role" options={ROLE_OPTIONS} value={role} onChange={(e) => setRole(e.target.value)} />
        <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}
