import {
  PermissionDeniedError,
  ResourceConflictError,
  ResourceNotFoundError,
} from '../../shared/application.errors';
import { catalogDomainInterface, type CourseView } from '../catalog/catalog.interface';
import { identityDomainInterface } from '../identity/identity.interface';
import { learningRepository } from './learning.repository';
import type { CourseReviewDocument, EnrollmentDocument } from './learning.model';
import type {
  CourseReviewCollectionView,
  EnrollmentView,
  LearnerCourseRelationshipView,
  ReviewView,
  SubmitCourseReviewInput,
} from './learning.types';

type PublicProfileLookup = Awaited<ReturnType<typeof identityDomainInterface.getPublicProfilesByIds>>;

function mapDocumentToEnrollmentView(
  document: EnrollmentDocument,
  course: CourseView | null
): EnrollmentView {
  return {
    id: document.id as string,
    courseId: document.courseId.toString(),
    studentUserId: document.studentUserId.toString(),
    progressPercentage: document.progressPercentage,
    enrolledAt: document.createdAt.toISOString(),
    course,
  };
}

function mapDocumentToReviewView(
  document: CourseReviewDocument,
  authorProfiles: PublicProfileLookup
): ReviewView {
  const authorUserId = document.authorUserId.toString();
  return {
    id: document.id as string,
    courseId: document.courseId.toString(),
    rating: document.rating,
    comment: document.comment,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    author: authorProfiles.get(authorUserId) ?? null,
    authorUserId,
  };
}

async function attachAuthorProfiles(
  reviewDocuments: readonly CourseReviewDocument[]
): Promise<ReviewView[]> {
  const uniqueAuthorIds = [
    ...new Set(reviewDocuments.map((document) => document.authorUserId.toString())),
  ];
  const authorProfiles = await identityDomainInterface.getPublicProfilesByIds(uniqueAuthorIds);
  return reviewDocuments.map((document) => mapDocumentToReviewView(document, authorProfiles));
}

/**
 * After any review write, recompute the course's rating and hand the result
 * back to the catalog. The catalog owns the number it displays; learning owns
 * the reviews it is derived from. That split is why this goes through
 * `catalogDomainInterface` rather than updating the course document directly.
 */
async function refreshCatalogRatingSnapshot(courseId: string): Promise<void> {
  const snapshot = await learningRepository.calculateRatingSnapshotForCourse(courseId);
  await catalogDomainInterface.replaceCourseRatingSnapshot(courseId, snapshot);
}

