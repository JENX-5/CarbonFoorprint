import { Logger } from '../src/lib/logger.js';

describe('Logger utility', () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  let logOutput = '';
  let warnOutput = '';
  let errorOutput = '';

  beforeAll(() => {
    console.log = (msg) => { logOutput = msg; };
    console.warn = (msg) => { warnOutput = msg; };
    console.error = (msg) => { errorOutput = msg; };
  });

  afterAll(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  it('info logs JSON with level INFO', () => {
    Logger.info('test message', { a: 1 });
    const parsed = JSON.parse(logOutput);
    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('test message');
    expect(parsed.a).toBe(1);
    expect(parsed.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('warn logs JSON with level WARN', () => {
    Logger.warn('warn message');
    const parsed = JSON.parse(warnOutput);
    expect(parsed.level).toBe('WARN');
    expect(parsed.message).toBe('warn message');
  });

  it('error logs JSON with level ERROR and stack', () => {
    const err = new Error('boom');
    Logger.error('error occurs', err, { extra: true });
    const parsed = JSON.parse(errorOutput);
    expect(parsed.level).toBe('ERROR');
    expect(parsed.message).toBe('error occurs');
    expect(parsed.error).toBeDefined();
    expect(parsed.error.message).toBe('boom');
    expect(parsed.extra).toBe(true);
  });
});
