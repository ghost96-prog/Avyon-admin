// src/utils/moduleCatalog.js
//
// Frontend mirror of utils/moduleSubscriptionLogic.js's MODULE_CATALOG.
// Backend is still the source of truth for STATUS (active/expired/etc via
// module-access-status) — this file only carries the display copy
// (label/description/price/icon) so the modal and any other UI don't
// hardcode strings in multiple places. Keep in sync with the backend
// catalog if a module is ever renamed/repriced.

// Simple icon components as inline SVGs
export const ModuleIcons = {
  Package: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-6 9 6-9 6-9-6zm0 4v6l9 6 9-6v-6M3 13l9 6 9-6" />
    </svg>
  ),
  Repeat: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9l3-3-3-3M20 15l-3 3 3 3" />
    </svg>
  ),
  BarChart3: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-5 4 10 2-7 4 2h4" />
    </svg>
  ),
};

export const MODULE_CATALOG = {
  inventory_mgmt: {
    id: 'inventory_mgmt',
    label: 'Inventory Management',
    price: 5,
    period: '/month per branch',
    icon: ModuleIcons.Package,
    color: '#0891B2',
    bg: '#ECFEFF',
    description: 'Full control over your product catalog — create, edit, and bulk-import products, plus real-time stock valuation.',
    features: [
      'Create & edit products',
      'Bulk import stock via CSV',
      'Inventory value reports',
      'Cost & margin tracking',
    ],
  },
  advanced_inventory: {
    id: 'advanced_inventory',
    label: 'Advanced Inventory Management',
    price: 5,
    period: '/month per branch',
    icon: ModuleIcons.Repeat,
    color: '#7C3AED',
    bg: '#F5F3FF',
    description: 'Move stock between branches and keep your counts honest with GRVs and structured stock takes.',
    features: [
      'Goods Received Vouchers (GRV)',
      'Store-to-store stock transfers',
      'Stock take & reconciliation',
      'Full audit trail per movement',
    ],
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    price: 5,
    period: '/month per branch',
    icon: ModuleIcons.BarChart3,
    color: '#EA580C',
    bg: '#FFF7ED',
    description: 'See what\u2019s actually driving the business — sales, profit, product, and inventory analytics, plus cashier performance.',
    features: [
      'Sales & profit analytics',
      'Product performance reports',
      'Branch comparison',
      'Cashier performance tracking',
    ],
  },
};

export const MODULE_IDS = Object.keys(MODULE_CATALOG);

export function getModuleInfo(moduleId) {
  return MODULE_CATALOG[moduleId] || null;
}

export const MODULE_STATUS_CONFIG = {
  active: {
    label: 'Active',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: '#16A34A',
  },
  trial: {
    label: 'Trial',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: '#357ABD',
  },
  expired: {
    label: 'Expired',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: '#EF4444',
  },
  suspended: {
    label: 'Suspended',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: '#D97706',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    dot: '#94A3B8',
  },
  inactive: {
    label: 'Inactive',
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    dot: '#94A3B8',
  },
};