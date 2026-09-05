export type ClassValue = string | number | null | undefined | false;

/** Concatena classes ignorando valores falsy. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
