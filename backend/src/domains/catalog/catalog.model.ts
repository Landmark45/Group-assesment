import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import {
  COURSE_CATEGORIES,
  COURSE_DIFFICULTY_LEVELS,
  type CourseCategory,
  type CourseDifficultyLevel,
} from './catalog.types';

interface CourseModuleSubdocumentShape {
  title: string;
  summary: string;
  estimatedMinutes: number;
}

export interface CourseDocumentShape {
  title: string;
  description: string;
  category: CourseCategory;
  difficultyLevel: CourseDifficultyLevel;
  priceInUnitedStatesDollars: number;
  thumbnailImageUrl: string;
  modules: CourseModuleSubdocumentShape[];
  /** Reference to the identity domain's UserAccount — stored as an id, never populated across the boundary. */
  instructorUserId: Types.ObjectId;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseDocument = HydratedDocument<CourseDocumentShape>;

const courseModuleSchema = new Schema<CourseModuleSubdocumentShape>(
  {
    title: {
      type: String,
      required: [true, 'Each module needs a title.'],
      trim: true,
      maxlength: [120, 'Module titles can be at most 120 characters.'],
    },
    summary: {
      type: String,
      default: '',
      trim: true,
      maxlength: [400, 'Module summaries can be at most 400 characters.'],
    },
    estimatedMinutes: {
      type: Number,
      default: 30,
      min: [1, 'A module has to be at least a minute long.'],
      max: [1200, 'That module is suspiciously long.'],
    },
  },
  { _id: false }
);

const courseSchema = new Schema<CourseDocumentShape>(
  {
    title: {
      type: String,
      required: [true, 'A course needs a title.'],
      trim: true,
      minlength: [5, 'Course titles need at least 5 characters.'],
      maxlength: [140, 'Course titles can be at most 140 characters.'],
    },
    description: {
      type: String,
      required: [true, 'A course needs a description.'],
      trim: true,
      minlength: [20, 'Please write at least 20 characters so learners know what to expect.'],
      maxlength: [4000, 'Descriptions can be at most 4000 characters.'],
    },
    category: {
      type: String,
      required: [true, 'Please choose a category.'],
      enum: { values: [...COURSE_CATEGORIES], message: '"{VALUE}" is not a category we support.' },
      index: true,
    },
    difficultyLevel: {
      type: String,
      required: true,
      enum: { values: [...COURSE_DIFFICULTY_LEVELS], message: '"{VALUE}" is not a difficulty we support.' },
      default: 'Beginner',
    },
    priceInUnitedStatesDollars: {
      type: Number,
      required: [true, 'A price is required — use 0 for a free course.'],
      min: [0, 'A price cannot be negative.'],
      max: [10000, 'That price is higher than the platform allows.'],
      index: true,
    },
    thumbnailImageUrl: { type: String, default: '', trim: true },
    modules: {
      type: [courseModuleSchema],
      default: [],
      validate: {
        validator: (modules: CourseModuleSubdocumentShape[]): boolean => modules.length <= 60,
        message: 'A course can have at most 60 modules.',
      },
    },
    instructorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true,
      index: true,
    },
    enrollmentCount: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

// Backs the catalog's free-text search across title and description.
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, priceInUnitedStatesDollars: 1 });

export const CourseModel: Model<CourseDocumentShape> = model<CourseDocumentShape>(
  'Course',
  courseSchema
);
