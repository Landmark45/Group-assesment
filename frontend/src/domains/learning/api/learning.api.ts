import { requestFromApi } from '../../../shared/api/apiClient';
import type {
  CourseReview,
  CourseReviewCollection,
  Enrollment,
  LearnerCourseRelationship,
  SubmitCourseReviewPayload,
} from '../learning.types';

export const learningApi = {
  fetchMyEnrollments(signal?: AbortSignal): Promise<{ enrollments: readonly Enrollment[] }> {
    return requestFromApi<{ enrollments: readonly Enrollment[] }>(
      '/enrollments',
      signal !== undefined ? { signal } : {}
    );
  },

  fetchReviewsForCourse(courseId: string, signal?: AbortSignal): Promise<CourseReviewCollection> {
    return requestFromApi<CourseReviewCollection>(
      `/courses/${courseId}/reviews`,
      signal !== undefined ? { signal } : {}
    );
  },

  fetchMyRelationshipToCourse(
    courseId: string,
    signal?: AbortSignal
  ): Promise<LearnerCourseRelationship> {
    return requestFromApi<LearnerCourseRelationship>(
      `/courses/${courseId}/my-relationship`,
      signal !== undefined ? { signal } : {}
    );
  },

  enrollInCourse(courseId: string): Promise<Enrollment> {
    return requestFromApi<Enrollment>(`/courses/${courseId}/enrollment`, { method: 'POST' });
  },

  withdrawFromCourse(courseId: string): Promise<{ message: string }> {
    return requestFromApi<{ message: string }>(`/courses/${courseId}/enrollment`, {
      method: 'DELETE',
    });
  },

  updateEnrollmentProgress(courseId: string, progressPercentage: number): Promise<Enrollment> {
    return requestFromApi<Enrollment>(`/courses/${courseId}/enrollment/progress`, {
      method: 'PUT',
      body: { progressPercentage },
    });
  },

  submitReviewForCourse(
    courseId: string,
    payload: SubmitCourseReviewPayload
  ): Promise<CourseReview> {
    return requestFromApi<CourseReview>(`/courses/${courseId}/reviews`, {
      method: 'POST',
      body: payload,
    });
  },

  retractMyReviewForCourse(courseId: string): Promise<{ message: string }> {
    return requestFromApi<{ message: string }>(`/courses/${courseId}/reviews/mine`, {
      method: 'DELETE',
    });
  },
};
