import { Link } from 'react-router-dom';
import styled from 'styled-components';

import {
  CourseGridLoadingState,
  EmptyState,
  ErrorState,
} from '../../../shared/components/AsyncStates';
import { Button } from '../../../shared/components/Button';
import {
  CourseGrid,
  LeadParagraph,
  PageContainer,
  PageHeading,
  SectionStack,
} from '../../../shared/components/Layout';
import { CourseCard } from '../components/CourseCard';
import { CourseSearchBar } from '../components/CourseSearchBar';
import { useCatalogFiltersFromUrl } from '../hooks/useCatalogFiltersFromUrl';
import { useCourseCatalogQuery } from '../hooks/useCatalogQueries';
import { DEFAULT_COURSE_CATALOG_FILTERS } from '../catalog.types';

const HeroSection = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xl} 0 ${theme.spacing.md}`};
`;

const HeroEyebrow = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
`;

const ResultSummaryRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ResultCount = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PaginationRow = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const PageIndicator = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export function CourseCatalogPage(): JSX.Element {
  const { draftFilters, appliedFilters, setFilters, goToPage } = useCatalogFiltersFromUrl();
  const catalogQuery = useCourseCatalogQuery(appliedFilters);

  const isFilteringSomething =
    appliedFilters.searchTerm !== '' ||
    appliedFilters.category !== '' ||
    appliedFilters.difficultyLevel !== '' ||
    appliedFilters.minimumPrice !== '' ||
    appliedFilters.maximumPrice !== '';

  return (
    <PageContainer>
      <SectionStack>
        <HeroSection>
          <HeroEyebrow>The catalog</HeroEyebrow>
          <PageHeading>Find something worth an evening.</PageHeading>
          <LeadParagraph>
            Every course here was written by one person who knows the subject, not assembled by a
            committee. Browse by category, filter by price, and read what other learners actually
            thought.
          </LeadParagraph>
        </HeroSection>

        <CourseSearchBar filters={draftFilters} onFiltersChange={setFilters} />

        {catalogQuery.isPending ? (
          <CourseGridLoadingState />
        ) : catalogQuery.isError ? (
          <ErrorState
            message={catalogQuery.error.message}
            onRetry={() => void catalogQuery.refetch()}
          />
        ) : catalogQuery.data.courses.length === 0 ? (
          isFilteringSomething ? (
            <EmptyState
              variant="search"
              headline="Nothing matched that"
              body="Try a broader search, or clear a filter or two — there may be something close by that you would like just as much."
              action={
                <Button
                  type="button"
                  $variant="secondary"
                  onClick={() => setFilters(DEFAULT_COURSE_CATALOG_FILTERS)}
                >
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              headline="The catalog is empty — for now"
              body="Nobody has published a course yet. If you know something worth teaching, this is a very good moment to be first."
              action={
                <Link to="/courses/new">
                  <Button type="button" as="span">
                    Publish the first course
                  </Button>
                </Link>
              }
            />
          )
        ) : (
          <>
            <ResultSummaryRow>
              <ResultCount>
                {catalogQuery.data.totalCourseCount}{' '}
                {catalogQuery.data.totalCourseCount === 1 ? 'course' : 'courses'}
                {isFilteringSomething ? ' matched' : ' available'}
              </ResultCount>
            </ResultSummaryRow>

            <CourseGrid>
              {catalogQuery.data.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </CourseGrid>

            {catalogQuery.data.totalPageCount > 1 ? (
              <PaginationRow aria-label="Catalog pages">
                <Button
                  type="button"
                  $variant="secondary"
                  $size="small"
                  disabled={catalogQuery.data.page <= 1}
                  onClick={() => goToPage(catalogQuery.data.page - 1)}
                >
                  ← Previous
                </Button>
                <PageIndicator>
                  Page {catalogQuery.data.page} of {catalogQuery.data.totalPageCount}
                </PageIndicator>
                <Button
                  type="button"
                  $variant="secondary"
                  $size="small"
                  disabled={catalogQuery.data.page >= catalogQuery.data.totalPageCount}
                  onClick={() => goToPage(catalogQuery.data.page + 1)}
                >
                  Next →
                </Button>
              </PaginationRow>
            ) : null}
          </>
        )}
      </SectionStack>
    </PageContainer>
  );
}
