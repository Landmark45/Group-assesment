import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  COURSE_CATEGORIES,
  COURSE_DIFFICULTY_LEVELS,
  COURSE_SORT_OPTIONS,
  DEFAULT_COURSE_CATALOG_FILTERS,
  type CourseCatalogFilters,
  type CourseCategory,
  type CourseDifficultyLevel,
  type CourseSortOption,
} from '../catalog.types';

const SEARCH_DEBOUNCE_MILLISECONDS = 320;

function readFiltersFromSearchParams(searchParams: URLSearchParams): CourseCatalogFilters {
  const rawCategory = searchParams.get('category') ?? '';
  const rawDifficulty = searchParams.get('level') ?? '';
  const rawSortBy = searchParams.get('sort') ?? DEFAULT_COURSE_CATALOG_FILTERS.sortBy;
  const rawPage = Number.parseInt(searchParams.get('page') ?? '1', 10);

  return {
    searchTerm: searchParams.get('q') ?? '',
    category: (COURSE_CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as CourseCategory)
      : '',
    difficultyLevel: (COURSE_DIFFICULTY_LEVELS as readonly string[]).includes(rawDifficulty)
      ? (rawDifficulty as CourseDifficultyLevel)
      : '',
    minimumPrice: searchParams.get('minPrice') ?? '',
    maximumPrice: searchParams.get('maxPrice') ?? '',
    sortBy: COURSE_SORT_OPTIONS.some((sortOption) => sortOption.value === rawSortBy)
      ? (rawSortBy as CourseSortOption)
      : DEFAULT_COURSE_CATALOG_FILTERS.sortBy,
    page: Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage,
  };
}

function writeFiltersToSearchParams(filters: CourseCatalogFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (filters.searchTerm.trim() !== '') {
    searchParams.set('q', filters.searchTerm.trim());
  }
  if (filters.category !== '') {
    searchParams.set('category', filters.category);
  }
  if (filters.difficultyLevel !== '') {
    searchParams.set('level', filters.difficultyLevel);
  }
  if (filters.minimumPrice !== '') {
    searchParams.set('minPrice', filters.minimumPrice);
  }
  if (filters.maximumPrice !== '') {
    searchParams.set('maxPrice', filters.maximumPrice);
  }
  if (filters.sortBy !== DEFAULT_COURSE_CATALOG_FILTERS.sortBy) {
    searchParams.set('sort', filters.sortBy);
  }
  if (filters.page > 1) {
    searchParams.set('page', String(filters.page));
  }
  return searchParams;
}

interface CatalogFiltersController {
  /** What the controls should display — updates on every keystroke. */
  readonly draftFilters: CourseCatalogFilters;
  /** What the query should use — the search term lags by a debounce interval. */
  readonly appliedFilters: CourseCatalogFilters;
  readonly setFilters: (nextFilters: CourseCatalogFilters) => void;
  readonly goToPage: (nextPage: number) => void;
}

/**
 * Keeps the catalog's filters in the URL so a filtered view can be bookmarked
 * and shared, while debouncing the free-text search so typing does not fire a
 * request per keystroke.
 *
 * The debounce timer is cleared on every change and on unmount — without that
 * cleanup, a pending timeout would fire after the user has navigated away.
 */
export function useCatalogFiltersFromUrl(): CatalogFiltersController {
  const [searchParams, setSearchParams] = useSearchParams();

  const draftFilters = useMemo(
    () => readFiltersFromSearchParams(searchParams),
    [searchParams]
  );

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(draftFilters.searchTerm);

  useEffect(() => {
    const debounceTimerId = window.setTimeout(() => {
      setDebouncedSearchTerm(draftFilters.searchTerm);
    }, SEARCH_DEBOUNCE_MILLISECONDS);

    return () => window.clearTimeout(debounceTimerId);
  }, [draftFilters.searchTerm]);

  const setFilters = useCallback(
    (nextFilters: CourseCatalogFilters): void => {
      // `replace` keeps the back button useful: typing in the search box should
      // not leave one history entry per character.
      setSearchParams(writeFiltersToSearchParams(nextFilters), { replace: true });
    },
    [setSearchParams]
  );

  const goToPage = useCallback(
    (nextPage: number): void => {
      setSearchParams(writeFiltersToSearchParams({ ...draftFilters, page: nextPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [draftFilters, setSearchParams]
  );

  const appliedFilters = useMemo<CourseCatalogFilters>(
    () => ({ ...draftFilters, searchTerm: debouncedSearchTerm }),
    [draftFilters, debouncedSearchTerm]
  );

  return { draftFilters, appliedFilters, setFilters, goToPage };
}
