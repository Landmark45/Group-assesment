/**
 * Client-side validation rules, kept deliberately in step with the Zod schemas
 * on the server. The server remains the authority — this layer exists so people
 * get an answer before a round trip, not so the server can trust the browser.
 */

export type FieldErrorMap = Record<string, string>;

export function validateEmailAddress(value: string): string | undefined {
  const trimmedValue = value.trim();
  if (trimmedValue === '') {
    return 'An email address is required.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
    return 'That does not look like a valid email address.';
  }
  return undefined;
}

export function validateUsername(value: string): string | undefined {
  const trimmedValue = value.trim();
  if (trimmedValue.length < 3) {
    return 'Usernames need at least 3 characters.';
  }
  if (trimmedValue.length > 32) {
    return 'Usernames can be at most 32 characters.';
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedValue)) {
    return 'Use only letters, numbers, . _ and -';
  }
  return undefined;
}

export function validateFullName(value: string): string | undefined {
  const trimmedValue = value.trim();
  if (trimmedValue.length < 2) {
    return 'Please tell us your name.';
  }
  if (trimmedValue.length > 80) {
    return 'Names can be at most 80 characters.';
  }
  return undefined;
}

export function validateNewPassword(value: string): string | undefined {
  if (value.length < 8) {
    return 'Passwords need at least 8 characters.';
  }
  if (!/[a-zA-Z]/.test(value)) {
    return 'Include at least one letter.';
  }
  if (!/[0-9]/.test(value)) {
    return 'Include at least one number.';
  }
  return undefined;
}

export function validateOptionalUrl(value: string): string | undefined {
  const trimmedValue = value.trim();
  if (trimmedValue === '') {
    return undefined;
  }
  if (!/^https?:\/\/\S+$/i.test(trimmedValue)) {
    return 'Please use a full link starting with http:// or https://';
  }
  if (trimmedValue.length > 500) {
    return 'That link is too long.';
  }
  return undefined;
}

export function validateCourseTitle(value: string): string | undefined {
  const trimmedValue = value.trim();
  if (trimmedValue.length < 5) {
    return 'Course titles need at least 5 characters.';
  }
  if (trimmedValue.length > 140) {
    return 'Course titles can be at most 140 characters.';
  }
  return undefined;
}

export function validateCourseDescription(value: string): string | undefined {
  const trimmedValue = value.trim();
  if (trimmedValue.length < 20) {
    return 'Please write at least 20 characters so learners know what to expect.';
  }
  if (trimmedValue.length > 4000) {
    return 'Descriptions can be at most 4000 characters.';
  }
  return undefined;
}

export function validateCoursePrice(value: string): string | undefined {
  if (value.trim() === '') {
    return 'A price is required — use 0 for a free course.';
  }
  const parsedPrice = Number(value);
  if (Number.isNaN(parsedPrice)) {
    return 'Please enter a number.';
  }
  if (parsedPrice < 0) {
    return 'A price cannot be negative.';
  }
  if (parsedPrice > 10000) {
    return 'That price is higher than the platform allows.';
  }
  return undefined;
}

/** Drops the `undefined`s so a caller can simply check `hasAnyFieldError`. */
export function collectFieldErrors(
  candidateErrors: Record<string, string | undefined>
): FieldErrorMap {
  const fieldErrors: FieldErrorMap = {};
  for (const [fieldName, errorMessage] of Object.entries(candidateErrors)) {
    if (errorMessage !== undefined) {
      fieldErrors[fieldName] = errorMessage;
    }
  }
  return fieldErrors;
}

export function hasAnyFieldError(fieldErrors: FieldErrorMap): boolean {
  return Object.keys(fieldErrors).length > 0;
}
