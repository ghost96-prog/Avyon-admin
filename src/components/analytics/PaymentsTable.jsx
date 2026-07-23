// src/components/analytics/PaymentsTable.jsx
//
// ✅ NEW — accepts optional startDate/endDate props (YYYY-MM-DD) from
// AnalyticsPage's date range control. When either changes, resets to page
// 1 and refetches with the new range. No props = unfiltered (unchanged
// behavior for any other caller).

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

const PAYMENTS_PER_PAGE = 20;

export default function PaymentsTable({ startDate, endDate }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const fetchPayments = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching payments for page:', pageNum, { startDate, endDate });

      const params = new URLSearchParams({ page: pageNum, limit: PAYMENTS_PER_PAGE });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      // ✅ Your api.get returns the parsed data directly, not the response object
      const data = await api.get(`/admin/analytics/payments?${params.toString()}`);

      console.log('📦 Response data:', data);

      if (!data) {
        console.error('❌ No data received');
        throw new Error('No data received from server');
      }

      if (!data.payments) {
        console.error('❌ No payments array in response:', data);
        throw new Error('Invalid response format: missing payments array');
      }

      if (!data.pagination) {
        console.error('❌ No pagination object in response:', data);
        throw new Error('Invalid response format: missing pagination');
      }

      console.log('✅ Setting payments:', data.payments.length, 'items');
      console.log('✅ Pagination:', data.pagination);

      setPayments(data.payments);
      setTotalPages(data.pagination.totalPages);
      setTotalPayments(data.pagination.total);
      setHasNext(data.pagination.hasNext);
      setHasPrev(data.pagination.hasPrev);
      setPage(pageNum);

    } catch (err) {
      console.error('❌ Fetch payments error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack
      });

      if (err.message.includes('404')) {
        setError('Payments endpoint not found (404). Please ensure the backend is updated and deployed.');
      } else if (err.message.includes('401')) {
        setError('Authentication failed. Please log in again.');
      } else if (err.message.includes('403')) {
        setError('You do not have permission to view payments.');
      } else {
        setError(err.message || 'Failed to load payments');
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // ✅ Refetch from page 1 whenever the date range changes (not just on mount)
  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPayments(newPage);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-red-600 font-medium">Error loading payments</div>
        <div className="text-sm text-red-500 mt-1">{error}</div>
        <button 
          onClick={() => fetchPayments(page)}
          className="mt-3 px-4 py-2 text-sm bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-navy-900)]">Payment History</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {totalPayments > 0 ? `Showing ${payments.length} of ${totalPayments} total payments` : 'No payments recorded'}
          </p>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPrev || loading}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--color-text-muted)]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNext || loading}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Business
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Branch
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">
                Method
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">
                Date
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && payments.length === 0 ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </td>
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 sm:px-6 py-8 text-center text-[var(--color-text-muted)]">
                  No payment records found for this period.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 text-sm text-[var(--color-navy-900)]">
                    <div className="font-medium">{payment.businessName}</div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate max-w-[120px] sm:max-w-none">
                      {payment.ownerEmail}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-[var(--color-navy-900)]">
                    {payment.branchName}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-[var(--color-navy-900)] hidden sm:table-cell">
                    <span className="capitalize">{payment.paymentMethod}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-[var(--color-navy-900)] hidden md:table-cell">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-[var(--color-text-muted)]">
            Showing {((page - 1) * PAYMENTS_PER_PAGE) + 1} - {Math.min(page * PAYMENTS_PER_PAGE, totalPayments)} of {totalPayments}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPrev || loading}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--color-text-muted)]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNext || loading}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}