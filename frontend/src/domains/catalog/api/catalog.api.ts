import { requestFromApi } from '../../../shared/api/apiClient';
import type {
  Course,
  CourseCatalogFilters,
  CourseFormPayload,
  PaginatedCourseCatalog,
} from '../catalog.types';

function buildCatalogSearchParams(
  filters: CourseCatalogFilters
): Record<string, string | number | undefined> {
  return {
    searchTerm: filters.searchTerm.trim() === '' ? undefined : filters.searchTerm.trim(),
    category: filters.category === '' ? undefined : filters.category,
    difficultyLevel: filters.difficultyLevel === '' ? undefined : filters.difficultyLevel,
    minimumPrice: filters.minimumPrice === '' ? undefined : filters.minimumPrice,
    maximumPrice: filters.maximumPrice === '' ? undefined : filters.maximumPrice,
    sortBy: filters.sortBy,
    page: filters.page,
    pageSize: 12,
  };
}

export const catalogApi = {
  fetchCourseCatalog(
    filters: CourseCatalogFilters,
    signal?: AbortSignal
  ): Promise<PaginatedCourseCatalog> {
    return requestFromApi<PaginatedCourseCatalog>('/courses', {
      searchParams: buildCatalogSearchParams(filters),
      ...(signal !== undefined ? { signal } : {}),
    });
  },

  fetchCourseById(courseId: string, signal?: AbortSignal): Promise<Course> {
    return requestFromApi<Course>(`/courses/${courseId}`, signal !== undefined ? { signal } : {});
  },

  fetchCoursesCreatedByMe(signal?: AbortSignal): Promise<{ courses: readonly Course[] }> {
    return requestFromApi<{ courses: readonly Course[] }>(
      '/courses/mine',
      signal !== undefined ? { signal } : {}
    );
  },

  createCourse(payload: CourseFormPayload): Promise<Course> {
    return requestFromApi<Course>('/courses', { method: 'POST', body: payload });
  },

  updateCourse(courseId: string, payload: CourseFormPayload): Promise<Course> {
    return requestFromApi<Course>(`/courses/${courseId}`, { method: 'PUT', body: payload });
  },

  deleteCourse(courseId: string): Promise<{ message: string }> {
    return requestFromApi<{ message: string }>(`/courses/${courseId}`, { method: 'DELETE' });
  },
};
