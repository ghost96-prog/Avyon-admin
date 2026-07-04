// src/components/layout/Topbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, onMenuClick }) {
  const { firebaseUser, adminRole, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = (firebaseUser?.email || '?')[0].toUpperCase();

  return (
    <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger menu button - only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--color-neutral-bg)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-[var(--color-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-[var(--color-text)] truncate">{title}</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--color-neutral-bg)] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--color-navy-900)] text-white flex items-center justify-center text-xs font-semibold">
            {initial}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-[var(--color-text)] leading-tight max-w-[120px] truncate">{firebaseUser?.email}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] capitalize leading-tight">{adminRole}</p>
          </div>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg py-1.5 z-20">
              <button
                onClick={logout}
                className="w-full text-left px-3.5 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-neutral-bg)] transition-colors"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}