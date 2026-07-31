import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import type { ApiRequestError } from '../../../shared/api/apiClient';
import { identityApi } from '../api/identity.api';
import { useAuthentication } from './AuthenticationContext';
import type {
  AuthenticateUserPayload,
  AuthenticatedSession,
  ChangeUserPasswordPayload,
  RegisterUserAccountPayload,
  UpdateUserProfilePayload,
  UserAccount,
} from '../identity.types';

/**
 * Identity write operations. Each one folds its result back into the auth
 * context, so a component never has to remember to update the session itself.
 */

export function useRegisterUserAccount(): UseMutationResult<
  AuthenticatedSession,
  ApiRequestError,
  RegisterUserAccountPayload
> {
  const { beginSession } = useAuthentication();
  return useMutation<AuthenticatedSession, ApiRequestError, RegisterUserAccountPayload>({
    mutationFn: (payload) => identityApi.registerUserAccount(payload),
    onSuccess: beginSession,
  });
}

export function useAuthenticateUser(): UseMutationResult<
  AuthenticatedSession,
  ApiRequestError,
  AuthenticateUserPayload
> {
  const { beginSession } = useAuthentication();
  return useMutation<AuthenticatedSession, ApiRequestError, AuthenticateUserPayload>({
    mutationFn: (payload) => identityApi.authenticateUser(payload),
    onSuccess: beginSession,
  });
}

export function useUpdateCurrentUserProfile(): UseMutationResult<
  UserAccount,
  ApiRequestError,
  UpdateUserProfilePayload
> {
  const { replaceCurrentUser } = useAuthentication();
  return useMutation<UserAccount, ApiRequestError, UpdateUserProfilePayload>({
    mutationFn: (payload) => identityApi.updateCurrentUserProfile(payload),
    onSuccess: replaceCurrentUser,
  });
}

export function useChangeCurrentUserPassword(): UseMutationResult<
  { message: string },
  ApiRequestError,
  ChangeUserPasswordPayload
> {
  return useMutation<{ message: string }, ApiRequestError, ChangeUserPasswordPayload>({
    mutationFn: (payload) => identityApi.changeCurrentUserPassword(payload),
  });
}
