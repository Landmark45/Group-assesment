import type { PublicUserProfile } from '../identity/identity.types';

export const COURSE_CATEGORIES = ['Programming', 'Design', 'Marketing', 'Business', 'Data'] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export const COURSE_DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type CourseDifficultyLevel = (typeof COURSE_DIFFICULTY_LEVELS)[number];

export const COURSE_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'topRated', label: 'Highest rated' },
  { value: 'priceAscending', label: 'Price: low to high' },
  { value: 'priceDescending', label: 'Price: high to low' },
] as const;

export type CourseSortOption = (typeof COURSE_SORT_OPTIONS)[number]['value'];

export interface CourseModule {
  readonly title: string;
  readonly summary: string;
  readonly estimatedMinutes: number;
}

export interface Course {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: CourseCategory;
  readonly difficultyLevel: CourseDifficultyLevel;
  readonly priceInUnitedStatesDollars: number;
  readonly thumbnailImageUrl: string;
  readonly modules: readonly CourseModule[];
  readonly instructor: PublicUserProfile | null;
  readonly instructorUserId: string;
  readonly enrollmentCount: number;
  readonly averageRating: number;
  readonly reviewCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** The filter state the catalog page owns and syncs into the URL. */
export interface CourseCatalogFilters {
  readonly searchTerm: string;
  readonly category: CourseCategory | '';
  readonly difficultyLevel: CourseDifficultyLevel | '';
  readonly minimumPrice: string;
  readonly maximumPrice: string;
  readonly sortBy: CourseSortOption;
  readonly page: number;
}

export const DEFAULT_COURSE_CATALOG_FILTERS: CourseCatalogFilters = {
  searchTerm: '',
  category: '',
  difficultyLevel: '',
  minimumPrice: '',
  maximumPrice: '',
  sortBy: 'newest',
  page: 1,
};

export interface PaginatedCourseCatalog {
  readonly courses: readonly Course[];
  readonly totalCourseCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPageCount: number;
}

export interface CourseFormPayload {
  readonly title: string;
  readonly description: string;
  readonly category: CourseCategory;
  readonly difficultyLevel: CourseDifficultyLevel;
  readonly priceInUnitedStatesDollars: number;
  readonly thumbnailImageUrl: string;
  readonly modules: readonly CourseModule[];
}
