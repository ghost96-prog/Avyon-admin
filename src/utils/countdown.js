// src/utils/countdown.js
//
// Same format as the POS app's PinModal countdown ("1d:2h:30m:2s") so the
// admin sees the identical representation their customer sees — useful
// when troubleshooting "the customer says it shows X" support calls.

export function formatCountdown(msRemaining) {
  if (msRemaining === null || msRemaining === undefined || msRemaining <= 0) return null;

  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d:${hours}h:${minutes}m:${seconds}s`;
}

export function formatDate(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
