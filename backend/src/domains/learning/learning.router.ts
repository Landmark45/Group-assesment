import { Router } from 'express';

import { requireAuthenticatedUser } from '../../shared/authentication.middleware';
import { validateRequestSection } from '../../shared/request-validation.middleware';
import { learningController } from './learning.controller';
import {
  courseScopedParamsSchema,
  submitCourseReviewSchema,
  updateEnrollmentProgressSchema,
} from './learning.validation';

/**
 * Course-scoped learning routes, mounted at /api/courses/:courseId.
 *
 * `mergeParams` is what lets this router read :courseId from the mount path —
 * the learning domain owns these endpoints even though the URL reads like a
 * catalog resource, because enrollments and reviews are learning's data.
 */
export const learningCourseScopedRouter: Router = Router({ mergeParams: true });

learningCourseScopedRouter.use(validateRequestSection('params', courseScopedParamsSchema));

learningCourseScopedRouter.get('/reviews', learningController.listReviewsForCourse);

learningCourseScopedRouter.post(
  '/reviews',
  requireAuthenticatedUser,
  validateRequestSection('body', submitCourseReviewSchema),
  learningController.submitReviewForCourse
);

learningCourseScopedRouter.delete(
  '/reviews/mine',
  requireAuthenticatedUser,
  learningController.retractOwnReviewForCourse
);

learningCourseScopedRouter.post(
  '/enrollment',
  requireAuthenticatedUser,
  learningController.enrollCurrentUserInCourse
);

learningCourseScopedRouter.delete(
  '/enrollment',
  requireAuthenticatedUser,
  learningController.withdrawCurrentUserFromCourse
);

learningCourseScopedRouter.put(
  '/enrollment/progress',
  requireAuthenticatedUser,
  validateRequestSection('body', updateEnrollmentProgressSchema),
  learningController.updateCurrentUserEnrollmentProgress
);

learningCourseScopedRouter.get(
  '/my-relationship',
  requireAuthenticatedUser,
  learningController.getCurrentUserRelationshipToCourse
);

/**
 * Learner-scoped routes, mounted at /api/enrollments — "the courses I am taking",
 * which is not scoped to any single course.
 */
export const learningEnrollmentRouter: Router = Router();

learningEnrollmentRouter.get(
  '/',
  requireAuthenticatedUser,
  learningController.listCoursesCurrentUserIsEnrolledIn
);
