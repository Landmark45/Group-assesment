import { CourseModel } from './domains/catalog/catalog.model';
import { catalogService } from './domains/catalog/catalog.service';
import { UserAccountModel } from './domains/identity/identity.model';
import { identityService } from './domains/identity/identity.service';
import { CourseReviewModel, EnrollmentModel } from './domains/learning/learning.model';
import { learningService } from './domains/learning/learning.service';
import { connectToMongoDatabase, disconnectFromMongoDatabase } from './shared/database.connection';
import type { CourseCategory, CourseDifficultyLevel } from './domains/catalog/catalog.types';

/**
 * Fills an empty database with something worth looking at: three instructors,
 * two students, eight courses across every category, plus enrollments and
 * reviews so the star ratings and "most popular" ordering are not all zeroes.
 *
 * Everything goes through the domain services, so the seed exercises the same
 * validation and rating-recalculation rules a real request would.
 */

const DEMO_PASSWORD = 'educonnect123';

interface SeedCourseDefinition {
  readonly title: string;
  readonly description: string;
  readonly category: CourseCategory;
  readonly difficultyLevel: CourseDifficultyLevel;
  readonly priceInUnitedStatesDollars: number;
  readonly thumbnailImageUrl: string;
  readonly modules: ReadonlyArray<{ title: string; summary: string; estimatedMinutes: number }>;
}

const seedInstructors = [
  {
    email: 'amara@educonnect.dev',
    username: 'amara_codes',
    fullName: 'Amara Okonkwo',
    biography:
      'Backend engineer turned teacher. I have spent eleven years shipping Node services and I still get a kick out of the moment an idea finally lands.',
    profilePictureUrl: 'https://i.pravatar.cc/240?img=47',
  },
  {
    email: 'theo@educonnect.dev',
    username: 'theo_designs',
    fullName: 'Theo Lindqvist',
    biography:
      'Product designer. I care about the small stuff — spacing, contrast, the wording on an empty state — because that is where trust is built.',
    profilePictureUrl: 'https://i.pravatar.cc/240?img=12',
  },
  {
    email: 'priya@educonnect.dev',
    username: 'priya_growth',
    fullName: 'Priya Raman',
    biography:
      'Growth marketer with a spreadsheet habit. I teach the parts of marketing that survive contact with a real budget.',
    profilePictureUrl: 'https://i.pravatar.cc/240?img=32',
  },
] as const;

const seedStudents = [
  {
    email: 'sam@educonnect.dev',
    username: 'sam_learns',
    fullName: 'Sam Ferreira',
    biography: 'Career switcher, currently somewhere between "tutorial hell" and "shipped it".',
    profilePictureUrl: 'https://i.pravatar.cc/240?img=68',
  },
  {
    email: 'nadia@educonnect.dev',
    username: 'nadia_builds',
    fullName: 'Nadia Haddad',
    biography: 'Frontend developer, part-time potter, full-time collector of half-finished side projects.',
    profilePictureUrl: 'https://i.pravatar.cc/240?img=24',
  },
] as const;

