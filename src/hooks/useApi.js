// src/hooks/useApi.js
//
// Small data-fetching hook so every page doesn't repeat the same
// loading/error/data useState+useEffect boilerplate. Re-fetches whenever
// `deps` changes, and exposes `refetch` for after a mutation (e.g. after
// activating a subscription, refetch the business detail to show the new
// expiry immediately rather than waiting for the next natural refresh).

import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current();
      setData(result);
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, isLoading, refetch: load, setData };
}

export default useApi;
