import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';

import { InvalidInputError } from './application.errors';

type ValidatableRequestSection = 'body' | 'query' | 'params';

/**
 * Parses and *replaces* one section of the request with the schema's output.
 * Because the parsed value is written back, controllers downstream work with
 * trimmed, coerced, correctly typed data and unknown keys have been stripped —
 * this is our payload sanitation step.
 */
export function validateRequestSection(
  section: ValidatableRequestSection,
  schema: ZodTypeAny
): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const parseResult = schema.safeParse(request[section]);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const fieldPath = issue.path.join('.') || section;
        if (fieldErrors[fieldPath] === undefined) {
          fieldErrors[fieldPath] = issue.message;
        }
      }
      next(new InvalidInputError('Some of the information you sent is not valid.', { fieldErrors }));
      return;
    }

    if (section === 'query') {
      // Express 4 exposes `req.query` as a getter-backed object on some setups;
      // defining the property keeps the replacement safe across versions.
      Object.defineProperty(request, 'query', {
        value: parseResult.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      request[section] = parseResult.data;
    }

    next();
  };
}

/** Convenience alias so controllers can name the shape they expect. */
export type InferSchemaType<TSchema extends ZodTypeAny> = z.infer<TSchema>;
