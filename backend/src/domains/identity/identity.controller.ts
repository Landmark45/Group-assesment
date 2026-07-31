import type { Response } from 'express';

import { requireActorFromRequest } from '../../shared/authentication.middleware';
import {
  handleAsyncRoute,
  sendSuccessResponse,
  type AuthenticatedRequest,
} from '../../shared/http.types';
import { identityService } from './identity.service';
import type {
  AuthenticateUserInput,
  ChangeUserPasswordInput,
  RegisterUserAccountInput,
  UpdateUserProfileInput,
} from './identity.types';

/**
 * Request/response plumbing for the identity domain. Every handler does the
 * same three things and nothing more: read the (already validated) request,
 * call the domain service, map the result onto a status code.
 */
export const identityController = {
  registerUserAccount: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const session = await identityService.registerUserAccount(
        request.body as RegisterUserAccountInput
      );
      sendSuccessResponse(response, 201, session);
    }
  ),

  authenticateUser: handleAsyncRoute(async (request: AuthenticatedRequest, response: Response) => {
    const session = await identityService.authenticateUser(request.body as AuthenticateUserInput);
    sendSuccessResponse(response, 200, session);
  }),

  getCurrentUserAccount: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      const account = await identityService.getUserAccountById(actor.userId);
      sendSuccessResponse(response, 200, account);
    }
  ),

  updateCurrentUserProfile: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      const updatedAccount = await identityService.updateUserProfile(
        actor.userId,
        request.body as UpdateUserProfileInput
      );
      sendSuccessResponse(response, 200, updatedAccount);
    }
  ),

  changeCurrentUserPassword: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      await identityService.changeUserPassword(
        actor.userId,
        request.body as ChangeUserPasswordInput
      );
      sendSuccessResponse(response, 200, { message: 'Your password has been updated.' });
    }
  ),
};
