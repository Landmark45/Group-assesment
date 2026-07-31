import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { App } from './app/App';
import { AuthenticationProvider } from './domains/identity/hooks/AuthenticationContext';
import { ApiRequestError } from './shared/api/apiClient';
import { GlobalStyles } from './theme/GlobalStyles';
import { educonnectTheme } from './theme/educonnect.theme';

/**
 * The provider stack, outermost first:
 *
 *   ThemeProvider      — every styled component reads its tokens from here
 *   QueryClientProvider— all server state
 *   AuthenticationProvider — the session (needs the query client, to clear the
 *                            cache when a session ends)
 *   BrowserRouter      — routing
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, requestError) => {
        // Retrying a 401 or a 404 only wastes the user's time — the answer is
        // not going to change. Genuine network blips are worth one more go.
        if (requestError instanceof ApiRequestError && requestError.httpStatusCode >= 400 && requestError.httpStatusCode < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('EduConnect could not start: no #root element in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={educonnectTheme}>
      <GlobalStyles />
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider>
          {/* The future flags opt in to React Router v7's behaviour now, which
              also silences its upgrade warnings in the console. */}
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <App />
          </BrowserRouter>
        </AuthenticationProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
