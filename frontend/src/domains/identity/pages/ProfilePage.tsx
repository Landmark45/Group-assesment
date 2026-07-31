import { useEffect, useState, type FormEvent } from 'react';
import styled from 'styled-components';

import { Button } from '../../../shared/components/Button';
import {
  FormField,
  FormLevelError,
  FormStack,
  FormSuccessNote,
  TextAreaInput,
  TextInput,
} from '../../../shared/components/FormField';
import {
  Card,
  LeadParagraph,
  NarrowPageContainer,
  PageHeading,
  SectionStack,
  SubsectionHeading,
} from '../../../shared/components/Layout';
import {
  collectFieldErrors,
  hasAnyFieldError,
  validateFullName,
  validateNewPassword,
  validateOptionalUrl,
  type FieldErrorMap,
} from '../../../shared/validation/formValidation';
import { useAuthentication } from '../hooks/AuthenticationContext';
import {
  useChangeCurrentUserPassword,
  useUpdateCurrentUserProfile,
} from '../hooks/useIdentityMutations';

const AvatarPreviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const AvatarImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.surfaceSunken};
`;

const AvatarFallback = styled.div`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background-color: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryOnSoft};
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const AvatarMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AvatarName = styled.strong`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const CharacterCounter = styled.span`
  align-self: flex-end;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const BIOGRAPHY_MAX_LENGTH = 600;

