import { Router } from 'express';

import { requireAuthenticatedUser } from '../../shared/authentication.middleware';
import { validateRequestSection } from '../../shared/request-validation.middleware';
import { catalogController } from './catalog.controller';
import {
  courseCatalogQuerySchema,
  courseIdentifierParamsSchema,
  createCourseSchema,
  updateCourseSchema,
} from './catalog.validation';

/**
 * Catalog routes, mounted at /api/courses.
 *
 * Reads are public; every write sits behind the JWT guard *and* an ownership
 * check inside the service, so a valid token for the wrong user still gets 403.
 */
export const catalogRouter: Router = Router();

// Literal segments must be declared before "/:courseId" or they would be
// swallowed by the parameterised route.
catalogRouter.get(
  '/mine',
  requireAuthenticatedUser,
  catalogController.listCoursesCreatedByCurrentUser
);

catalogRouter.get(
  '/',
  validateRequestSection('query', courseCatalogQuerySchema),
  catalogController.listCoursesForPublicCatalog
);

catalogRouter.post(
  '/',
  requireAuthenticatedUser,
  validateRequestSection('body', createCourseSchema),
  catalogController.createCourse
);

catalogRouter.get(
  '/:courseId',
  validateRequestSection('params', courseIdentifierParamsSchema),
  catalogController.getCourseDetail
);

catalogRouter.put(
  '/:courseId',
  requireAuthenticatedUser,
  validateRequestSection('params', courseIdentifierParamsSchema),
  validateRequestSection('body', updateCourseSchema),
  catalogController.updateCourse
);

catalogRouter.delete(
  '/:courseId',
  requireAuthenticatedUser,
  validateRequestSection('params', courseIdentifierParamsSchema),
  catalogController.deleteCourse
);
