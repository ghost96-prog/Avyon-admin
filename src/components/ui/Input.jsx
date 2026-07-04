// src/components/ui/Input.jsx
import React from 'react';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">{label}</label>}
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)] focus:border-[var(--color-teal-500)]'
        }`}
      />
      {error && <p className="text-xs text-[var(--color-danger)] mt-1">{error}</p>}
    </div>
  );
}
