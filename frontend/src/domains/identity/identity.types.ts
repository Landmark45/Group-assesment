/** Mirrors the shapes the identity domain of the API returns. */

export interface UserAccount {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly fullName: string;
  readonly biography: string;
  readonly profilePictureUrl: string;
  readonly createdAt: string;
}

export interface PublicUserProfile {
  readonly id: string;
  readonly username: string;
  readonly fullName: string;
  readonly profilePictureUrl: string;
}

export interface AuthenticatedSession {
  readonly accessToken: string;
  readonly user: UserAccount;
}

export interface RegisterUserAccountPayload {
  readonly email: string;
  readonly username: string;
  readonly fullName: string;
  readonly password: string;
}

export interface AuthenticateUserPayload {
  readonly email: string;
  readonly password: string;
}

export interface UpdateUserProfilePayload {
  readonly fullName?: string;
  readonly biography?: string;
  readonly profilePictureUrl?: string;
}

export interface ChangeUserPasswordPayload {
  readonly currentPassword: string;
  readonly newPassword: string;
}
