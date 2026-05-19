export function sanitizeName(input) {
  if (typeof input !== "string") return input;
  // Strip HTML tags
  let s = input.replace(/<[^>]*>/g, "");
  // Remove control characters
  s = s.replace(/[\u0000-\u001F\u007F]/g, "");
  // Keep common safe characters: Arabic ranges, Latin letters, numbers, space, dash, underscore, dot
  s = s.replace(
    /[^A-Za-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF \-_.]/g,
    "",
  );
  // Collapse multiple spaces and trim
  s = s.replace(/\s+/g, " ").trim();
  // Enforce max length (server expects <= 20)
  if (s.length > 20) s = s.slice(0, 20);
  return s;
}

export default sanitizeName;
