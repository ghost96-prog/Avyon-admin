// src/components/ui/Card.jsx
import React from 'react';

export default function Card({ children, className = '', padded = true }) {
  return (
    <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl ${padded ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}