const seedCoursesByInstructorIndex: ReadonlyArray<readonly SeedCourseDefinition[]> = [
  [
    {
      title: 'Node.js APIs That Survive Production',
      description:
        'Build an Express API the way a team would: layered architecture, real validation, sensible error handling, and the small operational habits that keep a service healthy after launch. We build one service end to end and break it on purpose along the way.',
      category: 'Programming',
      difficultyLevel: 'Intermediate',
      priceInUnitedStatesDollars: 79,
      thumbnailImageUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80',
      modules: [
        { title: 'Why layers, really', summary: 'Routes, controllers, services and repositories — and what goes wrong when you skip one.', estimatedMinutes: 42 },
        { title: 'Validation at the edge', summary: 'Rejecting bad input once, at the boundary, instead of everywhere.', estimatedMinutes: 38 },
        { title: 'Errors as a design surface', summary: 'One error hierarchy, one handler, correct status codes for free.', estimatedMinutes: 45 },
        { title: 'Auth without tears', summary: 'JWTs, guards, and ownership checks that actually hold.', estimatedMinutes: 56 },
        { title: 'Shipping and watching', summary: 'Logs, health checks and the first week in production.', estimatedMinutes: 34 },
      ],
    },
    {
      title: 'MongoDB Data Modelling for People Who Know SQL',
      description:
        'You already know how to normalise. This course is about when to stop. We work through embedding versus referencing, index design, and the denormalisation trade-offs that make read-heavy applications fast without making writes miserable.',
      category: 'Data',
      difficultyLevel: 'Intermediate',
      priceInUnitedStatesDollars: 59,
      thumbnailImageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
      modules: [
        { title: 'Documents are not rows', summary: 'The mental model shift, in one sitting.', estimatedMinutes: 30 },
        { title: 'Embed or reference', summary: 'A decision procedure you can defend in code review.', estimatedMinutes: 48 },
        { title: 'Indexes that earn their keep', summary: 'Reading explain() without fear.', estimatedMinutes: 52 },
        { title: 'Aggregation pipelines', summary: 'Computing ratings, rollups and reports.', estimatedMinutes: 61 },
      ],
    },
    {
      title: 'TypeScript: Strict Mode From Day One',
      description:
        'Strict mode is not a punishment, it is a design tool. We turn every flag on and then work through the patterns that make the compiler an ally: discriminated unions, narrowing, branded types, and knowing when a cast is honest.',
      category: 'Programming',
      difficultyLevel: 'Beginner',
      priceInUnitedStatesDollars: 0,
      thumbnailImageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
      modules: [
        { title: 'Turning the flags on', summary: 'What each strict flag buys you.', estimatedMinutes: 25 },
        { title: 'Narrowing', summary: 'Teaching the compiler what you already know.', estimatedMinutes: 40 },
        { title: 'Modelling with unions', summary: 'Making illegal states unrepresentable.', estimatedMinutes: 44 },
      ],
    },
  ],
  [
    {
      title: 'Interface Design for Developers',
      description:
        'A design course written for people who ship the code. Spacing scales, type hierarchy, colour that stays accessible, and the handful of layout patterns that cover most screens you will ever build. No design tool required — everything is done in the browser.',
      category: 'Design',
      difficultyLevel: 'Beginner',
      priceInUnitedStatesDollars: 45,
      thumbnailImageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
      modules: [
        { title: 'The spacing scale', summary: 'Why 4, 8, 12, 16 and not whatever looks fine.', estimatedMinutes: 28 },
        { title: 'Type that reads', summary: 'Size, weight, measure and line height.', estimatedMinutes: 35 },
        { title: 'Colour with a job', summary: 'Semantic tokens and contrast you can prove.', estimatedMinutes: 40 },
        { title: 'Five layouts, endlessly reused', summary: 'The patterns behind most product screens.', estimatedMinutes: 50 },
      ],
    },
    {
      title: 'Design Systems in Practice',
      description:
        'How a design system survives its second year. Token architecture, component API design, documentation that people actually read, and the governance conversations nobody warns you about. Includes a full token set you can lift into your own project.',
      category: 'Design',
      difficultyLevel: 'Advanced',
      priceInUnitedStatesDollars: 129,
      thumbnailImageUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
      modules: [
        { title: 'Three layers of tokens', summary: 'Primitive, semantic, component — and why the middle one matters most.', estimatedMinutes: 46 },
        { title: 'Component APIs', summary: 'Props that age well.', estimatedMinutes: 52 },
        { title: 'Docs as a product', summary: 'Writing for the developer in a hurry.', estimatedMinutes: 33 },
        { title: 'Versioning and deprecation', summary: 'Changing things without breaking everyone.', estimatedMinutes: 41 },
      ],
    },
    {
      title: 'Accessible Components From Scratch',
      description:
        'Build the tricky ones — modal, combobox, tabs, tooltip — with keyboard support and screen reader semantics that hold up under testing. We use no component library at all, so you finish knowing exactly what the library was doing for you.',
      category: 'Design',
      difficultyLevel: 'Intermediate',
      priceInUnitedStatesDollars: 69,
      thumbnailImageUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=800&q=80',
      modules: [
        { title: 'Focus, properly', summary: 'Traps, restoration, and visible focus rings.', estimatedMinutes: 44 },
        { title: 'The dialog', summary: 'Everything a modal owes its user.', estimatedMinutes: 39 },
        { title: 'Listbox and combobox', summary: 'The hardest widget, taken slowly.', estimatedMinutes: 58 },
      ],
    },
  ],
  [
    {
      title: 'Marketing for Small Teams',
      description:
        'Marketing when you are three people and one of you is the engineer. Positioning you can say out loud, a landing page that converts, an email sequence that is not embarrassing, and how to tell which of your channels is actually working.',
      category: 'Marketing',
      difficultyLevel: 'Beginner',
      priceInUnitedStatesDollars: 39,
      thumbnailImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      modules: [
        { title: 'Say what it is', summary: 'Positioning without the jargon.', estimatedMinutes: 30 },
        { title: 'One good landing page', summary: 'Structure, proof, and the single call to action.', estimatedMinutes: 42 },
        { title: 'Email that gets opened', summary: 'A five-message sequence, written together.', estimatedMinutes: 37 },
        { title: 'Measuring honestly', summary: 'Attribution for people without a data team.', estimatedMinutes: 45 },
      ],
    },
    {
      title: 'Pricing Your Product',
      description:
        'The single highest-leverage number in your business, treated seriously. Value metrics, packaging, the psychology of tiers, and how to run a price change without losing the customers you already have.',
      category: 'Business',
      difficultyLevel: 'Intermediate',
      priceInUnitedStatesDollars: 89,
      thumbnailImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
      modules: [
        { title: 'Find the value metric', summary: 'What you should actually charge for.', estimatedMinutes: 38 },
        { title: 'Packaging and tiers', summary: 'Three plans, and why the middle one sells.', estimatedMinutes: 43 },
        { title: 'Raising prices', summary: 'Grandfathering, communication, timing.', estimatedMinutes: 36 },
      ],
    },
  ],
];

