import { z } from 'zod';

export const submitCourseReviewSchema = z.object({
  rating: z.coerce
    .number({ required_error: 'Please choose a star rating.' })
    .int('Ratings are whole stars.')
    .min(1, 'Ratings run from 1 to 5 stars.')
    .max(5, 'Ratings run from 1 to 5 stars.'),
  comment: z
    .string()
    .trim()
    .max(2000, 'Reviews can be at most 2000 characters.')
    .default(''),
});

export const updateEnrollmentProgressSchema = z.object({
  progressPercentage: z.coerce
    .number({ required_error: 'A progress value is required.' })
    .min(0, 'Progress runs from 0 to 100.')
    .max(100, 'Progress runs from 0 to 100.'),
});

export const courseScopedParamsSchema = z.object({
  courseId: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, 'That is not a valid course id.'),
});
