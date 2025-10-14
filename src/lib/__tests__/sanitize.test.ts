import { describe, it, expect } from 'vitest';
import { sanitizeText } from '../sanitize';

describe('sanitizeText', () => {
  it('removes control characters and trims', () => {
    const input = '\u0000Hello\nWorld\u0007  ';
    const out = sanitizeText(input);
    expect(out).toBe('HelloWorld');
  });
  it('returns empty string for falsy input', () => {
    expect(sanitizeText('')).toBe('');
  });
});
