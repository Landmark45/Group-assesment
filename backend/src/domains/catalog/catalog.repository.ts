import { Types, type FilterQuery, type SortOrder } from 'mongoose';

import { CourseModel, type CourseDocument, type CourseDocumentShape } from './catalog.model';
import type { CourseCatalogQuery, CreateCourseInput, UpdateCourseInput } from './catalog.types';

function buildCatalogFilter(query: CourseCatalogQuery): FilterQuery<CourseDocumentShape> {
  const filter: FilterQuery<CourseDocumentShape> = {};

  if (query.searchTerm !== undefined && query.searchTerm.trim() !== '') {
    // A case-insensitive regex rather than $text so that partial words ("java"
    // matching "JavaScript") behave the way people expect from a search box.
    const escapedSearchTerm = query.searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchPattern = new RegExp(escapedSearchTerm, 'i');
    filter.$or = [{ title: searchPattern }, { description: searchPattern }];
  }

  if (query.category !== undefined) {
    filter.category = query.category;
  }

  if (query.difficultyLevel !== undefined) {
    filter.difficultyLevel = query.difficultyLevel;
  }

  if (query.minimumPrice !== undefined || query.maximumPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (query.minimumPrice !== undefined) {
      priceFilter['$gte'] = query.minimumPrice;
    }
    if (query.maximumPrice !== undefined) {
      priceFilter['$lte'] = query.maximumPrice;
    }
    filter.priceInUnitedStatesDollars = priceFilter;
  }

  return filter;
}

function buildCatalogSort(
  sortBy: CourseCatalogQuery['sortBy']
): Record<string, SortOrder> {
  switch (sortBy) {
    case 'priceAscending':
      return { priceInUnitedStatesDollars: 1, createdAt: -1 };
    case 'priceDescending':
      return { priceInUnitedStatesDollars: -1, createdAt: -1 };
    case 'topRated':
      return { averageRating: -1, reviewCount: -1, createdAt: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

/** Data-access layer for the catalog domain — the only module that touches `CourseModel`. */
export const catalogRepository = {
  async createCourse(
    instructorUserId: string,
    input: CreateCourseInput
  ): Promise<CourseDocument> {
    return CourseModel.create({
      ...input,
      thumbnailImageUrl: input.thumbnailImageUrl ?? '',
      modules: [...input.modules],
      instructorUserId: new Types.ObjectId(instructorUserId),
    });
  },

  async findCourseById(courseId: string): Promise<CourseDocument | null> {
    if (!Types.ObjectId.isValid(courseId)) {
      return null;
    }
    return CourseModel.findById(courseId).exec();
  },

  async findCoursesByIds(courseIds: readonly string[]): Promise<CourseDocument[]> {
    const validObjectIds = courseIds
      .filter((candidateId) => Types.ObjectId.isValid(candidateId))
      .map((validId) => new Types.ObjectId(validId));
    if (validObjectIds.length === 0) {
      return [];
    }
    return CourseModel.find({ _id: { $in: validObjectIds } }).exec();
  },

  async findCoursesForCatalog(query: CourseCatalogQuery): Promise<{
    courses: CourseDocument[];
    totalCourseCount: number;
  }> {
    const filter = buildCatalogFilter(query);
    const skipCount = (query.page - 1) * query.pageSize;

    const [courses, totalCourseCount] = await Promise.all([
      CourseModel.find(filter)
        .sort(buildCatalogSort(query.sortBy))
        .skip(skipCount)
        .limit(query.pageSize)
        .exec(),
      CourseModel.countDocuments(filter).exec(),
    ]);

    return { courses, totalCourseCount };
  },

  async findCoursesByInstructorUserId(instructorUserId: string): Promise<CourseDocument[]> {
    if (!Types.ObjectId.isValid(instructorUserId)) {
      return [];
    }
    return CourseModel.find({ instructorUserId: new Types.ObjectId(instructorUserId) })
      .sort({ createdAt: -1 })
      .exec();
  },

  async updateCourseById(
    courseId: string,
    input: UpdateCourseInput
  ): Promise<CourseDocument | null> {
    if (!Types.ObjectId.isValid(courseId)) {
      return null;
    }
    return CourseModel.findByIdAndUpdate(
      courseId,
      { ...input, ...(input.modules !== undefined ? { modules: [...input.modules] } : {}) },
      { new: true, runValidators: true }
    ).exec();
  },

  async deleteCourseById(courseId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(courseId)) {
      return false;
    }
    const deletionResult = await CourseModel.findByIdAndDelete(courseId).exec();
    return deletionResult !== null;
  },

  async adjustEnrollmentCount(courseId: string, delta: number): Promise<void> {
    if (!Types.ObjectId.isValid(courseId)) {
      return;
    }
    await CourseModel.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: delta } }).exec();
  },

  async replaceRatingSnapshot(
    courseId: string,
    snapshot: { averageRating: number; reviewCount: number }
  ): Promise<void> {
    if (!Types.ObjectId.isValid(courseId)) {
      return;
    }
    await CourseModel.findByIdAndUpdate(courseId, snapshot).exec();
  },
};
