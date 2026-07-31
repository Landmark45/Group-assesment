import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

/**
 * Both of the learning domain's collections live here because they model the
 * same idea from two angles: the link between a student and a course.
 *
 * Each stores only foreign ids. The learning domain never joins across a domain
 * boundary in the database — it asks the catalog and identity domains for the
 * rest through their published interfaces.
 */

export interface EnrollmentDocumentShape {
  courseId: Types.ObjectId;
  studentUserId: Types.ObjectId;
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export type EnrollmentDocument = HydratedDocument<EnrollmentDocumentShape>;

const enrollmentSchema = new Schema<EnrollmentDocumentShape>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    studentUserId: {
      type: Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true,
      index: true,
    },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true, versionKey: false }
);

// One enrollment per student per course — enforced by the database, not just by
// the service, so a double-clicked "Enroll" button cannot create a duplicate.
enrollmentSchema.index({ courseId: 1, studentUserId: 1 }, { unique: true });

export const EnrollmentModel: Model<EnrollmentDocumentShape> = model<EnrollmentDocumentShape>(
  'Enrollment',
  enrollmentSchema
);

export interface CourseReviewDocumentShape {
  courseId: Types.ObjectId;
  authorUserId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseReviewDocument = HydratedDocument<CourseReviewDocumentShape>;

const courseReviewSchema = new Schema<CourseReviewDocumentShape>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    authorUserId: { type: Schema.Types.ObjectId, ref: 'UserAccount', required: true, index: true },
    rating: {
      type: Number,
      required: [true, 'A rating is required.'],
      min: [1, 'Ratings run from 1 to 5 stars.'],
      max: [5, 'Ratings run from 1 to 5 stars.'],
    },
    comment: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Reviews can be at most 2000 characters.'],
    },
  },
  { timestamps: true, versionKey: false }
);

// One review per student per course; writing again edits the existing review.
courseReviewSchema.index({ courseId: 1, authorUserId: 1 }, { unique: true });

export const CourseReviewModel: Model<CourseReviewDocumentShape> = model<CourseReviewDocumentShape>(
  'CourseReview',
  courseReviewSchema
);
