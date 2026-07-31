import styled from 'styled-components';

import { Button } from '../../../shared/components/Button';
import { SelectInput, TextInput } from '../../../shared/components/FormField';
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

/**
 * The catalog's search and filter controls. It is a controlled component: it
 * owns no state of its own, so the URL stays the single source of truth for
 * "what am I looking at" and a filtered view is always shareable.
 */

const SearchBarShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.raised};
`;

const SearchInputRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const SearchTextInput = styled(TextInput)`
  padding-left: ${({ theme }) => theme.spacing.xxl};
  border-radius: ${({ theme }) => theme.radii.pill};
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: end;
`;

const FilterGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  text-transform: uppercase;
`;

const PriceRangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const PriceSeparator = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ResetRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

interface CourseSearchBarProps {
  readonly filters: CourseCatalogFilters;
  readonly onFiltersChange: (nextFilters: CourseCatalogFilters) => void;
}

export function CourseSearchBar({
  filters,
  onFiltersChange,
}: CourseSearchBarProps): JSX.Element {
  /** Any filter change resets to page 1 — staying on page 4 of a new result set is never what anyone wants. */
  function applyFilterChange(partialFilters: Partial<CourseCatalogFilters>): void {
    onFiltersChange({ ...filters, ...partialFilters, page: 1 });
  }

  const isAnyFilterActive =
    filters.searchTerm !== '' ||
    filters.category !== '' ||
    filters.difficultyLevel !== '' ||
    filters.minimumPrice !== '' ||
    filters.maximumPrice !== '' ||
    filters.sortBy !== DEFAULT_COURSE_CATALOG_FILTERS.sortBy;

  return (
    <SearchBarShell role="search">
      <SearchInputRow>
        <SearchIcon aria-hidden="true">⌕</SearchIcon>
        <SearchTextInput
          type="search"
          aria-label="Search courses"
          placeholder="What would you like to learn?"
          value={filters.searchTerm}
          onChange={(changeEvent) => applyFilterChange({ searchTerm: changeEvent.target.value })}
        />
      </SearchInputRow>

      <FilterRow>
        <FilterGroup>
          Category
          <SelectInput
            value={filters.category}
            onChange={(changeEvent) =>
              applyFilterChange({ category: changeEvent.target.value as CourseCategory | '' })
            }
          >
            <option value="">All categories</option>
            {COURSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectInput>
        </FilterGroup>

        <FilterGroup>
          Level
          <SelectInput
            value={filters.difficultyLevel}
            onChange={(changeEvent) =>
              applyFilterChange({
                difficultyLevel: changeEvent.target.value as CourseDifficultyLevel | '',
              })
            }
          >
            <option value="">Any level</option>
            {COURSE_DIFFICULTY_LEVELS.map((difficultyLevel) => (
              <option key={difficultyLevel} value={difficultyLevel}>
                {difficultyLevel}
              </option>
            ))}
          </SelectInput>
        </FilterGroup>

        <FilterGroup as="div">
          Price range
          <PriceRangeRow>
            <TextInput
              type="number"
              min={0}
              aria-label="Minimum price"
              placeholder="Min"
              value={filters.minimumPrice}
              onChange={(changeEvent) =>
                applyFilterChange({ minimumPrice: changeEvent.target.value })
              }
            />
            <PriceSeparator aria-hidden="true">–</PriceSeparator>
            <TextInput
              type="number"
              min={0}
              aria-label="Maximum price"
              placeholder="Max"
              value={filters.maximumPrice}
              onChange={(changeEvent) =>
                applyFilterChange({ maximumPrice: changeEvent.target.value })
              }
            />
          </PriceRangeRow>
        </FilterGroup>

        <FilterGroup>
          Sort by
          <SelectInput
            value={filters.sortBy}
            onChange={(changeEvent) =>
              applyFilterChange({ sortBy: changeEvent.target.value as CourseSortOption })
            }
          >
            {COURSE_SORT_OPTIONS.map((sortOption) => (
              <option key={sortOption.value} value={sortOption.value}>
                {sortOption.label}
              </option>
            ))}
          </SelectInput>
        </FilterGroup>
      </FilterRow>

      {isAnyFilterActive ? (
        <ResetRow>
          <Button
            type="button"
            $variant="ghost"
            $size="small"
            onClick={() => onFiltersChange(DEFAULT_COURSE_CATALOG_FILTERS)}
          >
            Clear all filters
          </Button>
        </ResetRow>
      ) : null}
    </SearchBarShell>
  );
}
