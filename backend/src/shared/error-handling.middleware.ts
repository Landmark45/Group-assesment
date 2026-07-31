import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';

import { ApplicationError, InvalidInputError, ResourceConflictError } from './application.errors';
import { environmentConfiguration } from './environment.config';

interface ErrorResponseBody {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
    readonly stack?: string;
  };
}

/** Terminal 404 for any URL that matched no router. */
export const handleUnmatchedRoute: RequestHandler = (
  request: Request,
  response: Response,
  _next: NextFunction
): void => {
  const body: ErrorResponseBody = {
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `No API endpoint matches ${request.method} ${request.originalUrl}.`,
    },
  };
  response.status(404).json(body);
};

function translateMongooseError(caughtError: unknown): ApplicationError | null {
  if (caughtError instanceof mongoose.Error.ValidationError) {
    const fieldErrors: Record<string, string> = {};
    for (const [fieldName, fieldError] of Object.entries(caughtError.errors)) {
      fieldErrors[fieldName] = fieldError.message;
    }
    return new InvalidInputError('Some of the information you sent is not valid.', { fieldErrors });
  }

  if (caughtError instanceof mongoose.Error.CastError) {
    return new InvalidInputError(
      `"${String(caughtError.value)}" is not a valid ${caughtError.path}.`
    );
  }

  const mongoDuplicateKeyErrorCode = 11000;
  if (
    typeof caughtError === 'object' &&
    caughtError !== null &&
    'code' in caughtError &&
    (caughtError as { code: unknown }).code === mongoDuplicateKeyErrorCode
  ) {
    const keyPattern = (caughtError as { keyPattern?: Record<string, unknown> }).keyPattern ?? {};
    const duplicatedField = Object.keys(keyPattern)[0] ?? 'value';
    return new ResourceConflictError(`That ${duplicatedField} is already taken.`, {
      fieldErrors: { [duplicatedField]: `That ${duplicatedField} is already taken.` },
    });
  }

  return null;
}

/**
 * The one place in the application that maps a thrown error onto an HTTP
 * status code. Anything unrecognised becomes a 500 with a generic message so
 * internal details never leak to the browser.
 */
export const handleApplicationError: ErrorRequestHandler = (
  caughtError: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
): void => {
  if (response.headersSent) {
    next(caughtError);
    return;
  }

  const applicationError =
    caughtError instanceof ApplicationError ? caughtError : translateMongooseError(caughtError);

  if (applicationError !== null) {
    const body: ErrorResponseBody = {
      success: false,
      error: {
        code: applicationError.errorCode,
        message: applicationError.message,
        ...(applicationError.details !== undefined
          ? { details: applicationError.details as Record<string, unknown> }
          : {}),
      },
    };
    response.status(applicationError.httpStatusCode).json(body);
    return;
  }

  console.error('[unhandled-error]', caughtError);

  const body: ErrorResponseBody = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong on our side. Please try again in a moment.',
      ...(environmentConfiguration.nodeEnvironment !== 'production' && caughtError instanceof Error
        ? { stack: caughtError.stack }
        : {}),
    },
  };
  response.status(500).json(body);
};
