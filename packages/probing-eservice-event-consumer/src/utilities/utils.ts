/**
 * Sanitizes the input string by removing control characters and trimming whitespace.
 * Control characters removed include ASCII codes 0-31 and 127.
 */
export function sanitizeData(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]+/g, "").trim();
}
