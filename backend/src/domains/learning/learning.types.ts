import type { CourseView } from '../catalog/catalog.interface';
import type { PublicUserProfileView } from '../identity/identity.interface';

/**
 * The learning domain owns the relationship *between* a student and a course:
 * enrollments and reviews. It never owns course data or user data — it holds
 * the ids and asks the other domains for the rest through their interfaces.
 */

export interface EnrollmentView {
  readonly id: string;
  readonly courseId: string;
  readonly studentUserId: string;
  readonly progressPercentage: number;
  readonly enrolledAt: string;
  /** Hydrated through `catalogDomainInterface.getCoursesByIds`. */
  readonly course: CourseView | null;
}

export interface ReviewView {
  readonly id: string;
  readonly courseId: string;
  readonly rating: number;
  readonly comment: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  /** Hydrated through `identityDomainInterface.getPublicProfilesByIds`. */
  readonly author: PublicUserProfileView | null;
  readonly authorUserId: string;
}

export interface SubmitCourseReviewInput {
  readonly rating: number;
  readonly comment: string;
}

export interface UpdateEnrollmentProgressInput {
  readonly progressPercentage: number;
}

/**
 * What the course detail page needs to decide between "Enroll", "Continue" and
 * "Leave a review" — computed in one call so the UI never has to guess.
 */
export interface LearnerCourseRelationshipView {
  readonly isEnrolled: boolean;
  readonly enrollment: EnrollmentView | null;
  readonly ownReview: ReviewView | null;
  readonly canLeaveReview: boolean;
}

export interface CourseReviewCollectionView {
  readonly reviews: readonly ReviewView[];
  readonly averageRating: number;
  readonly reviewCount: number;
}