const seedReviews: ReadonlyArray<{
  courseTitle: string;
  studentIndex: 0 | 1;
  rating: number;
  comment: string;
}> = [
  { courseTitle: 'Node.js APIs That Survive Production', studentIndex: 0, rating: 5, comment: 'The section on error handling reorganised how I think about status codes. I refactored our API the same week.' },
  { courseTitle: 'Node.js APIs That Survive Production', studentIndex: 1, rating: 4, comment: 'Genuinely useful. I would have liked more on testing, but the architecture material alone was worth it.' },
  { courseTitle: 'Interface Design for Developers', studentIndex: 0, rating: 5, comment: 'I finally understand why my spacing always looked slightly off. Clear, practical, no design tool needed.' },
  { courseTitle: 'Interface Design for Developers', studentIndex: 1, rating: 5, comment: 'Theo explains contrast and type hierarchy better than anything else I have watched.' },
  { courseTitle: 'TypeScript: Strict Mode From Day One', studentIndex: 1, rating: 4, comment: 'Great free course. The narrowing module is the one I keep coming back to.' },
  { courseTitle: 'Marketing for Small Teams', studentIndex: 0, rating: 4, comment: 'Practical and refreshingly free of hype. The landing page teardown was the highlight.' },
  { courseTitle: 'Design Systems in Practice', studentIndex: 1, rating: 5, comment: 'The three-layer token model is now how our whole team talks about styling. Worth every minute.' },
  { courseTitle: 'MongoDB Data Modelling for People Who Know SQL', studentIndex: 0, rating: 4, comment: 'Exactly the course I needed coming from Postgres. Embed-or-reference finally clicked.' },
];

