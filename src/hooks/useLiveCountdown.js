// src/hooks/useLiveCountdown.js
//
// Ticks a countdown string every second from a fixed accessExpiresAt
// timestamp, purely client-side — same approach as the POS app's
// useAccessCountdown, just without the AccessStatusManager networking
// layer (the admin panel always has a fresh accessExpiresAt from the
// list/detail API response; it doesn't need its own offline cache).

import { useState, useEffect } from 'react';
import { formatCountdown } from '../utils/countdown';

export function useLiveCountdown(accessExpiresAt) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!accessExpiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [accessExpiresAt]);

  if (!accessExpiresAt) return { countdownText: null, msRemaining: null };

  const msRemaining = accessExpiresAt - now;
  return {
    countdownText: formatCountdown(msRemaining),
    msRemaining: Math.max(0, msRemaining),
  };
}

export default useLiveCountdown;
