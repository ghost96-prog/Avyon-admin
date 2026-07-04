// src/components/ui/States.jsx
//
// Three small shared states: a loading skeleton, an empty-data message,
// and an error message — used identically across every list/detail
// screen so the visual language of "loading / nothing here / went wrong"
// stays consistent app-wide.

import React from 'react';

export function Skeleton({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-[var(--color-neutral-bg)] rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 rounded-full bg-[var(--color-neutral-bg)] flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0l-2.5 5H8.5L6 13m14 0H6" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      {message && <p className="text-xs text-[var(--color-text-muted)] mt-1">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-[var(--color-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[var(--color-text)]">Something went wrong</p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-xs font-medium text-[var(--color-navy-900)] underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