export function ProfilePage(): JSX.Element {
  const { currentUser } = useAuthentication();
  const updateProfile = useUpdateCurrentUserProfile();
  const changePassword = useChangeCurrentUserPassword();

  const [fullName, setFullName] = useState(currentUser?.fullName ?? '');
  const [biography, setBiography] = useState(currentUser?.biography ?? '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(currentUser?.profilePictureUrl ?? '');
  const [profileFieldErrors, setProfileFieldErrors] = useState<FieldErrorMap>({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<FieldErrorMap>({});

  /**
   * The session restores asynchronously, so the form fields have to catch up
   * once `currentUser` arrives. Keyed on the account id rather than the whole
   * object so typing is never clobbered by an unrelated re-render.
   */
  useEffect(() => {
    if (currentUser === null) {
      return;
    }
    setFullName(currentUser.fullName);
    setBiography(currentUser.biography);
    setProfilePictureUrl(currentUser.profilePictureUrl);
  }, [currentUser?.id]);

  /** Clears the "saved" note after a few seconds so it does not linger forever. */
  useEffect(() => {
    if (!updateProfile.isSuccess) {
      return;
    }
    const resetTimerId = window.setTimeout(() => updateProfile.reset(), 4000);
    return () => window.clearTimeout(resetTimerId);
  }, [updateProfile.isSuccess]);

  useEffect(() => {
    if (!changePassword.isSuccess) {
      return;
    }
    const resetTimerId = window.setTimeout(() => changePassword.reset(), 4000);
    return () => window.clearTimeout(resetTimerId);
  }, [changePassword.isSuccess]);

  function handleProfileSubmit(submitEvent: FormEvent<HTMLFormElement>): void {
    submitEvent.preventDefault();

    const clientSideErrors = collectFieldErrors({
      fullName: validateFullName(fullName),
      profilePictureUrl: validateOptionalUrl(profilePictureUrl),
      biography:
        biography.length > BIOGRAPHY_MAX_LENGTH
          ? `Your bio can be at most ${BIOGRAPHY_MAX_LENGTH} characters.`
          : undefined,
    });
    setProfileFieldErrors(clientSideErrors);
    if (hasAnyFieldError(clientSideErrors)) {
      return;
    }

    updateProfile.mutate(
      {
        fullName: fullName.trim(),
        biography: biography.trim(),
        profilePictureUrl: profilePictureUrl.trim(),
      },
      { onError: (requestError) => setProfileFieldErrors(requestError.fieldErrors) }
    );
  }

  function handlePasswordSubmit(submitEvent: FormEvent<HTMLFormElement>): void {
    submitEvent.preventDefault();

    const clientSideErrors = collectFieldErrors({
      currentPassword: currentPassword === '' ? 'Your current password is required.' : undefined,
      newPassword: validateNewPassword(newPassword),
      confirmNewPassword:
        newPassword !== confirmNewPassword ? 'These two passwords do not match.' : undefined,
    });
    setPasswordFieldErrors(clientSideErrors);
    if (hasAnyFieldError(clientSideErrors)) {
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
          setPasswordFieldErrors({});
        },
        onError: (requestError) => setPasswordFieldErrors(requestError.fieldErrors),
      }
    );
  }

  const initials = (currentUser?.fullName ?? '?')
    .split(' ')
    .filter((namePart) => namePart !== '')
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <NarrowPageContainer>
      <SectionStack>
        <div>
          <PageHeading>Your profile</PageHeading>
          <LeadParagraph>
            This is what learners see next to the courses you publish and the reviews you write.
          </LeadParagraph>
        </div>

        <Card>
          <SectionStack $gap="16px">
            <AvatarPreviewRow>
              {profilePictureUrl.trim() !== '' ? (
                <AvatarImage src={profilePictureUrl} alt="" />
              ) : (
                <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
              )}
              <AvatarMeta>
                <AvatarName>{fullName === '' ? 'Your name' : fullName}</AvatarName>
                <span>@{currentUser?.username ?? 'username'}</span>
                <span>{currentUser?.email ?? ''}</span>
              </AvatarMeta>
            </AvatarPreviewRow>

            <FormStack onSubmit={handleProfileSubmit} noValidate>
              {updateProfile.isError && !hasAnyFieldError(updateProfile.error.fieldErrors) ? (
                <FormLevelError role="alert">
                  <span aria-hidden="true">⚠</span>
                  {updateProfile.error.message}
                </FormLevelError>
              ) : null}

              {updateProfile.isSuccess ? (
                <FormSuccessNote role="status">
                  <span aria-hidden="true">✓</span>
                  Saved. Your profile is up to date.
                </FormSuccessNote>
              ) : null}

              <FormField label="Display name" errorMessage={profileFieldErrors['fullName']}>
                {(controlProps) => (
                  <TextInput
                    {...controlProps}
                    name="fullName"
                    autoComplete="name"
                    value={fullName}
                    onChange={(changeEvent) => setFullName(changeEvent.target.value)}
                  />
                )}
              </FormField>

              <FormField
                label="Profile picture link"
                errorMessage={profileFieldErrors['profilePictureUrl']}
                helperText="Paste a link to an image. Leave it empty to use your initials."
                isOptional
              >
                {(controlProps) => (
                  <TextInput
                    {...controlProps}
                    name="profilePictureUrl"
                    inputMode="url"
                    placeholder="https://…"
                    value={profilePictureUrl}
                    onChange={(changeEvent) => setProfilePictureUrl(changeEvent.target.value)}
                  />
                )}
              </FormField>

              <FormField
                label="About you"
                errorMessage={profileFieldErrors['biography']}
                helperText="A couple of sentences on what you teach or what you are learning."
                isOptional
              >
                {(controlProps) => (
                  <TextAreaInput
                    {...controlProps}
                    name="biography"
                    maxLength={BIOGRAPHY_MAX_LENGTH}
                    value={biography}
                    onChange={(changeEvent) => setBiography(changeEvent.target.value)}
                  />
                )}
              </FormField>
              <CharacterCounter>
                {biography.length} / {BIOGRAPHY_MAX_LENGTH}
              </CharacterCounter>

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save profile'}
              </Button>
            </FormStack>
          </SectionStack>
        </Card>

        <Card>
          <SectionStack $gap="16px">
            <div>
              <SubsectionHeading>Change your password</SubsectionHeading>
              <p style={{ marginTop: 4, color: 'inherit', opacity: 0.7, fontSize: '0.9375rem' }}>
                We will ask for your current password first, just to be sure it is you.
              </p>
            </div>

            <FormStack onSubmit={handlePasswordSubmit} noValidate>
              {changePassword.isError && !hasAnyFieldError(changePassword.error.fieldErrors) ? (
                <FormLevelError role="alert">
                  <span aria-hidden="true">⚠</span>
                  {changePassword.error.message}
                </FormLevelError>
              ) : null}

              {changePassword.isSuccess ? (
                <FormSuccessNote role="status">
                  <span aria-hidden="true">✓</span>
                  Your password has been changed.
                </FormSuccessNote>
              ) : null}

              <FormField
                label="Current password"
                errorMessage={passwordFieldErrors['currentPassword']}
              >
                {(controlProps) => (
                  <TextInput
                    {...controlProps}
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(changeEvent) => setCurrentPassword(changeEvent.target.value)}
                  />
                )}
              </FormField>

              <FormField
                label="New password"
                errorMessage={passwordFieldErrors['newPassword']}
                helperText="At least 8 characters, with a letter and a number."
              >
                {(controlProps) => (
                  <TextInput
                    {...controlProps}
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(changeEvent) => setNewPassword(changeEvent.target.value)}
                  />
                )}
              </FormField>

              <FormField
                label="Confirm new password"
                errorMessage={passwordFieldErrors['confirmNewPassword']}
              >
                {(controlProps) => (
                  <TextInput
                    {...controlProps}
                    type="password"
                    name="confirmNewPassword"
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(changeEvent) => setConfirmNewPassword(changeEvent.target.value)}
                  />
                )}
              </FormField>

              <Button type="submit" $variant="secondary" disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Updating…' : 'Update password'}
              </Button>
            </FormStack>
          </SectionStack>
        </Card>
      </SectionStack>
    </NarrowPageContainer>
  );
}
