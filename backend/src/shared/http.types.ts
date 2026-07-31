import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** The identity attached to a request once the JWT guard has validated a token. */
export interface AuthenticatedRequestActor {
  readonly userId: string;
  readonly email: string;
  readonly username: string;
}

/**
 * Express's own `Request` with the actor made non-optional. Controllers behind
 * `requireAuthenticatedUser` receive this, so they never have to null-check.
 */
export interface AuthenticatedRequest extends Request {
  authenticatedUser?: AuthenticatedRequestActor;
}

export type AsyncRequestHandler = (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps an async controller so a rejected promise reaches the central error
 * handler instead of hanging the request.
 */
export function handleAsyncRoute(asyncHandler: AsyncRequestHandler): RequestHandler {
  return (request, response, next) => {
    void Promise.resolve(asyncHandler(request as AuthenticatedRequest, response, next)).catch(next);
  };
}

/** The single success envelope every endpoint returns. */
export interface SuccessResponseBody<TData> {
  readonly success: true;
  readonly data: TData;
}

export function sendSuccessResponse<TData>(
  response: Response,
  httpStatusCode: number,
  data: TData
): void {
  const body: SuccessResponseBody<TData> = { success: true, data };
  response.status(httpStatusCode).json(body);
}
