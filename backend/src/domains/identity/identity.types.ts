/**
 * The identity domain owns "who someone is": their credentials and the profile
 * they present to the rest of the platform. These are the shapes it speaks in;
 * no Mongoose document ever leaves the domain.
 */

/** The full view of an account — only ever returned to its owner. */
export interface UserAccountView {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly fullName: string;
  readonly biography: string;
  readonly profilePictureUrl: string;
  readonly createdAt: string;
}

/**
 * The trimmed view other domains and the public catalog are allowed to see.
 * This is deliberately narrow — the catalog needs an instructor's name, not
 * their email address.
 */
export interface PublicUserProfileView {
  readonly id: string;
  readonly username: string;
  readonly fullName: string;
  readonly profilePictureUrl: string;
}

export interface RegisterUserAccountInput {
  readonly email: string;
  readonly username: string;
  readonly fullName: string;
  readonly password: string;
}

export interface AuthenticateUserInput {
  readonly email: string;
  readonly password: string;
}

export interface UpdateUserProfileInput {
  readonly fullName?: string;
  readonly biography?: string;
  readonly profilePictureUrl?: string;
}

export interface ChangeUserPasswordInput {
  readonly currentPassword: string;
  readonly newPassword: string;
}

/** What a successful register/login hands back to the client. */
export interface AuthenticatedSessionView {
  readonly accessToken: string;
  readonly user: UserAccountView;
}
