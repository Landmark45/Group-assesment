import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { readRedirectDestination } from '../../../app/ProtectedRoute';
import { Button } from '../../../shared/components/Button';
import {
  FormField,
  FormLevelError,
  FormStack,
  TextInput,
} from '../../../shared/components/FormField';
import {
  collectFieldErrors,
  hasAnyFieldError,
  validateEmailAddress,
  type FieldErrorMap,
} from '../../../shared/validation/formValidation';
import { AuthenticationPanel } from '../components/AuthenticationPanel';
import { useAuthenticateUser } from '../hooks/useIdentityMutations';

const SIGN_IN_REASSURANCES = [
  'Everything you have enrolled in, waiting where you left it',
  'Your own courses, ready to edit whenever inspiration strikes',
  'No algorithms deciding what you should want to learn',
] as const;

const FooterNote = styled.p`
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DemoHint = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.accentSoft};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.accentOnSoft};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  text-align: center;
`;

export function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticateUser = useAuthenticateUser();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  // Where the route guard wanted to send us before it bounced us here. Read
  // through the same validated helper GuestOnlyRoute uses, so the two agree.
  const redirectTo = readRedirectDestination(location.state) ?? '/dashboard';

  function handleSubmit(submitEvent: FormEvent<HTMLFormElement>): void {
    submitEvent.preventDefault();

    const clientSideErrors = collectFieldErrors({
      email: validateEmailAddress(emailAddress),
      password: password === '' ? 'A password is required.' : undefined,
    });
    setFieldErrors(clientSideErrors);
    if (hasAnyFieldError(clientSideErrors)) {
      return;
    }

    authenticateUser.mutate(
      { email: emailAddress.trim(), password },
      {
        onSuccess: () => navigate(redirectTo, { replace: true }),
        onError: (requestError) => setFieldErrors(requestError.fieldErrors),
      }
    );
  }

  return (
    <AuthenticationPanel
      eyebrow="Welcome back"
      headline="Good to see you again."
      body="Pick up where you left off, or go and find the next thing you have been meaning to learn."
      reassurances={SIGN_IN_REASSURANCES}
      formHeading="Sign in"
      formSubheading="Use the email address you signed up with."
    >
      <FormStack onSubmit={handleSubmit} noValidate>
        {authenticateUser.isError && !hasAnyFieldError(authenticateUser.error.fieldErrors) ? (
          <FormLevelError role="alert">
            <span aria-hidden="true">⚠</span>
            {authenticateUser.error.message}
          </FormLevelError>
        ) : null}

        <FormField label="Email address" errorMessage={fieldErrors['email']}>
          {(controlProps) => (
            <TextInput
              {...controlProps}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={emailAddress}
              onChange={(changeEvent) => setEmailAddress(changeEvent.target.value)}
            />
          )}
        </FormField>

        <FormField label="Password" errorMessage={fieldErrors['password']}>
          {(controlProps) => (
            <TextInput
              {...controlProps}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(changeEvent) => setPassword(changeEvent.target.value)}
            />
          )}
        </FormField>

        <Button type="submit" $size="large" $isFullWidth disabled={authenticateUser.isPending}>
          {authenticateUser.isPending ? 'Signing you in…' : 'Sign in'}
        </Button>
      </FormStack>

      <FooterNote>
        New to EduConnect? <Link to="/register">Create an account</Link>
      </FooterNote>

      <DemoHint>
        Running the seed script? Try <strong>amara@educonnect.dev</strong> with the password{' '}
        <strong>educonnect123</strong>.
      </DemoHint>
    </AuthenticationPanel>
  );
}
