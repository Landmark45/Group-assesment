import styled from 'styled-components';

/** Layout and surface primitives shared by every screen. */

export const PageContainer = styled.main`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing.xxxl}`};

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md} ${theme.spacing.xxl}`};
  }
`;

export const NarrowPageContainer = styled(PageContainer)`
  max-width: ${({ theme }) => theme.layout.narrowMaxWidth};
`;

export const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.raised};
  padding: ${({ theme }) => theme.spacing.lg};
`;

/** The hover-lift interaction that makes the catalog feel alive. */
export const InteractiveCard = styled(Card)`
  cursor: pointer;
  transition:
    transform ${({ theme }) => theme.motion.normal} ${({ theme }) => theme.motion.easeOut},
    box-shadow ${({ theme }) => theme.motion.normal} ${({ theme }) => theme.motion.easeOut};

  &:hover,
  &:focus-within {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lifted};
  }
`;

export const SectionStack = styled.div<{ $gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme, $gap }) => $gap ?? theme.spacing.lg};
`;

export const RowStack = styled.div<{ $gap?: string; $wrap?: boolean; $align?: string }>`
  display: flex;
  align-items: ${({ $align = 'center' }) => $align};
  flex-wrap: ${({ $wrap = true }) => ($wrap ? 'wrap' : 'nowrap')};
  gap: ${({ theme, $gap }) => $gap ?? theme.spacing.sm};
`;

export const PageHeading = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.display};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  }
`;

export const SectionHeading = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
`;

export const SubsectionHeading = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
`;

export const LeadParagraph = styled.p`
  max-width: ${({ theme }) => theme.layout.readingMaxWidth};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

export const MutedText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const Divider = styled.hr`
  height: 1px;
  border: none;
  margin: 0;
  background-color: ${({ theme }) => theme.colors.border};
`;

export const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;