/** The learning domain's business logic — the only thing learning controllers may call. */
export const learningService = {
  async enrollStudentInCourse(courseId: string, studentUserId: string): Promise<EnrollmentView> {
    // Throws ResourceNotFoundError if the course does not exist, so we never
    // create an enrollment pointing at nothing.
    const course = await catalogDomainInterface.getCourseById(courseId);

    if (course.instructorUserId === studentUserId) {
      throw new ResourceConflictError('You already teach this course — no need to enroll in it.');
    }

    const existingEnrollment = await learningRepository.findEnrollment(courseId, studentUserId);
    if (existingEnrollment !== null) {
      throw new ResourceConflictError('You are already enrolled in this course.');
    }

    const createdEnrollment = await learningRepository.createEnrollment(courseId, studentUserId);
    await catalogDomainInterface.adjustCourseEnrollmentCount(courseId, 1);

    return mapDocumentToEnrollmentView(createdEnrollment, course);
  },

  async withdrawStudentFromCourse(courseId: string, studentUserId: string): Promise<void> {
    const wasDeleted = await learningRepository.deleteEnrollment(courseId, studentUserId);
    if (!wasDeleted) {
      throw new ResourceNotFoundError('That enrollment');
    }
    await catalogDomainInterface.adjustCourseEnrollmentCount(courseId, -1);

    // Withdrawing also retracts the review, so a rating always reflects people
    // who are actually taking the course.
    const hadReview = await learningRepository.deleteReviewByAuthor(courseId, studentUserId);
    if (hadReview) {
      await refreshCatalogRatingSnapshot(courseId);
    }
  },

  async getEnrolledCoursesForStudent(
    studentUserId: string
  ): Promise<readonly EnrollmentView[]> {
    const enrollments = await learningRepository.findEnrollmentsForStudent(studentUserId);
    if (enrollments.length === 0) {
      return [];
    }

    const courses = await catalogDomainInterface.getCoursesByIds(
      enrollments.map((enrollment) => enrollment.courseId.toString())
    );
    const coursesById = new Map(courses.map((course) => [course.id, course]));

    return enrollments.map((enrollment) =>
      mapDocumentToEnrollmentView(enrollment, coursesById.get(enrollment.courseId.toString()) ?? null)
    );
  },

  async updateEnrollmentProgressForStudent(
    courseId: string,
    studentUserId: string,
    progressPercentage: number
  ): Promise<EnrollmentView> {
    const enrollment = await learningRepository.findEnrollment(courseId, studentUserId);
    if (enrollment === null) {
      throw new ResourceNotFoundError('That enrollment');
    }
    const updatedEnrollment = await learningRepository.updateEnrollmentProgress(
      enrollment.id as string,
      progressPercentage
    );
    if (updatedEnrollment === null) {
      throw new ResourceNotFoundError('That enrollment');
    }
    const course = await catalogDomainInterface.getCourseById(courseId);
    return mapDocumentToEnrollmentView(updatedEnrollment, course);
  },

  async submitReviewForCourse(
    courseId: string,
    authorUserId: string,
    input: SubmitCourseReviewInput
  ): Promise<ReviewView> {
    // Confirms the course exists before we do anything else.
    await catalogDomainInterface.getCourseById(courseId);

    // The core enrollment rule: only people who enrolled may review.
    const enrollment = await learningRepository.findEnrollment(courseId, authorUserId);
    if (enrollment === null) {
      throw new PermissionDeniedError('Enroll in this course before leaving a review.');
    }

    const savedReview = await learningRepository.upsertCourseReview(courseId, authorUserId, {
      rating: input.rating,
      comment: input.comment,
    });
    await refreshCatalogRatingSnapshot(courseId);

    const [reviewView] = await attachAuthorProfiles([savedReview]);
    if (reviewView === undefined) {
      throw new ResourceNotFoundError('That review');
    }
    return reviewView;
  },

  async retractOwnReviewForCourse(courseId: string, authorUserId: string): Promise<void> {
    const wasDeleted = await learningRepository.deleteReviewByAuthor(courseId, authorUserId);
    if (!wasDeleted) {
      throw new ResourceNotFoundError('That review');
    }
    await refreshCatalogRatingSnapshot(courseId);
  },

  async getReviewsForCourse(courseId: string): Promise<CourseReviewCollectionView> {
    const reviewDocuments = await learningRepository.findReviewsForCourse(courseId);
    const snapshot = await learningRepository.calculateRatingSnapshotForCourse(courseId);
    return {
      reviews: await attachAuthorProfiles(reviewDocuments),
      averageRating: Number(snapshot.averageRating.toFixed(2)),
      reviewCount: snapshot.reviewCount,
    };
  },

  /**
   * One call that answers everything the course detail page asks about the
   * signed-in visitor, so the UI does not have to stitch three requests together.
   */
  async getLearnerRelationshipToCourse(
    courseId: string,
    studentUserId: string
  ): Promise<LearnerCourseRelationshipView> {
    const [enrollment, ownReviewDocument] = await Promise.all([
      learningRepository.findEnrollment(courseId, studentUserId),
      learningRepository.findReviewByAuthor(courseId, studentUserId),
    ]);

    const ownReview =
      ownReviewDocument === null ? null : (await attachAuthorProfiles([ownReviewDocument]))[0] ?? null;

    return {
      isEnrolled: enrollment !== null,
      enrollment: enrollment === null ? null : mapDocumentToEnrollmentView(enrollment, null),
      ownReview,
      canLeaveReview: enrollment !== null,
    };
  },
};
