import { z } from 'zod';

import { COURSE_CATEGORIES, COURSE_DIFFICULTY_LEVELS } from './catalog.types';

const courseModuleSchema = z.object({
  title: z
    .string({ required_error: 'Each module needs a title.' })
    .trim()
    .min(2, 'Each module needs a title.')
    .max(120, 'Module titles can be at most 120 characters.'),
  summary: z.string().trim().max(400, 'Module summaries can be at most 400 characters.').default(''),
  estimatedMinutes: z.coerce
    .number()
    .int('Use whole minutes.')
    .min(1, 'A module has to be at least a minute long.')
    .max(1200, 'That module is suspiciously long.')
    .default(30),
});

export const createCourseSchema = z.object({
  title: z
    .string({ required_error: 'A course needs a title.' })
    .trim()
    .min(5, 'Course titles need at least 5 characters.')
    .max(140, 'Course titles can be at most 140 characters.'),
  description: z
    .string({ required_error: 'A course needs a description.' })
    .trim()
    .min(20, 'Please write at least 20 characters so learners know what to expect.')
    .max(4000, 'Descriptions can be at most 4000 characters.'),
  category: z.enum(COURSE_CATEGORIES, {
    errorMap: () => ({ message: 'Please choose one of the available categories.' }),
  }),
  difficultyLevel: z.enum(COURSE_DIFFICULTY_LEVELS).default('Beginner'),
  priceInUnitedStatesDollars: z.coerce
    .number({ required_error: 'A price is required — use 0 for a free course.' })
    .min(0, 'A price cannot be negative.')
    .max(10000, 'That price is higher than the platform allows.'),
  thumbnailImageUrl: z
    .string()
    .trim()
    .max(500, 'That link is too long.')
    .refine(
      (candidateValue) => candidateValue === '' || /^https?:\/\/\S+$/i.test(candidateValue),
      'Please use a full link starting with http:// or https://'
    )
    .default(''),
  modules: z
    .array(courseModuleSchema)
    .max(60, 'A course can have at most 60 modules.')
    .default([]),
});

export const updateCourseSchema = createCourseSchema.partial().refine(
  (candidateValue) => Object.keys(candidateValue).length > 0,
  'There was nothing to update.'
);

const optionalPositiveNumberSchema = z
  .union([z.coerce.number().min(0, 'Prices cannot be negative.'), z.literal('')])
  .optional()
  .transform((candidateValue) =>
    candidateValue === '' || candidateValue === undefined ? undefined : candidateValue
  );

export const courseCatalogQuerySchema = z
  .object({
    searchTerm: z.string().trim().max(140).optional(),
    category: z.enum(COURSE_CATEGORIES).optional(),
    difficultyLevel: z.enum(COURSE_DIFFICULTY_LEVELS).optional(),
    minimumPrice: optionalPositiveNumberSchema,
    maximumPrice: optionalPositiveNumberSchema,
    sortBy: z.enum(['newest', 'priceAscending', 'priceDescending', 'topRated']).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(48).default(12),
  })
  .refine(
    (candidateValue) =>
      candidateValue.minimumPrice === undefined ||
      candidateValue.maximumPrice === undefined ||
      candidateValue.minimumPrice <= candidateValue.maximumPrice,
    { message: 'The minimum price has to be lower than the maximum.', path: ['minimumPrice'] }
  );

export const courseIdentifierParamsSchema = z.object({
  courseId: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, 'That is not a valid course id.'),
});
