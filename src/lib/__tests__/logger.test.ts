import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message', { foo: 'bar' });
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    expect(consoleInfoSpy).toHaveBeenCalled();
  });

  it('should log warn messages', () => {
    logger.warn('Test warning', { severity: 'medium' });
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should log error messages with Error objects', () => {
    const error = new Error('Test error');
    logger.error('Something went wrong', error);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle non-Error objects in error logging', () => {
    logger.error('Failed operation', 'string error');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should include metadata in logs', () => {
    const metadata = { userId: 123, action: 'create' };
    logger.info('User action', metadata);
    expect(consoleInfoSpy).toHaveBeenCalled();
  });
});
