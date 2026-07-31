import type { CourseCatalogFilters } from '../../domains/catalog/catalog.types';

/**
 * Every React Query cache key in one place, so invalidating after a mutation is
 * a matter of picking a key rather than remembering a string.
 */
export const queryKeys = {
  currentUserAccount: ['identity', 'currentUser'] as const,

  courseCatalog: (filters: CourseCatalogFilters) => ['catalog', 'list', filters] as const,
  courseDetail: (courseId: string) => ['catalog', 'detail', courseId] as const,
  coursesCreatedByMe: ['catalog', 'mine'] as const,

  myEnrollments: ['learning', 'enrollments'] as const,
  courseReviews: (courseId: string) => ['learning', 'reviews', courseId] as const,
  myRelationshipToCourse: (courseId: string) =>
    ['learning', 'relationship', courseId] as const,
} as const;
