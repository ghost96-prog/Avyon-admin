// src/components/ui/Select.jsx
import React from 'react';

export default function Select({ label, options, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">{label}</label>}
      <select
        {...props}
        className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-teal-500)] bg-white transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
