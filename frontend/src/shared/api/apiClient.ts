/**
 * The centralised API client. Every request in the application goes through
 * `requestFromApi`, which means there is exactly one place that:
 *
 *   - knows the API base URL,
 *   - attaches the JWT (our "global interceptor"),
 *   - unwraps the `{ success, data }` envelope,
 *   - turns an error envelope into a typed `ApiRequestError`,
 *   - and clears a dead session when the server says 401.
 *
 * Domain API modules build on this and never call `fetch` themselves.
 */

const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] ?? '/api';
const ACCESS_TOKEN_STORAGE_KEY = 'educonnect.accessToken';

export interface ApiFieldErrors {
  readonly [fieldName: string]: string;
}

export class ApiRequestError extends Error {
  public readonly httpStatusCode: number;
  public readonly errorCode: string;
  public readonly fieldErrors: ApiFieldErrors;

  public constructor(
    message: string,
    httpStatusCode: number,
    errorCode: string,
    fieldErrors: ApiFieldErrors = {}
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.httpStatusCode = httpStatusCode;
    this.errorCode = errorCode;
    this.fieldErrors = fieldErrors;
  }

  public get isAuthenticationError(): boolean {
    return this.httpStatusCode === 401;
  }
}

/* -------------------------------------------------------------------------- */
/* Token storage                                                              */
/* -------------------------------------------------------------------------- */

type SessionExpiredListener = () => void;

const sessionExpiredListeners = new Set<SessionExpiredListener>();

export const accessTokenStorage = {
  read(): string | null {
    try {
      return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  write(accessToken: string): void {
    try {
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    } catch {
      /* Private browsing modes can refuse writes; the session simply won't persist. */
    }
  },

  clear(): void {
    try {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    } catch {
      /* No-op — see above. */
    }
  },
};

/**
 * Lets the auth context react when the server rejects our token, without the
 * API client having to import React.
 */
export function subscribeToSessionExpiry(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

function announceSessionExpired(): void {
  accessTokenStorage.clear();
  for (const listener of sessionExpiredListeners) {
    listener();
  }
}

/* -------------------------------------------------------------------------- */
/* Request                                                                    */
/* -------------------------------------------------------------------------- */

interface ApiRequestOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly body?: unknown;
  readonly searchParams?: Record<string, string | number | undefined>;
  readonly signal?: AbortSignal;
}

interface ApiSuccessEnvelope<TData> {
  readonly success: true;
  readonly data: TData;
}

interface ApiErrorEnvelope {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: { readonly fieldErrors?: ApiFieldErrors };
  };
}

function buildRequestUrl(path: string, searchParams?: ApiRequestOptions['searchParams']): string {
  const url = `${API_BASE_URL}${path}`;
  if (searchParams === undefined) {
    return url;
  }
  const encodedParams = new URLSearchParams();
  for (const [parameterName, parameterValue] of Object.entries(searchParams)) {
    if (parameterValue !== undefined && parameterValue !== '') {
      encodedParams.set(parameterName, String(parameterValue));
    }
  }
  const queryString = encodedParams.toString();
  return queryString === '' ? url : `${url}?${queryString}`;
}

export async function requestFromApi<TData>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<TData> {
  const { method = 'GET', body, searchParams, signal } = options;

  const requestHeaders: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // The interceptor: any stored token rides along automatically.
  const accessToken = accessTokenStorage.read();
  if (accessToken !== null) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(buildRequestUrl(path, searchParams), {
      method,
      headers: requestHeaders,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(signal !== undefined ? { signal } : {}),
    });
  } catch (networkError) {
    if (networkError instanceof DOMException && networkError.name === 'AbortError') {
      throw networkError;
    }
    throw new ApiRequestError(
      'We could not reach the EduConnect server. Check your connection and try again.',
      0,
      'NETWORK_UNREACHABLE'
    );
  }

  let parsedBody: unknown = null;
  const responseText = await response.text();
  if (responseText !== '') {
    try {
      parsedBody = JSON.parse(responseText);
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    const errorEnvelope = parsedBody as ApiErrorEnvelope | null;
    const message =
      errorEnvelope?.error?.message ?? 'Something went wrong. Please try again in a moment.';
    const errorCode = errorEnvelope?.error?.code ?? 'UNKNOWN_ERROR';
    const fieldErrors = errorEnvelope?.error?.details?.fieldErrors ?? {};

    if (response.status === 401 && accessToken !== null) {
      // The token we sent is no longer good — drop it so the UI can recover.
      announceSessionExpired();
    }

    throw new ApiRequestError(message, response.status, errorCode, fieldErrors);
  }

  const successEnvelope = parsedBody as ApiSuccessEnvelope<TData> | null;
  if (successEnvelope === null) {
    return undefined as TData;
  }
  return successEnvelope.data;
}
