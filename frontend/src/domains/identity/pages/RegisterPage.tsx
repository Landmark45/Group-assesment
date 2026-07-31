import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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
  validateFullName,
  validateNewPassword,
  validateUsername,
  type FieldErrorMap,
} from '../../../shared/validation/formValidation';
import { AuthenticationPanel } from '../components/AuthenticationPanel';
import { useRegisterUserAccount } from '../hooks/useIdentityMutations';

const FooterNote = styled.p`
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const REGISTER_REASSURANCES = [
  'One account for both teaching and learning — no separate sign-up',
  'Publish your first course in about ten minutes',
  'Nothing is charged, and nothing is shared',
] as const;

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const registerUserAccount = useRegisterUserAccount();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  function handleSubmit(submitEvent: FormEvent<HTMLFormElement>): void {
    submitEvent.preventDefault();

    const clientSideErrors = collectFieldErrors({
      fullName: validateFullName(fullName),
      username: validateUsername(username),
      email: validateEmailAddress(emailAddress),
      password: validateNewPassword(password),
    });
    setFieldErrors(clientSideErrors);
    if (hasAnyFieldError(clientSideErrors)) {
      return;
    }

    registerUserAccount.mutate(
      {
        fullName: fullName.trim(),
        username: username.trim(),
        email: emailAddress.trim(),
        password,
      },
      {
        onSuccess: () => navigate('/dashboard', { replace: true }),
        onError: (requestError) => setFieldErrors(requestError.fieldErrors),
      }
    );
  }

  return (
    <AuthenticationPanel
      eyebrow="Join EduConnect"
      headline="Teach what you know. Learn what you want."
      body="One account does both. Browse the catalog as a student today and publish your own course whenever you are ready — there is no separate instructor application to fill in."
      reassurances={REGISTER_REASSURANCES}
      formHeading="Create your account"
      formSubheading="It takes about a minute."
    >
      <FormStack onSubmit={handleSubmit} noValidate>
        {registerUserAccount.isError &&
        !hasAnyFieldError(registerUserAccount.error.fieldErrors) ? (
          <FormLevelError role="alert">
            <span aria-hidden="true">⚠</span>
            {registerUserAccount.error.message}
          </FormLevelError>
        ) : null}

        <FormField label="Your name" errorMessage={fieldErrors['fullName']}>
          {(controlProps) => (
            <TextInput
              {...controlProps}
              name="fullName"
              autoComplete="name"
              placeholder="Amara Okonkwo"
              value={fullName}
              onChange={(changeEvent) => setFullName(changeEvent.target.value)}
            />
          )}
        </FormField>

        <FormField
          label="Username"
          errorMessage={fieldErrors['username']}
          helperText="This is how other learners will see you. Letters, numbers, . _ and - only."
        >
          {(controlProps) => (
            <TextInput
              {...controlProps}
              name="username"
              autoComplete="username"
              placeholder="amara_codes"
              value={username}
              onChange={(changeEvent) => setUsername(changeEvent.target.value)}
            />
          )}
        </FormField>

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

        <FormField
          label="Password"
          errorMessage={fieldErrors['password']}
          helperText="At least 8 characters, with a letter and a number."
        >
          {(controlProps) => (
            <TextInput
              {...controlProps}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Choose something memorable"
              value={password}
              onChange={(changeEvent) => setPassword(changeEvent.target.value)}
            />
          )}
        </FormField>

        <Button type="submit" $size="large" $isFullWidth disabled={registerUserAccount.isPending}>
          {registerUserAccount.isPending ? 'Setting things up…' : 'Create my account'}
        </Button>
      </FormStack>

      <FooterNote>
        Already have an account? <Link to="/login">Sign in</Link>
      </FooterNote>
    </AuthenticationPanel>
  );
}
