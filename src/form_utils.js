import { isEmpty } from 'lodash';

// ---------------------------------
// Custom validation error messages.
// ---------------------------------
export const isEmailMessage = 'Valid email address required.';

export const minStringLengthMessage = n =>
  `Must be at least ${n} character${n > 1 ? 's' : ''}.`;

export const isPasswordMatchMessage = 'Passwords must match.';

export const isPasswordStrongMessage =
  'Password must contain a lower case letter, an upper case letter, ' +
  'a number, and a symbol';

export const isPhoneMessage =
  'Please enter a valid U.S. phone number with area code.';

export const requiredMessage = 'This is required.';

export const isPasswordUpperAndLowerMessage =
  'Include upper and lower case letters.';

export const isPasswordNumericMessage = 'Include at least one number.';

export const isPasswordNonAlphanumericMessage =
  'Include at least one non-alphanumeric character.';

// -------------------------
// Custom validation methods
// -------------------------

// Validate a string has both upper and lower case letters
export function isPasswordUpperAndLower(value) {
  return (
    /[a-z]/.test(value) && /[A-Z]/.test(value) // lowercases
  );
}

// Validate a string has at least 1 number
export function isPasswordNumeric(value) {
  return /[0-9]/.test(value); // numbers
}

// Validate a string has at least 1 non alpha numeric value
export function isPasswordNonAlphanumeric(value) {
  return /[^a-zA-Z\d\s:]/.test(value); // symbols
}

// Validate a string meets our strong password requirements.
export function isPasswordStrong(value) {
  return (
    /[a-z]/.test(value) && // lowercases
    /[A-Z]/.test(value) && // caps
    /[0-9]/.test(value) && // numbers
    /[^a-zA-Z\d\s:]/.test(value) // symbols
  );
}

// Validate a string is empty or something like a phone number.
export function isPhone(value) {
  // Empty is ok since we have a sep validator for that.
  if (isEmpty(value)) {
    return true;
  }

  // Need at least 10 chars for numbers w/area code.
  if (value.length < 10) {
    return false;
  }

  // Arbitrary high number for sanity check.
  if (value.length > 20) {
    return false;
  }

  // Check for a reasonable qty of numbers.
  let qtyNums = value.replace(/[^0-9]/g, '').length;
  return qtyNums >= 10 && qtyNums <= 20;
}
