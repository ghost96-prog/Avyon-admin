// src/components/subscriptions/ModuleSubscriptionsCard.jsx
//
// Shows all 3 add-on modules for EVERY branch on this business, with
// inline activate/suspend/resume actions. Sits alongside BranchesSection
// on BusinessDetailPage — branches already show base-subscription status
// there; this is the module-level equivalent.

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useLiveCountdown } from '../../hooks/useLiveCountdown';
import { MODULE_IDS, getModuleInfo, MODULE_STATUS_CONFIG } from '../../utils/moduleCatalog';
import ModuleActivateModal from './ModuleActivateModal';
import ModuleSuspendModal from './ModuleSuspendModal';
import ModuleResumeModal from './ModuleResumeModal';

function ModuleBadge({ status }) {
  const cfg = MODULE_STATUS_CONFIG[status] || MODULE_STATUS_CONFIG.cancelled;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function ModuleTile({ branch, moduleId, moduleState, onRefetch }) {
  const info = getModuleInfo(moduleId);
  const { countdownText } = useLiveCountdown(moduleState?.accessExpiresAt);
  const [activateOpen, setActivateOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  const status = moduleState?.status || 'inactive';
  const isSuspended = status === 'suspended';
  const isLive = status === 'trial' || status === 'active';

  // Get status color for border accent
  const getStatusColor = () => {
    if (isLive) return '#16A34A';
    if (isSuspended) return '#D97706';
    if (status === 'expired') return '#EF4444';
    return '#94A3B8';
  };

  return (
    <div 
      className="relative bg-white dark:bg-[var(--color-surface)] rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-md border"
      style={{ 
        borderColor: 'var(--color-border)',
        borderLeftWidth: '3px',
        borderLeftColor: getStatusColor(),
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105"
            style={{ backgroundColor: info.bg }}
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke={info.color} strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d={info.iconPath} />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">{info.label}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
              {info.price}{info.period}
            </p>
          </div>
        </div>
        <ModuleBadge status={status} />
      </div>

      {/* Status info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-muted)]">
          {isLive && countdownText
            ? `${status === 'trial' ? 'Trial' : 'Active'} — ${countdownText} left`
            : isSuspended
              ? '⛔ Access blocked'
              : status === 'expired'
                ? '⏰ No active period'
                : '⚪ Never activated'}
        </p>
        {isLive && countdownText && (
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded-full">
            {countdownText}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <Button 
          variant={isLive ? "secondary" : "primary"}
          size="xs" 
          onClick={() => setActivateOpen(true)} 
          className="flex-1 font-medium"
          style={{ cursor: 'pointer' }}
        >
          {isLive ? '🔄 Extend' : '➕ Activate'}
        </Button>
        {isSuspended ? (
          <Button 
            variant="success" 
            size="xs" 
            onClick={() => setResumeOpen(true)} 
            className="flex-1 font-medium"
            style={{ cursor: 'pointer' }}
          >
            ▶ Resume
          </Button>
        ) : isLive ? (
          <Button 
            variant="danger" 
            size="xs" 
            onClick={() => setSuspendOpen(true)} 
            className="flex-1 font-medium"
            style={{ cursor: 'pointer' }}
          >
            ⏸ Suspend
          </Button>
        ) : null}
      </div>

      {/* Modals */}
      {activateOpen && (
        <ModuleActivateModal
          open={activateOpen}
          onClose={() => setActivateOpen(false)}
          branch={branch}
          moduleId={moduleId}
          moduleState={moduleState}
          onSuccess={onRefetch}
        />
      )}
      {suspendOpen && (
        <ModuleSuspendModal open={suspendOpen} onClose={() => setSuspendOpen(false)} branch={branch} moduleId={moduleId} onSuccess={onRefetch} />
      )}
      {resumeOpen && (
        <ModuleResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} branch={branch} moduleId={moduleId} onSuccess={onRefetch} />
      )}
    </div>
  );
}

export default function ModuleSubscriptionsCard({ business, branches, onRefetch }) {
  return (
    <Card padded={false} className="overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              <span className="text-lg">🧩</span>
              Add-on Modules
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Inventory Management, Advanced Inventory Management, and Analytics — $5/month per branch, each independent.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Active</span>
            <span className="w-4 h-px bg-[var(--color-border)] mx-1" />
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Suspended</span>
            <span className="w-4 h-px bg-[var(--color-border)] mx-1" />
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Expired</span>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="p-5 space-y-8">
        {branches.map((branch) => {
          const branchWithIds = { ...branch, businessId: business.businessId, ownerId: business.ownerId };
          return (
            <div key={branch.branchId} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 rounded-full bg-[var(--color-primary)] opacity-60" />
                <p className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">
                  {branch.name}
                  {branch.isMain && (
                    <span className="ml-2 text-[10px] font-normal text-[var(--color-text-muted)] uppercase tracking-wider bg-[var(--color-bg)] px-2 py-0.5 rounded-full">
                      Main
                    </span>
                  )}
                </p>
                <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">
                  {MODULE_IDS.filter(id => branch.modules?.[id]?.status === 'active' || branch.modules?.[id]?.status === 'trial').length} / {MODULE_IDS.length} active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {MODULE_IDS.map((moduleId) => (
                  <ModuleTile
                    key={moduleId}
                    branch={branchWithIds}
                    moduleId={moduleId}
                    moduleState={branch.modules?.[moduleId]}
                    onRefetch={onRefetch}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}