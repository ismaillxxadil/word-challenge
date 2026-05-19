export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return input;
  // Remove HTML tags
  let s = input.replace(/<[^>]*>/g, "");
  // Remove control characters
  s = s.replace(/[\u0000-\u001F\u007F]/g, "");
  // Allow Arabic letters, Latin letters, numbers, spaces, dash, underscore, dot
  s = s.replace(
    /[^A-Za-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF \-_.]/g,
    "",
  );
  // Collapse spaces and trim
  s = s.replace(/\s+/g, " ").trim();
  // Respect max length used in UI
  if (s.length > 15) s = s.slice(0, 15);
  return s;
}

export default sanitizeInput;
