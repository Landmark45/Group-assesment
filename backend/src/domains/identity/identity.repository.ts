import { Types } from 'mongoose';

import { UserAccountModel, type UserAccountDocument } from './identity.model';

/**
 * Data-access layer for the identity domain. This is the only module allowed to
 * touch `UserAccountModel`; the service talks to Mongo exclusively through here.
 */
export const identityRepository = {
  async createUserAccount(input: {
    email: string;
    username: string;
    fullName: string;
    hashedPassword: string;
  }): Promise<UserAccountDocument> {
    return UserAccountModel.create(input);
  },

  async findUserAccountById(userId: string): Promise<UserAccountDocument | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    return UserAccountModel.findById(userId).exec();
  },

  /** Includes the normally-hidden password hash — used only when signing in. */
  async findUserAccountByEmailWithCredentials(email: string): Promise<UserAccountDocument | null> {
    return UserAccountModel.findOne({ email: email.toLowerCase().trim() })
      .select('+hashedPassword')
      .exec();
  },

  async findUserAccountByIdWithCredentials(userId: string): Promise<UserAccountDocument | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    return UserAccountModel.findById(userId).select('+hashedPassword').exec();
  },

  async findUserAccountsByIds(userIds: readonly string[]): Promise<UserAccountDocument[]> {
    const validObjectIds = userIds
      .filter((candidateId) => Types.ObjectId.isValid(candidateId))
      .map((validId) => new Types.ObjectId(validId));

    if (validObjectIds.length === 0) {
      return [];
    }
    return UserAccountModel.find({ _id: { $in: validObjectIds } }).exec();
  },

  async existsWithEmailOrUsername(email: string, username: string): Promise<{
    emailTaken: boolean;
    usernameTaken: boolean;
  }> {
    const [accountWithEmail, accountWithUsername] = await Promise.all([
      UserAccountModel.exists({ email: email.toLowerCase().trim() }).exec(),
      UserAccountModel.exists({ username: username.trim() }).exec(),
    ]);
    return {
      emailTaken: accountWithEmail !== null,
      usernameTaken: accountWithUsername !== null,
    };
  },

  async updateUserProfileFields(
    userId: string,
    profileFields: Partial<Pick<UserAccountDocument, 'fullName' | 'biography' | 'profilePictureUrl'>>
  ): Promise<UserAccountDocument | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    return UserAccountModel.findByIdAndUpdate(userId, profileFields, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async replaceUserPasswordHash(userId: string, hashedPassword: string): Promise<void> {
    await UserAccountModel.findByIdAndUpdate(userId, { hashedPassword }).exec();
  },
};
