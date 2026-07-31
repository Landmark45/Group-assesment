import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonStyleProps {
  readonly $variant?: ButtonVariant;
  readonly $size?: ButtonSize;
  readonly $isFullWidth?: boolean;
}

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textOnPrimary};
    box-shadow: ${({ theme }) => theme.shadows.subtle};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryHover};
      box-shadow: ${({ theme }) => theme.shadows.raised};
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryActive};
      transform: translateY(0);
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.borderStrong};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.surfaceMuted};
      border-color: ${({ theme }) => theme.colors.secondary};
      color: ${({ theme }) => theme.colors.secondaryOnSoft};
      transform: translateY(-1px);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.surfaceMuted};
      color: ${({ theme }) => theme.colors.textPrimary};
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.dangerSoft};
    color: ${({ theme }) => theme.colors.danger};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.danger};
      color: ${({ theme }) => theme.colors.textOnPrimary};
      transform: translateY(-1px);
    }
  `,
} as const;

const sizeStyles = {
  small: css`
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  `,
  medium: css`
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  `,
  large: css`
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  `,
} as const;

/**
 * The one button in the application. Variants exist so a screen can have a
 * clear visual hierarchy — one primary action, everything else quieter.
 */
export const Button = styled.button<ButtonStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  width: ${({ $isFullWidth = false }) => ($isFullWidth ? '100%' : 'auto')};
  border: 1.5px solid transparent;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-family: inherit;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    box-shadow ${({ theme }) => theme.motion.normal} ${({ theme }) => theme.motion.easeOut},
    transform ${({ theme }) => theme.motion.normal} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    border-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};

  ${({ $size = 'medium' }) => sizeStyles[$size]}
  ${({ $variant = 'primary' }) => variantStyles[$variant]}

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

/** Same look, but rendered as a router link. */
export const ButtonLikeLink = styled(Button).attrs({ as: 'span' })``;
