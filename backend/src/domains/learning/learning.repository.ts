import { Types } from 'mongoose';

import {
  CourseReviewModel,
  EnrollmentModel,
  type CourseReviewDocument,
  type EnrollmentDocument,
} from './learning.model';

function toObjectIdOrNull(candidateId: string): Types.ObjectId | null {
  return Types.ObjectId.isValid(candidateId) ? new Types.ObjectId(candidateId) : null;
}

/** Data-access layer for the learning domain — the only module that touches its models. */
export const learningRepository = {
  async createEnrollment(courseId: string, studentUserId: string): Promise<EnrollmentDocument> {
    return EnrollmentModel.create({
      courseId: new Types.ObjectId(courseId),
      studentUserId: new Types.ObjectId(studentUserId),
      progressPercentage: 0,
    });
  },

  async findEnrollment(
    courseId: string,
    studentUserId: string
  ): Promise<EnrollmentDocument | null> {
    const courseObjectId = toObjectIdOrNull(courseId);
    const studentObjectId = toObjectIdOrNull(studentUserId);
    if (courseObjectId === null || studentObjectId === null) {
      return null;
    }
    return EnrollmentModel.findOne({
      courseId: courseObjectId,
      studentUserId: studentObjectId,
    }).exec();
  },

  async findEnrollmentsForStudent(studentUserId: string): Promise<EnrollmentDocument[]> {
    const studentObjectId = toObjectIdOrNull(studentUserId);
    if (studentObjectId === null) {
      return [];
    }
    return EnrollmentModel.find({ studentUserId: studentObjectId })
      .sort({ createdAt: -1 })
      .exec();
  },

  async updateEnrollmentProgress(
    enrollmentId: string,
    progressPercentage: number
  ): Promise<EnrollmentDocument | null> {
    const enrollmentObjectId = toObjectIdOrNull(enrollmentId);
    if (enrollmentObjectId === null) {
      return null;
    }
    return EnrollmentModel.findByIdAndUpdate(
      enrollmentObjectId,
      { progressPercentage },
      { new: true, runValidators: true }
    ).exec();
  },

  async deleteEnrollment(courseId: string, studentUserId: string): Promise<boolean> {
    const courseObjectId = toObjectIdOrNull(courseId);
    const studentObjectId = toObjectIdOrNull(studentUserId);
    if (courseObjectId === null || studentObjectId === null) {
      return false;
    }
    const deletionResult = await EnrollmentModel.findOneAndDelete({
      courseId: courseObjectId,
      studentUserId: studentObjectId,
    }).exec();
    return deletionResult !== null;
  },

  async upsertCourseReview(
    courseId: string,
    authorUserId: string,
    review: { rating: number; comment: string }
  ): Promise<CourseReviewDocument> {
    const upsertedReview = await CourseReviewModel.findOneAndUpdate(
      { courseId: new Types.ObjectId(courseId), authorUserId: new Types.ObjectId(authorUserId) },
      { $set: review },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).exec();
    return upsertedReview as CourseReviewDocument;
  },

  async findReviewsForCourse(courseId: string): Promise<CourseReviewDocument[]> {
    const courseObjectId = toObjectIdOrNull(courseId);
    if (courseObjectId === null) {
      return [];
    }
    return CourseReviewModel.find({ courseId: courseObjectId }).sort({ createdAt: -1 }).exec();
  },

  async findReviewByAuthor(
    courseId: string,
    authorUserId: string
  ): Promise<CourseReviewDocument | null> {
    const courseObjectId = toObjectIdOrNull(courseId);
    const authorObjectId = toObjectIdOrNull(authorUserId);
    if (courseObjectId === null || authorObjectId === null) {
      return null;
    }
    return CourseReviewModel.findOne({
      courseId: courseObjectId,
      authorUserId: authorObjectId,
    }).exec();
  },

  async deleteReviewByAuthor(courseId: string, authorUserId: string): Promise<boolean> {
    const courseObjectId = toObjectIdOrNull(courseId);
    const authorObjectId = toObjectIdOrNull(authorUserId);
    if (courseObjectId === null || authorObjectId === null) {
      return false;
    }
    const deletionResult = await CourseReviewModel.findOneAndDelete({
      courseId: courseObjectId,
      authorUserId: authorObjectId,
    }).exec();
    return deletionResult !== null;
  },

  /** Aggregates the live rating for a course, used to refresh the catalog snapshot. */
  async calculateRatingSnapshotForCourse(
    courseId: string
  ): Promise<{ averageRating: number; reviewCount: number }> {
    const courseObjectId = toObjectIdOrNull(courseId);
    if (courseObjectId === null) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const aggregationResult = await CourseReviewModel.aggregate<{
      averageRating: number;
      reviewCount: number;
    }>([
      { $match: { courseId: courseObjectId } },
      {
        $group: {
          _id: '$courseId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]).exec();

    const aggregatedRating = aggregationResult[0];
    if (aggregatedRating === undefined) {
      return { averageRating: 0, reviewCount: 0 };
    }
    return {
      averageRating: aggregatedRating.averageRating,
      reviewCount: aggregatedRating.reviewCount,
    };
  },
};
