// src/components/ui/Button.jsx
import React from 'react';

const VARIANTS = {
  primary: 'bg-[var(--color-navy-900)] text-white hover:bg-[var(--color-navy-800)]',
  danger: 'bg-[var(--color-danger)] text-white hover:bg-[#b91c1c]',
  success: 'bg-[var(--color-success)] text-white hover:bg-[#15803d]',
  ghost: 'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-neutral-bg)] border border-[var(--color-border)]',
  subtle: 'bg-[var(--color-neutral-bg)] text-[var(--color-text)] hover:bg-[#e2e8f0]',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
