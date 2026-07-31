import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

/**
 * The persisted shape of a user account. `hashedPassword` is `select: false`
 * so it never rides along on an ordinary read — the repository has to ask for
 * it explicitly, which makes every credential read visible in the code.
 */
export interface UserAccountDocumentShape {
  email: string;
  username: string;
  fullName: string;
  biography: string;
  profilePictureUrl: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserAccountDocument = HydratedDocument<UserAccountDocumentShape>;

const userAccountSchema = new Schema<UserAccountDocumentShape>(
  {
    email: {
      type: String,
      required: [true, 'An email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'That does not look like a valid email address.'],
    },
    username: {
      type: String,
      required: [true, 'A username is required.'],
      unique: true,
      trim: true,
      minlength: [3, 'Usernames need at least 3 characters.'],
      maxlength: [32, 'Usernames can be at most 32 characters.'],
      match: [/^[a-zA-Z0-9_.-]+$/, 'Usernames may only contain letters, numbers, . _ and -'],
    },
    fullName: {
      type: String,
      required: [true, 'A display name is required.'],
      trim: true,
      maxlength: [80, 'Names can be at most 80 characters.'],
    },
    biography: {
      type: String,
      default: '',
      trim: true,
      maxlength: [600, 'Your bio can be at most 600 characters.'],
    },
    profilePictureUrl: {
      type: String,
      default: '',
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true, versionKey: false }
);

// The unique indexes on `email` and `username` come from `unique: true` in the
// schema above; declaring them again here would create duplicates.

export const UserAccountModel: Model<UserAccountDocumentShape> = model<UserAccountDocumentShape>(
  'UserAccount',
  userAccountSchema
);
