// src/pages/BusinessesPage.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import BusinessRow from '../components/businesses/BusinessRow';
import { Skeleton, ErrorState, EmptyState } from '../components/ui/States';

const STATUS_OPTIONS = [
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function BusinessesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse filter param - supports multiple values: ?filter=trial&filter=active
  const initialFilters = searchParams.getAll('filter') || [];
  const [selectedStatuses, setSelectedStatuses] = useState(
    initialFilters.length > 0 ? initialFilters : []
  );

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, error, isLoading, refetch } = useApi(() => api.get('/admin/businesses'), []);
  const businesses = useMemo(() => data?.businesses || [], [data]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    let list = businesses;

    // Apply status filters - show businesses that match ANY selected status
    if (selectedStatuses.length > 0) {
      list = list.filter((b) => selectedStatuses.includes(b.subscriptionStatus));
    }

    // Apply search filter (debounced)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.businessName?.toLowerCase().includes(q) ||
          b.ownerEmail?.toLowerCase().includes(q) ||
          b.ownerName?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [businesses, selectedStatuses, search]);

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    const timeoutId = setTimeout(() => {
      setSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const toggleStatus = (statusValue) => {
    let newSelected;
    if (selectedStatuses.includes(statusValue)) {
      newSelected = selectedStatuses.filter((s) => s !== statusValue);
    } else {
      newSelected = [...selectedStatuses, statusValue];
    }
    setSelectedStatuses(newSelected);
    updateURLParams(newSelected);
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    updateURLParams([]);
    setIsDropdownOpen(false);
  };

  const updateURLParams = (statuses) => {
    // Clear existing filter params
    searchParams.delete('filter');
    // Add each selected status as a separate filter param
    statuses.forEach((status) => {
      searchParams.append('filter', status);
    });
    setSearchParams(searchParams, { replace: true });
  };

  const getStatusDisplayText = () => {
    if (selectedStatuses.length === 0) return 'All statuses';
    if (selectedStatuses.length === STATUS_OPTIONS.length) return 'All statuses';
    if (selectedStatuses.length === 1) {
      const option = STATUS_OPTIONS.find((o) => o.value === selectedStatuses[0]);
      return option ? option.label : selectedStatuses[0];
    }
    return `${selectedStatuses.length} selected`;
  };

  const getStatusCount = (statusValue) => {
    return businesses.filter((b) => b.subscriptionStatus === statusValue).length;
  };

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by business name, owner name, or email…"
          value={searchInput}
          onChange={handleSearchChange}
          className="flex-1"
        />
        
        {/* Custom Multi-Select Dropdown */}
        <div className="relative sm:w-56" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2 text-left bg-white border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors flex items-center justify-between"
          >
            <span className={`text-sm ${selectedStatuses.length === 0 ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
              {getStatusDisplayText()}
            </span>
            <svg
              className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-80 overflow-y-auto">
              <div className="p-2">
                {/* Select All / Clear All */}
                <div className="flex justify-between items-center px-2 py-1 mb-1 border-b border-[var(--color-border)]">
                  <button
                    onClick={() => {
                      if (selectedStatuses.length === STATUS_OPTIONS.length) {
                        clearAllFilters();
                      } else {
                        const allValues = STATUS_OPTIONS.map((o) => o.value);
                        setSelectedStatuses(allValues);
                        updateURLParams(allValues);
                      }
                    }}
                    className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                  >
                    {selectedStatuses.length === STATUS_OPTIONS.length ? 'Clear All' : 'Select All'}
                  </button>
                  {selectedStatuses.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {STATUS_OPTIONS.map((option) => {
                  const isSelected = selectedStatuses.includes(option.value);
                  const count = getStatusCount(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[var(--color-neutral-bg)] cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleStatus(option.value)}
                        className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)]"
                      />
                      <span className="flex-1 text-sm text-[var(--color-text)]">{option.label}</span>
                      <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-neutral-bg)] px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Tags */}
      {selectedStatuses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStatuses.map((status) => {
            const option = STATUS_OPTIONS.find((o) => o.value === status);
            return (
              <span
                key={status}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full"
              >
                {option?.label || status}
                <button
                  onClick={() => toggleStatus(status)}
                  className="hover:text-[var(--color-danger)] transition-colors"
                >
                  ×
                </button>
              </span>
            );
          })}
          <button
            onClick={clearAllFilters}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] px-2"
          >
            Clear all
          </button>
        </div>
      )}

      <Card padded={false}>
        {/* Responsive table - horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1.8fr_1fr_1fr_0.9fr] px-4 sm:px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-neutral-bg)] rounded-t-xl">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Business</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Status</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Branches</span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Joined</span>
            </div>

            {isLoading ? (
              <div className="p-5"><Skeleton rows={6} /></div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No businesses found"
                message={search || selectedStatuses.length > 0 ? 'Try adjusting your search or filters.' : 'No businesses have registered yet.'}
              />
            ) : (
              filtered.map((b) => <BusinessRow key={b.businessId} business={b} />)
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center px-1">
        <p className="text-xs text-[var(--color-text-muted)]">
          Showing {filtered.length} of {businesses.length} businesses
        </p>
        {selectedStatuses.length > 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Filtered by: {selectedStatuses.map(s => {
              const option = STATUS_OPTIONS.find(o => o.value === s);
              return option?.label || s;
            }).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}