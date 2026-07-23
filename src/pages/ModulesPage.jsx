// src/pages/ModulesPage.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Multi-select dropdown
const MultiSelectStatus = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter(s => s !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const getLabel = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === options.length) return 'All statuses';
    if (selected.length === 1) {
      return options.find(o => o.value === selected[0])?.label || selected[0];
    }
    return `${selected.length} selected`;
  };

  return (
    <div className="relative w-40" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors flex items-center justify-between"
      >
        <span className={`text-sm ${selected.length === 0 ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
          {getLabel()}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-72 overflow-y-auto">
          <div className="p-3">
            <div className="flex justify-between items-center px-2 py-1.5 mb-2 border-b border-[var(--color-border)]">
              <button 
                onClick={() => onChange(options.map(o => o.value))}
                className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
              >
                Select All
              </button>
              <button 
                onClick={() => onChange([])}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
              >
                Clear
              </button>
            </div>
            <div className="space-y-0.5">
              {options.map(opt => (
                <label 
                  key={opt.value} 
                  className="flex items-center gap-2.5 px-2 py-2 hover:bg-[var(--color-neutral-bg)] cursor-pointer rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                    className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text)]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.getAll('status') || [];
  
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const { data, error, isLoading, refetch } = useApi(() => api.get('/admin/branches'), []);
  const branches = useMemo(() => data?.branches || [], [data]);

  const updateURL = (values) => {
    searchParams.delete('status');
    values.forEach(v => searchParams.append('status', v));
    setSearchParams(searchParams, { replace: true });
  };

  const handleStatusChange = (values) => {
    setStatusFilter(values);
    updateURL(values);
  };

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
    if (statusFilter.length > 0) list = list.filter((r) => statusFilter.includes(r.status));
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
        <Select 
          options={MODULE_OPTIONS} 
          value={moduleFilter} 
          onChange={(e) => setModuleFilter(e.target.value)} 
          className="sm:w-52" 
        />
        <MultiSelectStatus
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onChange={handleStatusChange}
          placeholder="All statuses"
        />
      </div>

      {/* Status filter tags */}
      {statusFilter.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {statusFilter.map(s => {
            const opt = STATUS_OPTIONS.find(o => o.value === s);
            return (
              <span key={s} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                {opt?.label}
                <button onClick={() => handleStatusChange(statusFilter.filter(v => v !== s))}>×</button>
              </span>
            );
          })}
          <button 
            onClick={() => {
              setStatusFilter([]);
              searchParams.delete('status');
              setSearchParams(searchParams, { replace: true });
            }}
            className="text-xs text-gray-500 hover:text-red-600"
          >
            Clear all
          </button>
        </div>
      )}

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

      <p className="text-xs text-[var(--color-text-muted)] px-1">
        Showing {filtered.length} of {rows.length} module subscriptions
      </p>
    </div>
  );
}