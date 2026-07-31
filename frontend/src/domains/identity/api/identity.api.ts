import { requestFromApi } from '../../../shared/api/apiClient';
import type {
  AuthenticateUserPayload,
  AuthenticatedSession,
  ChangeUserPasswordPayload,
  RegisterUserAccountPayload,
  UpdateUserProfilePayload,
  UserAccount,
} from '../identity.types';

/** Every identity endpoint, in one small module. Components never call these directly — hooks do. */
export const identityApi = {
  registerUserAccount(payload: RegisterUserAccountPayload): Promise<AuthenticatedSession> {
    return requestFromApi<AuthenticatedSession>('/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  authenticateUser(payload: AuthenticateUserPayload): Promise<AuthenticatedSession> {
    return requestFromApi<AuthenticatedSession>('/auth/login', { method: 'POST', body: payload });
  },

  fetchCurrentUserAccount(signal?: AbortSignal): Promise<UserAccount> {
    return requestFromApi<UserAccount>('/auth/me', signal !== undefined ? { signal } : {});
  },

  updateCurrentUserProfile(payload: UpdateUserProfilePayload): Promise<UserAccount> {
    return requestFromApi<UserAccount>('/profile', { method: 'PUT', body: payload });
  },

  changeCurrentUserPassword(payload: ChangeUserPasswordPayload): Promise<{ message: string }> {
    return requestFromApi<{ message: string }>('/profile/password', {
      method: 'PUT',
      body: payload,
    });
  },
};
