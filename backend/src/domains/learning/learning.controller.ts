import type { Response } from 'express';

import { requireActorFromRequest } from '../../shared/authentication.middleware';
import {
  handleAsyncRoute,
  sendSuccessResponse,
  type AuthenticatedRequest,
} from '../../shared/http.types';
import { learningService } from './learning.service';
import type { SubmitCourseReviewInput, UpdateEnrollmentProgressInput } from './learning.types';

function readCourseIdFromRequest(request: AuthenticatedRequest): string {
  return (request.params as { courseId: string }).courseId;
}

export const learningController = {
  enrollCurrentUserInCourse: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      const enrollment = await learningService.enrollStudentInCourse(
        readCourseIdFromRequest(request),
        actor.userId
      );
      sendSuccessResponse(response, 201, enrollment);
    }
  ),

  withdrawCurrentUserFromCourse: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      await learningService.withdrawStudentFromCourse(
        readCourseIdFromRequest(request),
        actor.userId
      );
      sendSuccessResponse(response, 200, { message: 'You have left this course.' });
    }
  ),

  listCoursesCurrentUserIsEnrolledIn: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      const enrollments = await learningService.getEnrolledCoursesForStudent(actor.userId);
      sendSuccessResponse(response, 200, { enrollments });
    }
  ),

  updateCurrentUserEnrollmentProgress: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      const { progressPercentage } = request.body as UpdateEnrollmentProgressInput;
      const enrollment = await learningService.updateEnrollmentProgressForStudent(
        readCourseIdFromRequest(request),
        actor.userId,
        progressPercentage
      );
      sendSuccessResponse(response, 200, enrollment);
    }
  ),

  listReviewsForCourse: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const reviewCollection = await learningService.getReviewsForCourse(
        readCourseIdFromRequest(request)
      );
      sendSuccessResponse(response, 200, reviewCollection);
    }
  ),

  submitReviewForCourse: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      const review = await learningService.submitReviewForCourse(
        readCourseIdFromRequest(request),
        actor.userId,
        request.body as SubmitCourseReviewInput
      );
      sendSuccessResponse(response, 201, review);
    }
  ),

  retractOwnReviewForCourse: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      await learningService.retractOwnReviewForCourse(
        readCourseIdFromRequest(request),
        actor.userId
      );
      sendSuccessResponse(response, 200, { message: 'Your review has been removed.' });
    }
  ),

  getCurrentUserRelationshipToCourse: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      const relationship = await learningService.getLearnerRelationshipToCourse(
        readCourseIdFromRequest(request),
        actor.userId
      );
      sendSuccessResponse(response, 200, relationship);
    }
  ),
};
