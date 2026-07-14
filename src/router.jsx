// src/router.jsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BusinessesPage from './pages/BusinessesPage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AnalyticsFallback from './components/analytics/AnalyticsFallback';
import ModulesPage from './pages/ModulesPage';

// ✅ Lazy-loaded: AnalyticsPage is the only page that imports recharts,
// which alone pulls in 500+ modules. Code-splitting it means everyone
// who isn't viewing Analytics never downloads that weight — without
// this, every page load (login, dashboard, businesses list) would ship
// the full charting library whether or not it's ever used.
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

// `handle.title` is read by AppShell/Topbar so each route declares its
// own title once, here, rather than every page component repeating it.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage />, handle: { title: 'Dashboard' } },
      { path: 'businesses', element: <BusinessesPage />, handle: { title: 'Businesses' } },
      { path: 'businesses/:businessId', element: <BusinessDetailPage />, handle: { title: 'Business Detail' } },
      { path: 'subscriptions', element: <SubscriptionsPage />, handle: { title: 'Subscriptions' } },
      { path: 'modules', element: <ModulesPage />, handle: { title: 'Advanced Subscriptions' } },

      {
        path: 'analytics',
        element: (
          <Suspense fallback={<AnalyticsFallback />}>
            <AnalyticsPage />
          </Suspense>
        ),
        handle: { title: 'Analytics' },
      },
    ],
  },
]);

export default router;
