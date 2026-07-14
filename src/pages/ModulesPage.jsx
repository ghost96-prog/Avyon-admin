// src/pages/ModulesPage.jsx
//
// Flat, filterable list of every module × branch combination across the
// whole platform — the module-level equivalent of SubscriptionsPage.
// Built from the same GET /admin/branches response (now carrying a
// `modules` field per branch, see adminBusinessControllers.js), flattened
// client-side into one row per (branch, moduleId) pair.

import React, { useState, useMemo } from 'react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Skeleton, ErrorState, EmptyState } from '../components/ui/States';
import { MODULE_IDS, getModuleInfo, MODULE_STATUS_CONFIG } from '../utils/moduleCatalog';
import { useLiveCountdown } from '../hooks/useLiveCountdown';
import { Link } from 'react-router-dom';

const MODULE_OPTIONS = [
  { value: 'all', label: 'All modules' },
  ...MODULE_IDS.map((id) => ({ value: id, label: getModuleInfo(id).label })),
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
];

function ModuleRow({ row }) {
  const { countdownText } = useLiveCountdown(row.accessExpiresAt);
  const cfg = MODULE_STATUS_CONFIG[row.status] || MODULE_STATUS_CONFIG.cancelled;
  const info = getModuleInfo(row.moduleId);

  return (
    <Link
      to={`/businesses/${row.businessId}?ownerId=${row.ownerId}`}
      className="grid grid-cols-[1.3fr_1.1fr_1fr_0.8fr_0.8fr] items-center px-5 py-3.5 hover:bg-[var(--color-neutral-bg)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
    >
      <div className="min-w-0 pr-3">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">
          {row.branchName}
          {row.isMain && <span className="text-[10px] text-[var(--color-text-muted)] ml-1.5 font-normal">MAIN</span>}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">{row.businessName}</p>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: info.bg }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={info.color}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={info.iconPath} />
          </svg>
        </span>
        <span className="text-xs text-[var(--color-text)] truncate">{info.label}</span>
      </div>
      <div className="text-xs text-[var(--color-text-muted)] truncate">{row.ownerEmail}</div>
      <div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
          {cfg.label}
        </span>
      </div>
      <div className="tabular text-xs text-[var(--color-text-muted)]">
        {countdownText || (row.status === 'suspended' ? '—' : 'Expired')}
      </div>
    </Link>
  );
}

export default function ModulesPage() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, error, isLoading, refetch } = useApi(() => api.get('/admin/branches'), []);
  const branches = useMemo(() => data?.branches || [], [data]);

  const rows = useMemo(() => {
    const out = [];
    for (const b of branches) {
      for (const moduleId of MODULE_IDS) {
        const m = b.modules?.[moduleId];
        if (!m) continue;
        out.push({
          branchId: b.branchId,
          branchName: b.branchName,
          isMain: b.isMain,
          businessId: b.businessId,
          businessName: b.businessName,
          ownerId: b.ownerId,
          ownerEmail: b.ownerEmail,
          moduleId,
          status: m.status,
          accessExpiresAt: m.accessExpiresAt,
          msRemaining: m.msRemaining,
        });
      }
    }
    return out;
  }, [branches]);

  const filtered = useMemo(() => {
    let list = rows;
    if (moduleFilter !== 'all') list = list.filter((r) => r.moduleId === moduleFilter);
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.branchName?.toLowerCase().includes(q) ||
          r.businessName?.toLowerCase().includes(q) ||
          r.ownerEmail?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (a.msRemaining ?? Infinity) - (b.msRemaining ?? Infinity));
  }, [rows, moduleFilter, statusFilter, search]);

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by branch, business, or owner email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select options={MODULE_OPTIONS} value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="sm:w-52" />
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40" />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.3fr_1.1fr_1fr_0.8fr_0.8fr] px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-neutral-bg)] rounded-t-xl">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Branch</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Module</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Owner</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Status</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Time left</span>
            </div>
            {isLoading ? (
              <div className="p-5"><Skeleton rows={6} /></div>
            ) : filtered.length === 0 ? (
              <EmptyState title="No module subscriptions found" message="Try adjusting your search or filters." />
            ) : (
              filtered.map((r) => <ModuleRow key={`${r.branchId}-${r.moduleId}`} row={r} />)
            )}
          </div>
        </div>
      </Card>

      <p className="text-xs text-[var(--color-text-muted)] px-1">Showing {filtered.length} of {rows.length} module subscriptions</p>
    </div>
  );
}