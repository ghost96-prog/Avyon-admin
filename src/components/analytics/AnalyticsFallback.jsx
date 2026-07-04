// src/components/analytics/AnalyticsFallback.jsx
import React from 'react';

export default function AnalyticsFallback() {
  return (
    <div className="space-y-4">
      <div className="h-24 bg-[var(--color-neutral-bg)] rounded-xl animate-pulse" />
      <div className="h-64 bg-[var(--color-neutral-bg)] rounded-xl animate-pulse" />
    </div>
  );
}
