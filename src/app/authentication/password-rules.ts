import { HttpErrorResponse } from '@angular/common/http';

// Mirrors Django's default validators: min length 8, not only digits, not a common password.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_HINT = 'Use at least 8 characters. Not only numbers, and not a common password.';

const MISMATCH_TEXT = 'Passwords do not match.';

/** True for a 400 whose non-field errors come from Django's password validators, not the mismatch check. */
export function isPasswordRejection(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) return false;
  const messages: unknown = error.error?.non_field_errors;
  return Array.isArray(messages) && messages.some(message => message !== MISMATCH_TEXT);
}
