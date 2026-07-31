import { useId, type ReactNode } from 'react';
import styled, { css } from 'styled-components';

/**
 * Form primitives. Every input in EduConnect is built from these, which is how
 * label association, error styling and helper text stay consistent without
 * anyone having to remember to add them.
 */

const controlBaseStyles = css<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid
    ${({ theme, $hasError = false }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition:
    border-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    box-shadow ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme, $hasError = false }) =>
      $hasError ? theme.colors.danger : theme.colors.borderStrong};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError = false }) =>
      $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.surfaceMuted};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
  }
`;

export const TextInput = styled.input<{ $hasError?: boolean }>`
  ${controlBaseStyles}
`;

export const TextAreaInput = styled.textarea<{ $hasError?: boolean }>`
  ${controlBaseStyles}
  min-height: 132px;
  resize: vertical;
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const SelectInput = styled.select<{ $hasError?: boolean }>`
  ${controlBaseStyles}
  cursor: pointer;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position:
    calc(100% - 20px) calc(50% + 2px),
    calc(100% - 14px) calc(50% + 2px);
  background-size: 6px 6px;
  background-repeat: no-repeat;
  padding-right: ${({ theme }) => theme.spacing.xxl};
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const FieldLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const OptionalMarker = styled.span`
  margin-left: ${({ theme }) => theme.spacing.xxs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const HelperText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

const ErrorText = styled.p`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.danger};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

interface FormFieldProps {
  readonly label: string;
  readonly errorMessage?: string | undefined;
  readonly helperText?: string;
  readonly isOptional?: boolean;
  /** Receives the generated id and the aria wiring — spread it onto the control. */
  readonly children: (controlProps: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
    $hasError: boolean;
  }) => ReactNode;
}

export function FormField({
  label,
  errorMessage,
  helperText,
  isOptional = false,
  children,
}: FormFieldProps): JSX.Element {
  const generatedId = useId();
  const controlId = `field-${generatedId}`;
  const messageId = `${controlId}-message`;
  const hasError = errorMessage !== undefined && errorMessage !== '';
  const hasMessage = hasError || helperText !== undefined;

  return (
    <FieldWrapper>
      <FieldLabel htmlFor={controlId}>
        {label}
        {isOptional ? <OptionalMarker>optional</OptionalMarker> : null}
      </FieldLabel>

      {children({
        id: controlId,
        'aria-invalid': hasError,
        'aria-describedby': hasMessage ? messageId : undefined,
        $hasError: hasError,
      })}

      {hasError ? (
        <ErrorText id={messageId} role="alert">
          <span aria-hidden="true">⚠</span>
          {errorMessage}
        </ErrorText>
      ) : helperText !== undefined ? (
        <HelperText id={messageId}>{helperText}</HelperText>
      ) : null}
    </FieldWrapper>
  );
}

/** A banner for errors that belong to the whole form rather than one field. */
export const FormLevelError = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.dangerSoft};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

export const FormSuccessNote = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.successSoft};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const FormStack = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;
