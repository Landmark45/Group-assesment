import type { Course } from '../catalog/catalog.types';
import type { PublicUserProfile } from '../identity/identity.types';

export interface Enrollment {
  readonly id: string;
  readonly courseId: string;
  readonly studentUserId: string;
  readonly progressPercentage: number;
  readonly enrolledAt: string;
  readonly course: Course | null;
}

export interface CourseReview {
  readonly id: string;
  readonly courseId: string;
  readonly rating: number;
  readonly comment: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly author: PublicUserProfile | null;
  readonly authorUserId: string;
}

export interface CourseReviewCollection {
  readonly reviews: readonly CourseReview[];
  readonly averageRating: number;
  readonly reviewCount: number;
}

/** What the signed-in visitor's relationship to one course looks like. */
export interface LearnerCourseRelationship {
  readonly isEnrolled: boolean;
  readonly enrollment: Enrollment | null;
  readonly ownReview: CourseReview | null;
  readonly canLeaveReview: boolean;
}

export interface SubmitCourseReviewPayload {
  readonly rating: number;
  readonly comment: string;
}
