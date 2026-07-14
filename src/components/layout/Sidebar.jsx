// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import avyonLogo from '../../assets/avyonicon.png'; // Adjust path if needed

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'grid' },
  { to: '/businesses', label: 'Businesses', icon: 'building' },
  { to: '/subscriptions', label: 'Subscriptions', icon: 'card' },
    { to: '/modules', label: 'Advanced Subscriptions', icon: 'puzzle' }, // ✅ NEW

  { to: '/analytics', label: 'Analytics', icon: 'chart' },
];

const ICONS = {
  grid: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  ),
  building: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />
  ),
  card: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 10h18" />
  ),
   puzzle: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M11 4a2 2 0 114 0v1h2a2 2 0 012 2v2h1a2 2 0 010 4h-1v2a2 2 0 01-2 2h-2v1a2 2 0 11-4 0v-1H9a2 2 0 01-2-2v-2H6a2 2 0 010-4h1V7a2 2 0 012-2h2V4z" />
  ),
  chart: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3 3v18h18M7 16l4-6 3 3 5-7" />
  ),
};

export default function Sidebar({ onClose }) {
  return (
    <aside className="w-72 sm:w-60 shrink-0 bg-[var(--color-navy-950)] text-white flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-purple-500)] flex items-center justify-center overflow-hidden">
            <img 
              src={avyonLogo} 
              alt="Avyon" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-[15px] tracking-tight hidden sm:block">Avyon Admin</span>
        </div>
        {/* Close button - only visible on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden text-white/60 hover:text-white p-2 -mr-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {ICONS[item.icon]}
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <p className="text-[11px] text-white/40 px-3">Subscription billing is manual — payments are recorded by you, not collected by this panel.</p>
      </div>
    </aside>
  );
}