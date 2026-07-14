// src/utils/moduleCatalog.js
//
// Admin-panel mirror of backend utils/moduleSubscriptionLogic.js's
// MODULE_CATALOG — display copy only (backend is the source of truth for
// live status via the branches/business-detail API responses). Icons are
// inline SVG paths, matching the style already used in Sidebar.jsx rather
// than pulling in a new icon library.

export const MODULE_CATALOG = {
  inventory_mgmt: {
    id: 'inventory_mgmt',
    label: 'Inventory Management',
    price: 5,
    color: '#0891B2',
    bg: '#ECFEFF',
    description: 'Products, stock import, and inventory value.',
    iconPath: 'M20 7L12 3 4 7m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  advanced_inventory: {
    id: 'advanced_inventory',
    label: 'Advanced Inventory Management',
    price: 5,
    color: '#7C3AED',
    bg: '#F5F3FF',
    description: 'GRV, stock transfers, and stock takes.',
    iconPath: 'M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4',
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    price: 5,
    color: '#EA580C',
    bg: '#FFF7ED',
    description: 'All analytics pages plus cashier performance.',
    iconPath: 'M3 3v18h18M7 16l4-6 3 3 5-7',
  },
};

export const MODULE_IDS = ['inventory_mgmt', 'advanced_inventory', 'analytics'];

export function getModuleInfo(moduleId) {
  return MODULE_CATALOG[moduleId] || null;
}

export const MODULE_STATUS_CONFIG = {
  trial: { label: 'Trial', bg: 'bg-blue-50', text: 'text-blue-700', dot: '#2563eb' },
  active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700', dot: '#16a34a' },
  expired: { label: 'Expired', bg: 'bg-red-50', text: 'text-red-700', dot: '#dc2626' },
  suspended: { label: 'Suspended', bg: 'bg-red-100', text: 'text-red-900', dot: '#991b1b' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-600', dot: '#94a3b8' },
};