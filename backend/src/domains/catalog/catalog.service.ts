import {
  PermissionDeniedError,
  ResourceNotFoundError,
} from '../../shared/application.errors';
import { identityDomainInterface } from '../identity/identity.interface';
import { catalogRepository } from './catalog.repository';
import type { CourseDocument } from './catalog.model';
import type {
  CourseCatalogQuery,
  CourseRatingSnapshot,
  CourseView,
  CreateCourseInput,
  PaginatedCourseCatalogView,
  UpdateCourseInput,
} from './catalog.types';

type PublicProfileLookup = Awaited<ReturnType<typeof identityDomainInterface.getPublicProfilesByIds>>;

function mapDocumentToCourseView(
  document: CourseDocument,
  instructorProfiles: PublicProfileLookup
): CourseView {
  const instructorUserId = document.instructorUserId.toString();
  return {
    id: document.id as string,
    title: document.title,
    description: document.description,
    category: document.category,
    difficultyLevel: document.difficultyLevel,
    priceInUnitedStatesDollars: document.priceInUnitedStatesDollars,
    thumbnailImageUrl: document.thumbnailImageUrl,
    modules: document.modules.map((moduleDocument) => ({
      title: moduleDocument.title,
      summary: moduleDocument.summary,
      estimatedMinutes: moduleDocument.estimatedMinutes,
    })),
    instructor: instructorProfiles.get(instructorUserId) ?? null,
    instructorUserId,
    enrollmentCount: document.enrollmentCount,
    averageRating: document.averageRating,
    reviewCount: document.reviewCount,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

/**
 * Resolves instructor bylines for a batch of courses in a single round trip,
 * going through the identity domain's published interface rather than reading
 * its models directly.
 */
async function attachInstructorProfiles(
  courseDocuments: readonly CourseDocument[]
): Promise<CourseView[]> {
  const uniqueInstructorIds = [
    ...new Set(courseDocuments.map((document) => document.instructorUserId.toString())),
  ];
  const instructorProfiles = await identityDomainInterface.getPublicProfilesByIds(
    uniqueInstructorIds
  );
  return courseDocuments.map((document) => mapDocumentToCourseView(document, instructorProfiles));
}

/** The catalog domain's business logic — the only thing catalog controllers may call. */
export const catalogService = {
  async createCourseForInstructor(
    instructorUserId: string,
    input: CreateCourseInput
  ): Promise<CourseView> {
    const createdCourse = await catalogRepository.createCourse(instructorUserId, input);
    const [courseView] = await attachInstructorProfiles([createdCourse]);
    if (courseView === undefined) {
      throw new ResourceNotFoundError('That course');
    }
    return courseView;
  },

  async getPaginatedCourseCatalog(
    query: CourseCatalogQuery
  ): Promise<PaginatedCourseCatalogView> {
    const { courses, totalCourseCount } = await catalogRepository.findCoursesForCatalog(query);
    return {
      courses: await attachInstructorProfiles(courses),
      totalCourseCount,
      page: query.page,
      pageSize: query.pageSize,
      totalPageCount: Math.max(1, Math.ceil(totalCourseCount / query.pageSize)),
    };
  },

  async getCourseById(courseId: string): Promise<CourseView> {
    const course = await catalogRepository.findCourseById(courseId);
    if (course === null) {
      throw new ResourceNotFoundError('That course');
    }
    const [courseView] = await attachInstructorProfiles([course]);
    if (courseView === undefined) {
      throw new ResourceNotFoundError('That course');
    }
    return courseView;
  },

  async getCoursesCreatedByInstructor(instructorUserId: string): Promise<readonly CourseView[]> {
    const courses = await catalogRepository.findCoursesByInstructorUserId(instructorUserId);
    return attachInstructorProfiles(courses);
  },

  async getCoursesByIds(courseIds: readonly string[]): Promise<readonly CourseView[]> {
    const courses = await catalogRepository.findCoursesByIds(courseIds);
    return attachInstructorProfiles(courses);
  },

  /**
   * Ownership check used by both update and delete. Kept in the service (not the
   * controller) so the rule cannot be forgotten at a new call site.
   */
  async assertCourseIsOwnedByUser(courseId: string, userId: string): Promise<CourseDocument> {
    const course = await catalogRepository.findCourseById(courseId);
    if (course === null) {
      throw new ResourceNotFoundError('That course');
    }
    if (course.instructorUserId.toString() !== userId) {
      throw new PermissionDeniedError('Only the instructor who created this course can change it.');
    }
    return course;
  },

  async updateCourseOwnedByInstructor(
    courseId: string,
    instructorUserId: string,
    input: UpdateCourseInput
  ): Promise<CourseView> {
    await this.assertCourseIsOwnedByUser(courseId, instructorUserId);
    const updatedCourse = await catalogRepository.updateCourseById(courseId, input);
    if (updatedCourse === null) {
      throw new ResourceNotFoundError('That course');
    }
    const [courseView] = await attachInstructorProfiles([updatedCourse]);
    if (courseView === undefined) {
      throw new ResourceNotFoundError('That course');
    }
    return courseView;
  },

  async deleteCourseOwnedByInstructor(
    courseId: string,
    instructorUserId: string
  ): Promise<void> {
    await this.assertCourseIsOwnedByUser(courseId, instructorUserId);
    const wasDeleted = await catalogRepository.deleteCourseById(courseId);
    if (!wasDeleted) {
      throw new ResourceNotFoundError('That course');
    }
  },

  /** Called by the learning domain when someone enrols or unenrols. */
  async adjustCourseEnrollmentCount(courseId: string, delta: number): Promise<void> {
    await catalogRepository.adjustEnrollmentCount(courseId, delta);
  },

  /** Called by the learning domain after a review is written, edited or removed. */
  async replaceCourseRatingSnapshot(
    courseId: string,
    snapshot: CourseRatingSnapshot
  ): Promise<void> {
    await catalogRepository.replaceRatingSnapshot(courseId, {
      averageRating: Number(snapshot.averageRating.toFixed(2)),
      reviewCount: snapshot.reviewCount,
    });
  },
};
