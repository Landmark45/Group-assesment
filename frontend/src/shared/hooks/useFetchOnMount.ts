import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiRequestError } from '../api/apiClient';

/**
 * Classic `useEffect` + `useState` data fetching, done properly.
 *
 * Most server state in EduConnect lives in React Query, which is the better
 * tool when a screen needs caching, background refetching and cross-screen
 * invalidation. This hook exists for the screens that need none of that and
 * simply want to load their data once when they mount — and it keeps the
 * lifecycle pattern visible in the codebase rather than hidden inside a library.
 *
 * It handles the three things a hand-rolled fetch usually gets wrong:
 *
 *   1. Loading and error state are real state, not booleans people forget to reset.
 *   2. The request is aborted when the component unmounts, so a slow response
 *      cannot set state on a component that is no longer on screen. React 18's
 *      StrictMode mounts every component twice in development specifically to
 *      catch the absence of this cleanup.
 *   3. The fetcher is held in a ref, so passing an inline arrow function — which
 *      is a brand new value on every render — does not restart the effect forever.
 */
export interface FetchedResource<TData> {
  readonly data: TData | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  /** Runs the fetch again, e.g. from the "Try that again" button on an error state. */
  readonly refetch: () => void;
}

export function useFetchOnMount<TData>(
  fetchResource: (signal: AbortSignal) => Promise<TData>
): FetchedResource<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState<number>(0);

  // Always call the newest fetcher, without making it an effect dependency.
  const fetchResourceRef = useRef(fetchResource);
  useEffect(() => {
    fetchResourceRef.current = fetchResource;
  });

  useEffect(() => {
    const abortController = new AbortController();
    let isStillMounted = true;

    setIsLoading(true);
    setErrorMessage(null);

    fetchResourceRef
      .current(abortController.signal)
      .then((fetchedData) => {
        if (isStillMounted) {
          setData(fetchedData);
        }
      })
      .catch((caughtError: unknown) => {
        // An abort is us tearing the component down, not a failure to report.
        if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
          return;
        }
        if (!isStillMounted) {
          return;
        }
        setErrorMessage(
          caughtError instanceof ApiRequestError
            ? caughtError.message
            : 'Something went wrong on our side. Please try again in a moment.'
        );
      })
      .finally(() => {
        if (isStillMounted) {
          setIsLoading(false);
        }
      });

    // The cleanup function: stop listening, and cancel the request in flight.
    return () => {
      isStillMounted = false;
      abortController.abort();
    };
  }, [reloadCounter]);

  const refetch = useCallback((): void => {
    setReloadCounter((previousCounter) => previousCounter + 1);
  }, []);

  return { data, isLoading, errorMessage, refetch };
}
