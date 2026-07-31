import type { ReactNode } from 'react';
import styled from 'styled-components';

/**
 * The shared frame for sign in and sign up: a warm welcome column beside the
 * form, so the first screen a visitor sees is inviting rather than transactional.
 */

const PanelGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};
  align-items: center;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg} ${theme.spacing.xxxl}`};

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const WelcomeColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    text-align: center;
    align-items: center;
  }
`;

const WelcomeEyebrow = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
`;

const WelcomeHeadline = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.hero};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.typography.fontSize.display};
  }
`;

const WelcomeBody = styled.p`
  max-width: 44ch;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const ReassuranceList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  padding: 0;
  list-style: none;
`;

const ReassuranceItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &::before {
    content: '✦';
    color: ${({ theme }) => theme.colors.accent};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: 1.3;
  }
`;

const FormCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lifted};
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const FormCardHeading = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
`;

const FormCardSubheading = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

interface AuthenticationPanelProps {
  readonly eyebrow: string;
  readonly headline: string;
  readonly body: string;
  readonly reassurances: readonly string[];
  readonly formHeading: string;
  readonly formSubheading: string;
  readonly children: ReactNode;
}

export function AuthenticationPanel({
  eyebrow,
  headline,
  body,
  reassurances,
  formHeading,
  formSubheading,
  children,
}: AuthenticationPanelProps): JSX.Element {
  return (
    <PanelGrid>
      <WelcomeColumn>
        <WelcomeEyebrow>{eyebrow}</WelcomeEyebrow>
        <WelcomeHeadline>{headline}</WelcomeHeadline>
        <WelcomeBody>{body}</WelcomeBody>
        <ReassuranceList>
          {reassurances.map((reassurance) => (
            <ReassuranceItem key={reassurance}>{reassurance}</ReassuranceItem>
          ))}
        </ReassuranceList>
      </WelcomeColumn>

      <FormCard>
        <FormCardHeading>{formHeading}</FormCardHeading>
        <FormCardSubheading>{formSubheading}</FormCardSubheading>
        {children}
      </FormCard>
    </PanelGrid>
  );
}
