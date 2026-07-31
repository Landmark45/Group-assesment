import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { catalogRouter } from './domains/catalog/catalog.router';
import { identityAuthenticationRouter, identityProfileRouter } from './domains/identity/identity.router';
import {
  learningCourseScopedRouter,
  learningEnrollmentRouter,
} from './domains/learning/learning.router';
import { environmentConfiguration } from './shared/environment.config';
import {
  handleApplicationError,
  handleUnmatchedRoute,
} from './shared/error-handling.middleware';

/**
 * The composition root: the one file that knows every domain exists and decides
 * where each one is mounted. Domains themselves know nothing about each other's
 * URLs — they only ever talk through published domain interfaces.
 */
export function createExpressApplication(): Express {
  const application = express();

  application.use(helmet());
  application.use(
    cors({
      origin: environmentConfiguration.allowedClientOrigins as string[],
      credentials: true,
    })
  );
  application.use(express.json({ limit: '256kb' }));
  application.use(express.urlencoded({ extended: true, limit: '256kb' }));

  if (environmentConfiguration.nodeEnvironment !== 'test') {
    application.use(morgan(environmentConfiguration.nodeEnvironment === 'production' ? 'combined' : 'dev'));
  }

  application.get('/api/health', (_request, response) => {
    response.status(200).json({
      success: true,
      data: { status: 'ok', timestamp: new Date().toISOString() },
    });
  });

  // identity — who you are
  application.use('/api/auth', identityAuthenticationRouter);
  application.use('/api/profile', identityProfileRouter);

  // catalog — what is on offer
  application.use('/api/courses', catalogRouter);

  // learning — the relationship between a learner and a course. Mounted after
  // the catalog so that /api/courses/:id falls through to here for sub-resources.
  application.use('/api/courses/:courseId', learningCourseScopedRouter);
  application.use('/api/enrollments', learningEnrollmentRouter);

  application.use(handleUnmatchedRoute);
  application.use(handleApplicationError);

  return application;
}
