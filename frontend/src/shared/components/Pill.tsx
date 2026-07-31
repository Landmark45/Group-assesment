import styled from 'styled-components';

import { resolveCategoryColors } from '../../theme/educonnect.theme';

/** The small rounded label used for categories, difficulty and status. */
export const Pill = styled.span<{ $background?: string; $foreground?: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme, $background }) => $background ?? theme.colors.surfaceMuted};
  color: ${({ theme, $foreground }) => $foreground ?? theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  text-transform: uppercase;
  white-space: nowrap;
`;

/** A category pill that colours itself from the theme's per-category palette. */
export const CategoryPill = styled(Pill).attrs<{ $category: string }>(({ theme, $category }) => {
  const categoryColors = resolveCategoryColors(theme, $category);
  return { $background: categoryColors.background, $foreground: categoryColors.foreground };
})<{ $category: string }>``;

/** The mustard price badge. Free courses get their own quiet green treatment. */
export const PriceBadge = styled.span<{ $isFree?: boolean }>`
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme, $isFree = false }) =>
    $isFree ? theme.colors.successSoft : theme.colors.accentSoft};
  color: ${({ theme, $isFree = false }) =>
    $isFree ? theme.colors.success : theme.colors.accentOnSoft};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  white-space: nowrap;
`;

export function formatCoursePrice(priceInUnitedStatesDollars: number): string {
  if (priceInUnitedStatesDollars === 0) {
    return 'Free';
  }
  return `$${priceInUnitedStatesDollars.toFixed(priceInUnitedStatesDollars % 1 === 0 ? 0 : 2)}`;
}
