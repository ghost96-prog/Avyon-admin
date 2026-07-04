// src/components/staff/StaffSection.jsx
import React, { useState } from 'react';
import Card from '../ui/Card';
import { EmptyState } from '../ui/States';
import EditStaffModal from './EditStaffModal';
import ResetPinModal from './ResetPinModal';

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  cashier: 'Cashier',
  stock_controller: 'Stock Controller',
};

function StaffRow({ staff, onEdit, onResetPin }) {
  const isActive = staff.status === 'active';
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-[var(--color-navy-100)] text-[var(--color-navy-900)] flex items-center justify-center text-xs font-semibold shrink-0">
          {(staff.name || '?')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-text)] truncate">{staff.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {ROLE_LABELS[staff.role] || staff.role} · {staff.hasPin ? 'PIN set' : 'No PIN'} · {isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={onResetPin} className="text-xs font-medium text-[var(--color-navy-900)] hover:underline">
          Reset PIN
        </button>
        <button onClick={onEdit} className="text-xs font-medium text-[var(--color-navy-900)] hover:underline">
          Edit
        </button>
      </div>
    </div>
  );
}

export default function StaffSection({ business, staff, onRefetch }) {
  const [editTarget, setEditTarget] = useState(null);
  const [pinTarget, setPinTarget] = useState(null);

  if (!staff?.length) {
    return (
      <Card>
        <EmptyState title="No staff" message="This business has no staff records yet." />
      </Card>
    );
  }

  return (
    <>
      <Card padded={false}>
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Staff ({staff.length})</h3>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {staff.map((s) => (
            <StaffRow
              key={s.staffId}
              staff={s}
              onEdit={() => setEditTarget(s)}
              onResetPin={() => setPinTarget(s)}
            />
          ))}
        </div>
      </Card>

      {editTarget && (
        <EditStaffModal
          open
          onClose={() => setEditTarget(null)}
          business={business}
          staff={editTarget}
          onSuccess={onRefetch}
        />
      )}

      {pinTarget && (
        <ResetPinModal
          open
          onClose={() => setPinTarget(null)}
          business={business}
          staff={pinTarget}
          onSuccess={onRefetch}
        />
      )}
    </>
  );
}
