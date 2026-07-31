import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  ApiRequestError,
  accessTokenStorage,
  subscribeToSessionExpiry,
} from '../../../shared/api/apiClient';
import { identityApi } from '../api/identity.api';
import type { AuthenticatedSession, UserAccount } from '../identity.types';

/**
 * The *only* Context in the application.
 *
 * Server state — courses, enrollments, reviews — belongs to React Query. What
 * lives here is the session itself: the token and the account it belongs to,
 * which the whole tree needs and which no single query owns.
 */

interface AuthenticationContextValue {
  readonly currentUser: UserAccount | null;
  readonly isAuthenticated: boolean;
  /** True only while we are restoring a session from storage on first load. */
  readonly isRestoringSession: boolean;
  readonly beginSession: (session: AuthenticatedSession) => void;
  readonly endSession: () => void;
  readonly replaceCurrentUser: (user: UserAccount) => void;
}

const AuthenticationContext = createContext<AuthenticationContextValue | null>(null);

export function AuthenticationProvider({ children }: { children: ReactNode }): JSX.Element {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(
    () => accessTokenStorage.read() !== null
  );

  const endSession = useCallback((): void => {
    accessTokenStorage.clear();
    setCurrentUser(null);
    // Everything cached was fetched as that user; none of it is ours now.
    queryClient.clear();
  }, [queryClient]);

  const beginSession = useCallback((session: AuthenticatedSession): void => {
    accessTokenStorage.write(session.accessToken);
    setCurrentUser(session.user);
  }, []);

  const replaceCurrentUser = useCallback((user: UserAccount): void => {
    setCurrentUser(user);
  }, []);

  /**
   * On first mount, if a token survived the last visit, ask the API who it
   * belongs to. The abort controller is the cleanup: if the provider unmounts
   * mid-flight (React 18 StrictMode remounts in development), the request is
   * cancelled rather than setting state on a dead component.
   */
  useEffect(() => {
    const storedAccessToken = accessTokenStorage.read();
    if (storedAccessToken === null) {
      setIsRestoringSession(false);
      return;
    }

    const abortController = new AbortController();
    let isStillMounted = true;

    identityApi
      .fetchCurrentUserAccount(abortController.signal)
      .then((user) => {
        if (isStillMounted) {
          setCurrentUser(user);
        }
      })
      .catch((restoreError: unknown) => {
        if (!isStillMounted) {
          return;
        }
        setCurrentUser(null);

        // The API client clears the token itself on a 401, but that is not the
        // only way a token can be useless: one that is still cryptographically
        // valid yet points at an account that no longer exists comes back 404.
        // Discard the token for any 4xx, so a dead session cannot sit in storage
        // failing this request on every single page load.
        //
        // Deliberately *not* on a network error or a 5xx — the API being briefly
        // unreachable is no reason to sign someone out.
        if (
          restoreError instanceof ApiRequestError &&
          restoreError.httpStatusCode >= 400 &&
          restoreError.httpStatusCode < 500
        ) {
          accessTokenStorage.clear();
        }
      })
      .finally(() => {
        if (isStillMounted) {
          setIsRestoringSession(false);
        }
      });

    return () => {
      isStillMounted = false;
      abortController.abort();
    };
  }, []);

  /**
   * The API client shouts when the server rejects our token mid-session. We
   * listen so the UI can drop to the signed-out state immediately instead of
   * leaving a stale name in the header. The unsubscribe is the cleanup.
   */
  useEffect(() => {
    const unsubscribeFromSessionExpiry = subscribeToSessionExpiry(() => {
      setCurrentUser(null);
      queryClient.clear();
    });
    return unsubscribeFromSessionExpiry;
  }, [queryClient]);

  const contextValue = useMemo<AuthenticationContextValue>(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      isRestoringSession,
      beginSession,
      endSession,
      replaceCurrentUser,
    }),
    [currentUser, isRestoringSession, beginSession, endSession, replaceCurrentUser]
  );

  return (
    <AuthenticationContext.Provider value={contextValue}>{children}</AuthenticationContext.Provider>
  );
}

export function useAuthentication(): AuthenticationContextValue {
  const contextValue = useContext(AuthenticationContext);
  if (contextValue === null) {
    throw new Error('useAuthentication must be used inside an <AuthenticationProvider>.');
  }
  return contextValue;
}
