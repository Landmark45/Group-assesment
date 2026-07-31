import { Router } from 'express';

import { requireAuthenticatedUser } from '../../shared/authentication.middleware';
import { validateRequestSection } from '../../shared/request-validation.middleware';
import { identityController } from './identity.controller';
import {
  authenticateUserSchema,
  changeUserPasswordSchema,
  registerUserAccountSchema,
  updateUserProfileSchema,
} from './identity.validation';

/**
 * Identity routes. Mounted at /api/auth (credentials) and /api/profile
 * (account management) by the application composition root.
 */
export const identityAuthenticationRouter: Router = Router();

identityAuthenticationRouter.post(
  '/register',
  validateRequestSection('body', registerUserAccountSchema),
  identityController.registerUserAccount
);

identityAuthenticationRouter.post(
  '/login',
  validateRequestSection('body', authenticateUserSchema),
  identityController.authenticateUser
);

identityAuthenticationRouter.get(
  '/me',
  requireAuthenticatedUser,
  identityController.getCurrentUserAccount
);

export const identityProfileRouter: Router = Router();

identityProfileRouter.use(requireAuthenticatedUser);

identityProfileRouter.put(
  '/',
  validateRequestSection('body', updateUserProfileSchema),
  identityController.updateCurrentUserProfile
);

identityProfileRouter.put(
  '/password',
  validateRequestSection('body', changeUserPasswordSchema),
  identityController.changeCurrentUserPassword
);
