// src/components/layout/AppShell.jsx
import React, { useState } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell() {
  const matches = useMatches();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const current = [...matches].reverse().find((m) => m.handle?.title);
  const title = current?.handle?.title || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile, shown as slide-out */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        lg:relative lg:transform-none lg:z-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}