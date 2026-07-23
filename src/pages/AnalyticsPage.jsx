// src/pages/AnalyticsPage.jsx
import React, { useState, useCallback } from 'react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import StatCard from '../components/ui/StatCard';
import RevenueChart from '../components/analytics/RevenueChart';
import GrowthChart from '../components/analytics/GrowthChart';
import StatusBreakdownChart from '../components/analytics/StatusBreakdownChart';
import PaymentMethodChart from '../components/analytics/PaymentMethodChart';
import PaymentsTable from '../components/analytics/PaymentsTable';
import { ErrorState } from '../components/ui/States';

const ICON_PROPS = { className: 'w-[18px] h-[18px] text-[var(--color-navy-900)]', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toApiDate(d) {
  return d.toISOString().split('T')[0];
}

function formatDateDisplay(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatDateRangeLabel(start, end) {
  if (toApiDate(start) === toApiDate(end)) return formatDateDisplay(start);
  return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

const DATE_OPTIONS = [
  { id: 'today', label: 'Today', type: 'day' },
  { id: 'this_week', label: 'This Week', type: 'week' },
  { id: 'last_week', label: 'Last Week', type: 'week' },
  { id: 'this_month', label: 'This Month', type: 'month' },
  { id: 'last_month', label: 'Last Month', type: 'month' },
  { id: 'this_year', label: 'This Year', type: 'year' },
  { id: 'custom', label: 'Custom Range', type: 'custom' },
];

// ─── Compute start/end for a preset, anchored to "today" ───────────────────
function computeRangeForOption(optionId) {
  const today = new Date();
  let start = new Date(today);
  let end = new Date(today);
  let type = 'day';

  switch (optionId) {
    case 'today':
      start = new Date(today);
      end = new Date(today);
      type = 'day';
      break;
    case 'this_week': {
      const day = today.getDay();
      start = new Date(today);
      start.setDate(today.getDate() - day);
      end = new Date(today);
      end.setDate(today.getDate() + (6 - day));
      type = 'week';
      break;
    }
    case 'last_week':
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay() - 7);
      end = new Date(today);
      end.setDate(today.getDate() - today.getDay() - 1);
      type = 'week';
      break;
    case 'this_month':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      type = 'month';
      break;
    case 'last_month':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      type = 'month';
      break;
    case 'this_year':
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      type = 'year';
      break;
    default:
      break;
  }
  return { start, end, type };
}

// ─── Date range control: dropdown of presets + prev/next + custom modal ────
function DateRangeControl({ option, startDate, endDate, rangeType, onOptionSelect, onNavigate, onApplyCustom }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [tempStart, setTempStart] = useState(toApiDate(startDate));
  const [tempEnd, setTempEnd] = useState(toApiDate(endDate));

  const selectedLabel = DATE_OPTIONS.find((o) => o.id === option)?.label || 'Select range';

  const openCustom = () => {
    setTempStart(toApiDate(startDate));
    setTempEnd(toApiDate(endDate));
    setMenuOpen(false);
    setCustomOpen(true);
  };

  const handleSelect = (opt) => {
    if (opt.id === 'custom') {
      openCustom();
      return;
    }
    setMenuOpen(false);
    onOptionSelect(opt.id);
  };

  const applyCustom = () => {
    let s = new Date(tempStart);
    let e = new Date(tempEnd);
    if (e < s) { const tmp = s; s = e; e = tmp; }
    onApplyCustom(s, e);
    setCustomOpen(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => onNavigate('prev')}
        aria-label="Previous period"
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-[var(--color-navy-900)] hover:bg-slate-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-[var(--color-navy-900)] hover:bg-slate-50 transition-colors min-w-[200px] justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            <svg className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{formatDateRangeLabel(startDate, endDate)}</span>
          </span>
          <svg className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-0 top-full mt-1 z-20 w-56 bg-white rounded-lg border border-slate-200 shadow-lg py-1">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    option === opt.id ? 'text-[var(--color-accent)] font-medium bg-[var(--color-accent)]/5' : 'text-[var(--color-navy-900)]'
                  }`}
                >
                  {opt.label}
                  {option === opt.id && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {customOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setCustomOpen(false)} />
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-[var(--color-navy-900)]">Custom Range</h3>
                  <button type="button" onClick={() => setCustomOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-navy-900)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Start Date</label>
                    <input
                      type="date"
                      value={tempStart}
                      max={tempEnd}
                      onChange={(e) => setTempStart(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--color-navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">End Date</label>
                    <input
                      type="date"
                      value={tempEnd}
                      min={tempStart}
                      onChange={(e) => setTempEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-[var(--color-navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCustom}
                    className="w-full mt-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onNavigate('next')}
        aria-label="Next period"
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-[var(--color-navy-900)] hover:bg-slate-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function AnalyticsPage() {
  // ✅ Default to "This Month", per spec.
  const initialRange = computeRangeForOption('this_month');
  const [dateOption, setDateOption] = useState('this_month');
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [rangeType, setRangeType] = useState('month');

  const [showPayments, setShowPayments] = useState(false);

  const revenueParams = `?startDate=${toApiDate(startDate)}&endDate=${toApiDate(endDate)}`;

  const revenue = useApi(() => api.get(`/admin/analytics/revenue${revenueParams}`), [startDate, endDate]);
  const growth = useApi(() => api.get('/admin/analytics/users/growth'), []);
  const branchesQuery = useApi(() => api.get('/admin/branches'), []);

  const handleOptionSelect = useCallback((optionId) => {
    const { start, end, type } = computeRangeForOption(optionId);
    setDateOption(optionId);
    setStartDate(start);
    setEndDate(end);
    setRangeType(type);
  }, []);

  const handleApplyCustom = useCallback((s, e) => {
    setDateOption('custom');
    setStartDate(s);
    setEndDate(e);
    setRangeType('custom');
  }, []);

  const handleNavigate = useCallback((direction) => {
    const dir = direction === 'prev' ? -1 : 1;
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    if (rangeType === 'day') {
      newStart.setDate(newStart.getDate() + dir);
      newEnd.setDate(newEnd.getDate() + dir);
    } else if (rangeType === 'week') {
      newStart.setDate(newStart.getDate() + 7 * dir);
      newEnd.setDate(newEnd.getDate() + 7 * dir);
    } else if (rangeType === 'month') {
      newStart.setMonth(newStart.getMonth() + dir);
      newEnd.setMonth(newEnd.getMonth() + dir);
      // Re-anchor to the full month boundaries after shifting, since
      // setMonth on the 31st of a 31-day month can overshoot a shorter
      // target month.
      const s = new Date(newStart.getFullYear(), newStart.getMonth(), 1);
      const e = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
      setStartDate(s);
      setEndDate(e);
      setDateOption('custom');
      return;
    } else if (rangeType === 'year') {
      newStart.setFullYear(newStart.getFullYear() + dir);
      newEnd.setFullYear(newEnd.getFullYear() + dir);
    } else if (rangeType === 'custom') {
      const diffDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      newStart.setDate(newStart.getDate() + diffDays * dir);
      newEnd.setDate(newEnd.getDate() + diffDays * dir);
    }

    setStartDate(newStart);
    setEndDate(newEnd);
    setDateOption('custom');
  }, [startDate, endDate, rangeType]);

  if (revenue.error) {
    return <ErrorState message={revenue.error} onRetry={revenue.refetch} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-navy-900)]">Analytics</h2>
        <DateRangeControl
          option={dateOption}
          startDate={startDate}
          endDate={endDate}
          rangeType={rangeType}
          onOptionSelect={handleOptionSelect}
          onNavigate={handleNavigate}
          onApplyCustom={handleApplyCustom}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Recorded Revenue"
          value={revenue.data ? `$${revenue.data.totalRevenue.toFixed(2)}` : '—'}
          tone="success"
          sublabel="For the selected period, from activation records"
          icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.66 0-3 .9-3 2s1.34 2 3 2 3 .9 3 2-1.34 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2" /></svg>}
        />
        <StatCard
          label="Payments Recorded"
          value={revenue.data?.totalPayments ?? '—'}
          icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 10h18" /></svg>}
        />
        <StatCard
          label="Average Payment"
          value={revenue.data ? `$${revenue.data.averagePayment.toFixed(2)}` : '—'}
          icon={<svg {...ICON_PROPS}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 3v18h18M7 16l4-6 3 3 5-7" /></svg>}
        />
      </div>

      <RevenueChart data={revenue.data} isLoading={revenue.isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <GrowthChart data={growth.data} isLoading={growth.isLoading} />
        <StatusBreakdownChart branches={branchesQuery.data?.branches} isLoading={branchesQuery.isLoading} />
      </div>

      <PaymentMethodChart data={revenue.data} isLoading={revenue.isLoading} />

      {/* Payments Table Section - Lazy Loaded */}
      <div className="mt-6">
        <button
          onClick={() => setShowPayments(!showPayments)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--color-navy-900)] hover:text-[var(--color-accent)] transition-colors"
        >
          <span>{showPayments ? '▼' : '▶'}</span>
          {showPayments ? 'Hide Payment Details' : 'Show Payment Details'}
        </button>

        {showPayments && (
          <div className="mt-3">
            <PaymentsTable startDate={toApiDate(startDate)} endDate={toApiDate(endDate)} />
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--color-text-muted)] text-center pt-2 px-2">
        Revenue figures reflect amounts you've manually recorded during subscription activation —
        this panel doesn't connect to a payment gateway, so these numbers are only as accurate as
        what's entered on each activation.
      </p>
    </div>
  );
}