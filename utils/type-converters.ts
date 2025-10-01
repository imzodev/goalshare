/**
 * Converts a number to a string representation for database storage.
 * Returns null if the value is null or undefined.
 *
 * @param value - The number to convert, or null/undefined
 * @returns String representation of the number, or null
 *
 * @example
 * toNumericString(42) // "42"
 * toNumericString(3.14) // "3.14"
 * toNumericString(null) // null
 * toNumericString(undefined) // null
 */
export function toNumericString(value: number | null | undefined): string | null {
  return value != null ? String(value) : null;
}
