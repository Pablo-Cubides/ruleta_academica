import { describe, it, expect, beforeEach } from 'vitest';
import { isRateLimited, clearRateLimits } from '../rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it('should allow requests within limit', () => {
    const result1 = isRateLimited('test-key', { windowMs: 60000, max: 5 });
    expect(result1.limited).toBe(false);
    expect(result1.remaining).toBe(4);

    const result2 = isRateLimited('test-key', { windowMs: 60000, max: 5 });
    expect(result2.limited).toBe(false);
    expect(result2.remaining).toBe(3);
  });

  it('should block requests that exceed limit', () => {
    const opts = { windowMs: 60000, max: 3 };
    
    // Use up the limit
    isRateLimited('test-key', opts);
    isRateLimited('test-key', opts);
    isRateLimited('test-key', opts);

    // Next request should be limited
    const result = isRateLimited('test-key', opts);
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should reset counter after window expires', async () => {
    const opts = { windowMs: 100, max: 2 }; // 100ms window for fast test
    
    // Use up the limit
    isRateLimited('test-key', opts);
    isRateLimited('test-key', opts);
    
    // Should be limited
    const blocked = isRateLimited('test-key', opts);
    expect(blocked.limited).toBe(true);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should be allowed again
    const allowed = isRateLimited('test-key', opts);
    expect(allowed.limited).toBe(false);
    expect(allowed.remaining).toBe(1);
  });

  it('should handle different keys independently', () => {
    const opts = { windowMs: 60000, max: 2 };
    
    isRateLimited('key1', opts);
    isRateLimited('key1', opts);
    
    // key1 should be limited
    const result1 = isRateLimited('key1', opts);
    expect(result1.limited).toBe(true);

    // key2 should still be allowed
    const result2 = isRateLimited('key2', opts);
    expect(result2.limited).toBe(false);
    expect(result2.remaining).toBe(1);
  });

  it('should provide correct resetAt timestamp', () => {
    const now = Date.now();
    const windowMs = 60000;
    
    const result = isRateLimited('test-key', { windowMs, max: 5 });
    
    expect(result.resetAt).toBeGreaterThanOrEqual(now);
    expect(result.resetAt).toBeLessThanOrEqual(now + windowMs + 10); // small margin
  });
});
