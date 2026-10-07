"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseApiQueryResult<T> {
  data: T | null;
  error: unknown;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  const mountedRef = useRef(true);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await fetcherRef.current();
        if (active && mountedRef.current) {
          setError(null);
          setData(result);
        }
      } catch (err) {
        if (active && mountedRef.current) {
          setError(err);
        }
      } finally {
        if (active && mountedRef.current) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, isLoading, refetch };
}
