// src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { firebaseUser, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-navy-900)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
