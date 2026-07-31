import { z } from 'zod';

const emailAddressSchema = z
  .string({ required_error: 'An email address is required.' })
  .trim()
  .min(1, 'An email address is required.')
  .email('That does not look like a valid email address.')
  .toLowerCase();

const passwordSchema = z
  .string({ required_error: 'A password is required.' })
  .min(8, 'Passwords need at least 8 characters.')
  .max(128, 'Passwords can be at most 128 characters.')
  .regex(/[a-zA-Z]/, 'Include at least one letter.')
  .regex(/[0-9]/, 'Include at least one number.');

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500, 'That link is too long.')
  .refine(
    (candidateValue) =>
      candidateValue === '' || /^https?:\/\/\S+$/i.test(candidateValue),
    'Please use a full link starting with http:// or https://'
  );

export const registerUserAccountSchema = z.object({
  email: emailAddressSchema,
  username: z
    .string({ required_error: 'A username is required.' })
    .trim()
    .min(3, 'Usernames need at least 3 characters.')
    .max(32, 'Usernames can be at most 32 characters.')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Use only letters, numbers, . _ and -'),
  fullName: z
    .string({ required_error: 'Please tell us your name.' })
    .trim()
    .min(2, 'Please tell us your name.')
    .max(80, 'Names can be at most 80 characters.'),
  password: passwordSchema,
});

export const authenticateUserSchema = z.object({
  email: emailAddressSchema,
  password: z.string({ required_error: 'A password is required.' }).min(1, 'A password is required.'),
});

export const updateUserProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Please tell us your name.')
      .max(80, 'Names can be at most 80 characters.')
      .optional(),
    biography: z.string().trim().max(600, 'Your bio can be at most 600 characters.').optional(),
    profilePictureUrl: optionalUrlSchema.optional(),
  })
  .refine(
    (candidateValue) => Object.keys(candidateValue).length > 0,
    'There was nothing to update.'
  );

export const changeUserPasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Your current password is required.' })
    .min(1, 'Your current password is required.'),
  newPassword: passwordSchema,
});
