import bcryptjs from 'bcryptjs';

import {
  AuthenticationRequiredError,
  InvalidInputError,
  ResourceConflictError,
  ResourceNotFoundError,
} from '../../shared/application.errors';
import { issueAccessTokenForUser } from '../../shared/authentication.middleware';
import { identityRepository } from './identity.repository';
import type { UserAccountDocument } from './identity.model';
import type {
  AuthenticateUserInput,
  AuthenticatedSessionView,
  ChangeUserPasswordInput,
  PublicUserProfileView,
  RegisterUserAccountInput,
  UpdateUserProfileInput,
  UserAccountView,
} from './identity.types';

const PASSWORD_HASH_SALT_ROUNDS = 12;

function mapDocumentToUserAccountView(document: UserAccountDocument): UserAccountView {
  return {
    id: document.id as string,
    email: document.email,
    username: document.username,
    fullName: document.fullName,
    biography: document.biography,
    profilePictureUrl: document.profilePictureUrl,
    createdAt: document.createdAt.toISOString(),
  };
}

function mapDocumentToPublicProfileView(document: UserAccountDocument): PublicUserProfileView {
  return {
    id: document.id as string,
    username: document.username,
    fullName: document.fullName,
    profilePictureUrl: document.profilePictureUrl,
  };
}

/**
 * The identity domain's business logic. Controllers are only ever allowed to
 * call this object — never the repository, never the model.
 */
export const identityService = {
  async registerUserAccount(input: RegisterUserAccountInput): Promise<AuthenticatedSessionView> {
    const { emailTaken, usernameTaken } = await identityRepository.existsWithEmailOrUsername(
      input.email,
      input.username
    );

    if (emailTaken || usernameTaken) {
      const fieldErrors: Record<string, string> = {};
      if (emailTaken) {
        fieldErrors['email'] = 'An account with that email already exists.';
      }
      if (usernameTaken) {
        fieldErrors['username'] = 'That username is already taken.';
      }
      throw new ResourceConflictError('That account already exists.', { fieldErrors });
    }

    const hashedPassword = await bcryptjs.hash(input.password, PASSWORD_HASH_SALT_ROUNDS);
    const createdAccount = await identityRepository.createUserAccount({
      email: input.email,
      username: input.username,
      fullName: input.fullName,
      hashedPassword,
    });

    return this.buildSessionForAccount(createdAccount);
  },

  async authenticateUser(input: AuthenticateUserInput): Promise<AuthenticatedSessionView> {
    const account = await identityRepository.findUserAccountByEmailWithCredentials(input.email);

    // Deliberately identical message for "no such user" and "wrong password" so
    // the endpoint cannot be used to discover which emails are registered.
    const invalidCredentialsError = new AuthenticationRequiredError(
      'That email and password combination does not match an account.'
    );

    if (account === null) {
      throw invalidCredentialsError;
    }

    const passwordMatches = await bcryptjs.compare(input.password, account.hashedPassword);
    if (!passwordMatches) {
      throw invalidCredentialsError;
    }

    return this.buildSessionForAccount(account);
  },

  buildSessionForAccount(account: UserAccountDocument): AuthenticatedSessionView {
    const user = mapDocumentToUserAccountView(account);
    const accessToken = issueAccessTokenForUser({
      userId: user.id,
      email: user.email,
      username: user.username,
    });
    return { accessToken, user };
  },

  async getUserAccountById(userId: string): Promise<UserAccountView> {
    const account = await identityRepository.findUserAccountById(userId);
    if (account === null) {
      throw new ResourceNotFoundError('That account');
    }
    return mapDocumentToUserAccountView(account);
  },

  async updateUserProfile(
    userId: string,
    input: UpdateUserProfileInput
  ): Promise<UserAccountView> {
    const profileFields: Record<string, string> = {};
    if (input.fullName !== undefined) {
      profileFields['fullName'] = input.fullName;
    }
    if (input.biography !== undefined) {
      profileFields['biography'] = input.biography;
    }
    if (input.profilePictureUrl !== undefined) {
      profileFields['profilePictureUrl'] = input.profilePictureUrl;
    }

    if (Object.keys(profileFields).length === 0) {
      throw new InvalidInputError('There was nothing to update.');
    }

    const updatedAccount = await identityRepository.updateUserProfileFields(userId, profileFields);
    if (updatedAccount === null) {
      throw new ResourceNotFoundError('That account');
    }
    return mapDocumentToUserAccountView(updatedAccount);
  },

  async changeUserPassword(userId: string, input: ChangeUserPasswordInput): Promise<void> {
    const account = await identityRepository.findUserAccountByIdWithCredentials(userId);
    if (account === null) {
      throw new ResourceNotFoundError('That account');
    }

    const currentPasswordMatches = await bcryptjs.compare(
      input.currentPassword,
      account.hashedPassword
    );
    if (!currentPasswordMatches) {
      throw new InvalidInputError('Your current password is not correct.', {
        fieldErrors: { currentPassword: 'Your current password is not correct.' },
      });
    }

    if (input.currentPassword === input.newPassword) {
      throw new InvalidInputError('Your new password needs to be different from the old one.', {
        fieldErrors: { newPassword: 'Please choose a password you have not used here before.' },
      });
    }

    const newHashedPassword = await bcryptjs.hash(input.newPassword, PASSWORD_HASH_SALT_ROUNDS);
    await identityRepository.replaceUserPasswordHash(userId, newHashedPassword);
  },

  async getPublicProfilesByIds(
    userIds: readonly string[]
  ): Promise<ReadonlyMap<string, PublicUserProfileView>> {
    const accounts = await identityRepository.findUserAccountsByIds(userIds);
    const profilesById = new Map<string, PublicUserProfileView>();
    for (const account of accounts) {
      profilesById.set(account.id as string, mapDocumentToPublicProfileView(account));
    }
    return profilesById;
  },
};
