// src/components/businesses/BranchesSection.jsx
//
// ✅ BRANCH-LEVEL MODEL — substantially restructured. Each branch is now
// a self-contained unit showing: its own subscription card (status,
// countdown, activate/suspend/resume), its own POS terminals, and
// (collapsible) its own payment history. This is the natural consequence
// of branches being independently billed — there's no single "the
// business's subscription" anymore to show once at the top of the page.

import React, { useState } from 'react';
import Card from '../ui/Card';
import BranchSubscriptionCard from './BranchSubscriptionCard';
import SubscriptionHistoryCard from '../subscriptions/SubscriptionHistoryCard';
import ActivateSubscriptionModal from '../subscriptions/ActivateSubscriptionModal';
import SuspendModal from '../subscriptions/SuspendModal';
import ResumeModal from '../subscriptions/ResumeModal';
import EditFieldModal from './EditFieldModal';
import { api } from '../../services/api';
import { EmptyState } from '../ui/States';

const POS_STATUS_OPTIONS = [
  { value: 'active', label: 'Active (claimed)' },
  { value: 'inactive', label: 'Inactive (free)' },
];

function PosTerminalRow({ pos, onEdit }) {
  const isActive = pos.status === 'active';
  return (
    <div className="flex items-center justify-between py-2 pl-4 border-l-2 border-[var(--color-border)]">
      <div className="flex items-center gap-2.5">
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[var(--color-success)]' : 'bg-[var(--color-neutral)]'}`} />
        <div>
          <p className="text-sm text-[var(--color-text)]">{pos.name}{pos.isMain && <span className="text-[10px] text-[var(--color-text-muted)] ml-1.5">MAIN</span>}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{isActive ? 'Claimed / in use' : 'Free'}</p>
        </div>
      </div>
      <button onClick={onEdit} className="text-xs font-medium text-[var(--color-navy-900)] hover:underline">Edit</button>
    </div>
  );
}

function BranchCard({ business, branch, onRefetch }) {
  const [modal, setModal] = useState(null); // 'activate' | 'suspend' | 'resume' | 'edit-branch' | { type: 'pos', pos } | null
  const [historyOpen, setHistoryOpen] = useState(false);

  // branch already carries businessId/ownerId via the spread in
  // BusinessDetailPage (businessWithIds) — but branch itself needs them
  // too for the action endpoints, so the parent always passes a branch
  // object pre-merged with { businessId, ownerId }.

  const closeModal = () => setModal(null);

  const handleSaveBranchName = async ({ name }) => {
    await api.put(`/admin/businesses/${business.businessId}/branches/${branch.branchId}`, {
      ownerId: business.ownerId,
      name,
    });
    onRefetch();
  };

  const handleSavePos = async ({ name, status }) => {
    await api.put(
      `/admin/businesses/${business.businessId}/branches/${branch.branchId}/pos-terminals/${modal.pos.posId}`,
      { ownerId: business.ownerId, name, status }
    );
    onRefetch();
  };

  return (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-4">
        <BranchSubscriptionCard
          branch={branch}
          onActivate={() => setModal('activate')}
          onSuspend={() => setModal('suspend')}
          onResume={() => setModal('resume')}
        />
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
            {branch.address || 'No address set'}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setHistoryOpen((v) => !v)} className="text-xs font-medium text-[var(--color-navy-900)] hover:underline">
              {historyOpen ? 'Hide history' : 'View history'}
            </button>
            <button onClick={() => setModal('edit-branch')} className="text-xs font-medium text-[var(--color-navy-900)] hover:underline">
              Edit branch
            </button>
          </div>
        </div>

        {branch.posTerminals?.length > 0 ? (
          <div className="space-y-0.5">
            {branch.posTerminals.map((pos) => (
              <PosTerminalRow key={pos.posId} pos={pos} onEdit={() => setModal({ type: 'pos', pos })} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-muted)] pl-4">No POS terminals.</p>
        )}

        {historyOpen && (
          <div className="mt-3">
            <SubscriptionHistoryCard branch={{ ...branch, businessId: business.businessId, ownerId: business.ownerId }} />
          </div>
        )}
      </div>

      {modal === 'activate' && (
        <ActivateSubscriptionModal
          open
          onClose={closeModal}
          branch={{ ...branch, businessId: business.businessId, ownerId: business.ownerId, branchName: branch.name }}
          onSuccess={onRefetch}
        />
      )}
      {modal === 'suspend' && (
        <SuspendModal
          open
          onClose={closeModal}
          branch={{ ...branch, businessId: business.businessId, ownerId: business.ownerId, branchName: branch.name }}
          onSuccess={onRefetch}
        />
      )}
      {modal === 'resume' && (
        <ResumeModal
          open
          onClose={closeModal}
          branch={{ ...branch, businessId: business.businessId, ownerId: business.ownerId, branchName: branch.name }}
          onSuccess={onRefetch}
        />
      )}
      {modal === 'edit-branch' && (
        <EditFieldModal
          open
          onClose={closeModal}
          title="Edit branch"
          initialName={branch.name}
          onSave={handleSaveBranchName}
        />
      )}
      {modal?.type === 'pos' && (
        <EditFieldModal
          open
          onClose={closeModal}
          title="Edit POS terminal"
          initialName={modal.pos.name}
          initialStatus={modal.pos.status}
          statusOptions={POS_STATUS_OPTIONS}
          onSave={handleSavePos}
        />
      )}
    </div>
  );
}

export default function BranchesSection({ business, branches, onRefetch }) {
  if (!branches?.length) {
    return (
      <Card>
        <EmptyState title="No branches" message="This business has no branches yet." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] px-1">
        Branches ({branches.length}) — each billed independently
      </h3>
      {branches.map((branch) => (
        <BranchCard key={branch.branchId} business={business} branch={branch} onRefetch={onRefetch} />
      ))}
    </div>
  );
}
