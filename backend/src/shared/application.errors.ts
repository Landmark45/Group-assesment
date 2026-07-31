/**
 * A single error hierarchy shared by every domain. Services throw these;
 * the central error handler is the only place that knows how to turn them
 * into an HTTP response, which keeps status-code decisions out of controllers.
 */
export abstract class ApplicationError extends Error {
  public abstract readonly httpStatusCode: number;
  public abstract readonly errorCode: string;
  public readonly details: Readonly<Record<string, unknown>> | undefined;

  protected constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    this.details = details;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** 400 — the caller sent something the domain cannot accept. */
export class InvalidInputError extends ApplicationError {
  public readonly httpStatusCode = 400;
  public readonly errorCode = 'INVALID_INPUT';

  public constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

/** 401 — we do not know who the caller is. */
export class AuthenticationRequiredError extends ApplicationError {
  public readonly httpStatusCode = 401;
  public readonly errorCode = 'AUTHENTICATION_REQUIRED';

  public constructor(message = 'You need to sign in to do that.') {
    super(message);
  }
}

/** 403 — we know who the caller is, and they are not allowed. */
export class PermissionDeniedError extends ApplicationError {
  public readonly httpStatusCode = 403;
  public readonly errorCode = 'PERMISSION_DENIED';

  public constructor(message = 'You do not have permission to do that.') {
    super(message);
  }
}

/** 404 — the resource does not exist (or is not visible to this caller). */
export class ResourceNotFoundError extends ApplicationError {
  public readonly httpStatusCode = 404;
  public readonly errorCode = 'RESOURCE_NOT_FOUND';

  public constructor(resourceName: string) {
    super(`${resourceName} could not be found.`);
  }
}

/** 409 — the request is valid but conflicts with the current state of the world. */
export class ResourceConflictError extends ApplicationError {
  public readonly httpStatusCode = 409;
  public readonly errorCode = 'RESOURCE_CONFLICT';

  public constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
