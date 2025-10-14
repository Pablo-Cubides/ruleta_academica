export function sanitizeText(s: string) {
  if (!s) return '';
  // remove control chars and trim
  return s.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
}
