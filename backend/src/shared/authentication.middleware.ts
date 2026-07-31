import type { NextFunction, RequestHandler, Response } from 'express';
import jsonWebToken, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

import { AuthenticationRequiredError } from './application.errors';
import { environmentConfiguration } from './environment.config';
import type { AuthenticatedRequest, AuthenticatedRequestActor } from './http.types';

interface EduConnectTokenPayload extends JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly username: string;
}

export function issueAccessTokenForUser(actor: AuthenticatedRequestActor): string {
  const signOptions: SignOptions = {
    expiresIn: environmentConfiguration.jsonWebTokenExpiresIn as SignOptions['expiresIn'],
  };
  return jsonWebToken.sign(
    { sub: actor.userId, email: actor.email, username: actor.username },
    environmentConfiguration.jsonWebTokenSecret,
    signOptions
  );
}

function readBearerTokenFromRequest(request: AuthenticatedRequest): string | null {
  const authorizationHeader = request.headers.authorization;
  if (typeof authorizationHeader !== 'string') {
    return null;
  }
  const [scheme, tokenValue] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !tokenValue) {
    return null;
  }
  return tokenValue;
}

function verifyAccessToken(tokenValue: string): AuthenticatedRequestActor | null {
  try {
    const decodedPayload = jsonWebToken.verify(
      tokenValue,
      environmentConfiguration.jsonWebTokenSecret
    ) as EduConnectTokenPayload;

    if (typeof decodedPayload.sub !== 'string') {
      return null;
    }

    return {
      userId: decodedPayload.sub,
      email: decodedPayload.email,
      username: decodedPayload.username,
    };
  } catch {
    return null;
  }
}

/**
 * Hard guard for private routes: a missing or invalid token stops the request
 * with 401 before any controller runs.
 */
export const requireAuthenticatedUser: RequestHandler = (
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction
): void => {
  const tokenValue = readBearerTokenFromRequest(request);
  if (tokenValue === null) {
    next(new AuthenticationRequiredError('This action requires you to be signed in.'));
    return;
  }

  const actor = verifyAccessToken(tokenValue);
  if (actor === null) {
    next(new AuthenticationRequiredError('Your session has expired. Please sign in again.'));
    return;
  }

  request.authenticatedUser = actor;
  next();
};

/**
 * Soft guard for public routes that render differently when signed in — for
 * example the course detail page, which shows "Enrolled" instead of "Enroll".
 * Never rejects; simply annotates the request when a valid token is present.
 */
export const attachAuthenticatedUserIfPresent: RequestHandler = (
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction
): void => {
  const tokenValue = readBearerTokenFromRequest(request);
  if (tokenValue !== null) {
    const actor = verifyAccessToken(tokenValue);
    if (actor !== null) {
      request.authenticatedUser = actor;
    }
  }
  next();
};

/** Narrowing helper used by controllers that sit behind `requireAuthenticatedUser`. */
export function requireActorFromRequest(request: AuthenticatedRequest): AuthenticatedRequestActor {
  if (request.authenticatedUser === undefined) {
    throw new AuthenticationRequiredError();
  }
  return request.authenticatedUser;
}
