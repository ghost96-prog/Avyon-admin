// src/components/ui/ConfirmModal.jsx
//
// Generic confirmation modal for destructive actions. Requires an
// explicit "I understand" acknowledgement before the confirm button
// enables, so a stray click can't trigger something irreversible like a
// permanent business deletion.

import React, { useState, useEffect } from 'react';

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  requireAcknowledgement = true,
  isLoading = false,
  error = null,
  onConfirm,
  onCancel,
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  // Reset the acknowledgement checkbox every time the modal is (re)opened
  // for a new target, so it can't carry over from a previous confirmation.
  useEffect(() => {
    if (open) setAcknowledged(false);
  }, [open]);

  if (!open) return null;

  const canConfirm = !isLoading && (!requireAcknowledgement || acknowledged);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>

        <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
          {message}
        </p>

        {requireAcknowledgement && (
          <label className="mt-4 flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 text-[var(--color-danger)] border-[var(--color-border)] rounded focus:ring-[var(--color-danger)]"
            />
            <span className="text-sm text-[var(--color-text)]">
              I understand this action cannot be reversed.
            </span>
          </label>
        )}

        {error && (
          <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-neutral-bg)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-danger)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}