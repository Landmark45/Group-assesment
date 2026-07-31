import { Navigate, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { InlineLoadingState } from '../shared/components/AsyncStates';
import { useAuthentication } from '../domains/identity/hooks/AuthenticationContext';

const RestoringSessionShell = styled.div`
  display: grid;
  place-items: center;
  min-height: 55vh;
`;

interface LocationStateWithRedirect {
  readonly redirectTo?: string;
}

/**
 * Router state is anything the previous route chose to put there, so treat it as
 * untrusted: only accept a same-site path, never a full URL that could bounce
 * someone off the platform after signing in.
 */
export function readRedirectDestination(locationState: unknown): string | null {
  const candidate = (locationState as LocationStateWithRedirect | null)?.redirectTo;
  if (typeof candidate !== 'string' || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return null;
  }
  return candidate;
}

/**
 * The client-side route guard.
 *
 * There is one subtlety worth stating plainly: on a hard refresh the session is
 * restored asynchronously, so for a moment we are neither signed in nor signed
 * out. Redirecting during that moment would bounce a perfectly valid user to
 * the login page, so we wait for `isRestoringSession` to settle first.
 *
 * Where the visitor was headed is carried in router state, so signing in
 * returns them there rather than dumping them on the dashboard.
 */
export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated, isRestoringSession } = useAuthentication();
  const location = useLocation();

  if (isRestoringSession) {
    return (
      <RestoringSessionShell>
        <InlineLoadingState message="Checking you are still signed in…" />
      </RestoringSessionShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ redirectTo: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}

/**
 * The mirror image: keeps a signed-in visitor away from the sign-in and
 * sign-up screens, which would only confuse them.
 */
export function GuestOnlyRoute(): JSX.Element {
  const { isAuthenticated, isRestoringSession } = useAuthentication();
  const location = useLocation();

  if (isRestoringSession) {
    return (
      <RestoringSessionShell>
        <InlineLoadingState message="One moment…" />
      </RestoringSessionShell>
    );
  }

  if (isAuthenticated) {
    // Read the same `redirectTo` that ProtectedRoute stashed on the way here.
    //
    // This is not just a nicety. The instant a sign-in succeeds, `isAuthenticated`
    // flips and this guard re-renders — racing the sign-in page's own
    // navigate(redirectTo). If the two disagreed about the destination, whichever
    // ran first would win, and this one used to send everybody to the dashboard
    // regardless of where they had actually been headed. Agreeing on the
    // destination removes the race rather than papering over it.
    const redirectTo = readRedirectDestination(location.state) ?? '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