async function seedEduConnectDatabase(): Promise<void> {
  await connectToMongoDatabase();

  console.log('[seed] clearing existing data');
  await Promise.all([
    UserAccountModel.deleteMany({}).exec(),
    CourseModel.deleteMany({}).exec(),
    EnrollmentModel.deleteMany({}).exec(),
    CourseReviewModel.deleteMany({}).exec(),
  ]);

  // Bring the collections' indexes back in line with the schemas. Without this,
  // an index left behind by an earlier version of a schema survives the wipe and
  // rejects perfectly valid inserts later on.
  console.log('[seed] syncing indexes');
  await Promise.all([
    UserAccountModel.syncIndexes(),
    CourseModel.syncIndexes(),
    EnrollmentModel.syncIndexes(),
    CourseReviewModel.syncIndexes(),
  ]);

  console.log('[seed] creating instructors');
  const instructorIds: string[] = [];
  for (const instructor of seedInstructors) {
    const session = await identityService.registerUserAccount({
      email: instructor.email,
      username: instructor.username,
      fullName: instructor.fullName,
      password: DEMO_PASSWORD,
    });
    await identityService.updateUserProfile(session.user.id, {
      biography: instructor.biography,
      profilePictureUrl: instructor.profilePictureUrl,
    });
    instructorIds.push(session.user.id);
  }

  console.log('[seed] creating students');
  const studentIds: string[] = [];
  for (const student of seedStudents) {
    const session = await identityService.registerUserAccount({
      email: student.email,
      username: student.username,
      fullName: student.fullName,
      password: DEMO_PASSWORD,
    });
    await identityService.updateUserProfile(session.user.id, {
      biography: student.biography,
      profilePictureUrl: student.profilePictureUrl,
    });
    studentIds.push(session.user.id);
  }

  console.log('[seed] creating courses');
  const courseIdsByTitle = new Map<string, string>();
  for (const [instructorIndex, courseDefinitions] of seedCoursesByInstructorIndex.entries()) {
    const instructorId = instructorIds[instructorIndex];
    if (instructorId === undefined) {
      continue;
    }
    for (const courseDefinition of courseDefinitions) {
      const createdCourse = await catalogService.createCourseForInstructor(instructorId, {
        ...courseDefinition,
        modules: [...courseDefinition.modules],
      });
      courseIdsByTitle.set(createdCourse.title, createdCourse.id);
    }
  }

  console.log('[seed] enrolling students and writing reviews');
  const alreadyEnrolled = new Set<string>();
  for (const review of seedReviews) {
    const courseId = courseIdsByTitle.get(review.courseTitle);
    const studentId = studentIds[review.studentIndex];
    if (courseId === undefined || studentId === undefined) {
      continue;
    }

    const enrollmentKey = `${courseId}:${studentId}`;
    if (!alreadyEnrolled.has(enrollmentKey)) {
      await learningService.enrollStudentInCourse(courseId, studentId);
      alreadyEnrolled.add(enrollmentKey);
    }

    await learningService.submitReviewForCourse(courseId, studentId, {
      rating: review.rating,
      comment: review.comment,
    });
  }

  // A couple of enrollments without reviews, so the dashboard shows the
  // "you have not reviewed this yet" state too.
  const pricingCourseId = courseIdsByTitle.get('Pricing Your Product');
  const firstStudentId = studentIds[0];
  if (pricingCourseId !== undefined && firstStudentId !== undefined) {
    await learningService.enrollStudentInCourse(pricingCourseId, firstStudentId);
    await learningService.updateEnrollmentProgressForStudent(pricingCourseId, firstStudentId, 35);
  }

  console.log('\n[seed] done. Sign in with any of these accounts:');
  for (const account of [...seedInstructors, ...seedStudents]) {
    console.log(`  ${account.email.padEnd(28)} password: ${DEMO_PASSWORD}`);
  }

  await disconnectFromMongoDatabase();
}

seedEduConnectDatabase().catch((seedError: unknown) => {
  console.error('[seed] failed:', seedError);
  process.exit(1);
});
