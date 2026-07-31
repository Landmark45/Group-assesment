import type { Response } from 'express';

import { requireActorFromRequest } from '../../shared/authentication.middleware';
import {
  handleAsyncRoute,
  sendSuccessResponse,
  type AuthenticatedRequest,
} from '../../shared/http.types';
import { catalogService } from './catalog.service';
import type { CourseCatalogQuery, CreateCourseInput, UpdateCourseInput } from './catalog.types';

function readCourseIdFromRequest(request: AuthenticatedRequest): string {
  return (request.params as { courseId: string }).courseId;
}

export const catalogController = {
  listCoursesForPublicCatalog: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const catalogPage = await catalogService.getPaginatedCourseCatalog(
        request.query as unknown as CourseCatalogQuery
      );
      sendSuccessResponse(response, 200, catalogPage);
    }
  ),

  getCourseDetail: handleAsyncRoute(async (request: AuthenticatedRequest, response: Response) => {
    const course = await catalogService.getCourseById(readCourseIdFromRequest(request));
    sendSuccessResponse(response, 200, course);
  }),

  listCoursesCreatedByCurrentUser: handleAsyncRoute(
    async (request: AuthenticatedRequest, response: Response) => {
      const actor = requireActorFromRequest(request);
      const courses = await catalogService.getCoursesCreatedByInstructor(actor.userId);
      sendSuccessResponse(response, 200, { courses });
    }
  ),

  createCourse: handleAsyncRoute(async (request: AuthenticatedRequest, response: Response) => {
    const actor = requireActorFromRequest(request);
    const createdCourse = await catalogService.createCourseForInstructor(
      actor.userId,
      request.body as CreateCourseInput
    );
    sendSuccessResponse(response, 201, createdCourse);
  }),

  updateCourse: handleAsyncRoute(async (request: AuthenticatedRequest, response: Response) => {
    const actor = requireActorFromRequest(request);
    const updatedCourse = await catalogService.updateCourseOwnedByInstructor(
      readCourseIdFromRequest(request),
      actor.userId,
      request.body as UpdateCourseInput
    );
    sendSuccessResponse(response, 200, updatedCourse);
  }),

  deleteCourse: handleAsyncRoute(async (request: AuthenticatedRequest, response: Response) => {
    const actor = requireActorFromRequest(request);
    await catalogService.deleteCourseOwnedByInstructor(
      readCourseIdFromRequest(request),
      actor.userId
    );
    sendSuccessResponse(response, 200, { message: 'That course has been removed.' });
  }),
};
