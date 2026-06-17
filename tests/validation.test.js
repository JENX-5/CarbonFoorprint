import { validateField } from '../src/lib/validation.js';
import { FIELD_BOUNDS } from '../src/lib/calculations.js';

describe('validateField utility', () => {
  it('passes for valid values within bounds', () => {
    for (const id of Object.keys(FIELD_BOUNDS)) {
      const { min, max } = FIELD_BOUNDS[id];
      const mid = (min + max) / 2;
      expect(validateField(id, mid)).toBe('');
    }
  });

  it('rejects out-of-range numbers', () => {
    const id = 'commuteKmPerDay';
    const { min, max } = FIELD_BOUNDS[id];
    expect(validateField(id, min - 1)).toMatch(/between/);
    expect(validateField(id, max + 1)).toMatch(/between/);
  });

  it('rejects non‑numeric input', () => {
    const id = 'electricityKwhPerMonth';
    expect(validateField(id, 'not-a-number')).toMatch(/must be a number/);
  });

  it('rejects empty string', () => {
    const id = 'wasteKgPerWeek';
    expect(validateField(id, '')).toMatch(/required/);
  });
});
