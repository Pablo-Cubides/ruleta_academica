type Key = string;

// Very small in-memory token bucket / fixed-window counter limiter.
// Not suitable for multi-instance production but fine for single-instance or as a first safeguard.
const windows = new Map<Key, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  windowMs: number; // milliseconds
  max: number; // max requests per window
}

export function isRateLimited(key: Key, opts: RateLimitOptions) {
  const now = Date.now();
  const slot = windows.get(key);
  if (!slot || slot.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { limited: false, remaining: opts.max - 1, resetAt: now + opts.windowMs };
  }
  slot.count += 1;
  windows.set(key, slot);
  if (slot.count > opts.max) {
    return { limited: true, remaining: 0, resetAt: slot.resetAt };
  }
  return { limited: false, remaining: opts.max - slot.count, resetAt: slot.resetAt };
}

export function clearRateLimits() {
  windows.clear();
}
