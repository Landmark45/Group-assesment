import { catalogService } from './catalog.service';
import type { CourseRatingSnapshot, CourseView } from './catalog.types';

/**
 * The catalog domain's published contract.
 *
 * The learning domain needs three things from the catalog and nothing else:
 * to look a course up, to nudge its enrollment counter, and to hand back a
 * fresh rating snapshot after a review changes. Everything else — the course
 * model, the repository, the ownership rules — stays private to the catalog.
 *
 * Deliberately narrow: if learning ever needs a fourth capability, that should
 * be a considered addition to this file, not an import of `catalog.model`.
 */
export interface CatalogDomainInterface {
  getCourseById(courseId: string): Promise<CourseView>;
  getCoursesByIds(courseIds: readonly string[]): Promise<readonly CourseView[]>;
  adjustCourseEnrollmentCount(courseId: string, delta: number): Promise<void>;
  replaceCourseRatingSnapshot(courseId: string, snapshot: CourseRatingSnapshot): Promise<void>;
}

export const catalogDomainInterface: CatalogDomainInterface = {
  getCourseById: (courseId) => catalogService.getCourseById(courseId),
  getCoursesByIds: (courseIds) => catalogService.getCoursesByIds(courseIds),
  adjustCourseEnrollmentCount: (courseId, delta) =>
    catalogService.adjustCourseEnrollmentCount(courseId, delta),
  replaceCourseRatingSnapshot: (courseId, snapshot) =>
    catalogService.replaceCourseRatingSnapshot(courseId, snapshot),
};

export type { CourseRatingSnapshot, CourseView };
