import type { PublicUserProfileView } from '../identity/identity.interface';

/** The fixed set of categories the catalog is organised around. */
export const COURSE_CATEGORIES = ['Programming', 'Design', 'Marketing', 'Business', 'Data'] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export const COURSE_DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

export type CourseDifficultyLevel = (typeof COURSE_DIFFICULTY_LEVELS)[number];

export interface CourseModuleView {
  readonly title: string;
  readonly summary: string;
  readonly estimatedMinutes: number;
}

/**
 * The catalog's public representation of a course. Ratings live in the learning
 * domain, so the catalog stores only a denormalised snapshot that learning
 * refreshes whenever a review is written.
 */
export interface CourseView {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: CourseCategory;
  readonly difficultyLevel: CourseDifficultyLevel;
  readonly priceInUnitedStatesDollars: number;
  readonly thumbnailImageUrl: string;
  readonly modules: readonly CourseModuleView[];
  readonly instructor: PublicUserProfileView | null;
  readonly instructorUserId: string;
  readonly enrollmentCount: number;
  readonly averageRating: number;
  readonly reviewCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCourseInput {
  readonly title: string;
  readonly description: string;
  readonly category: CourseCategory;
  readonly difficultyLevel: CourseDifficultyLevel;
  readonly priceInUnitedStatesDollars: number;
  readonly thumbnailImageUrl?: string;
  readonly modules: readonly CourseModuleView[];
}

export type UpdateCourseInput = Partial<CreateCourseInput>;

export interface CourseCatalogQuery {
  readonly searchTerm?: string;
  readonly category?: CourseCategory;
  readonly difficultyLevel?: CourseDifficultyLevel;
  readonly minimumPrice?: number;
  readonly maximumPrice?: number;
  readonly sortBy?: 'newest' | 'priceAscending' | 'priceDescending' | 'topRated';
  readonly page: number;
  readonly pageSize: number;
}

export interface PaginatedCourseCatalogView {
  readonly courses: readonly CourseView[];
  readonly totalCourseCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPageCount: number;
}

/** The snapshot the learning domain pushes back after a review is written. */
export interface CourseRatingSnapshot {
  readonly averageRating: number;
  readonly reviewCount: number;
}
