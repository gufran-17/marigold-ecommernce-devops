import { describe, it, expect } from 'vitest';
import { formatPrice, fieldErrors } from './format';

describe('formatPrice', () => {
  it('formats a number as INR currency with no decimals', () => {
    expect(formatPrice(1999)).toBe('₹1,999');
  });
  it('treats missing or invalid values as zero', () => {
    expect(formatPrice(undefined)).toBe('₹0');
    expect(formatPrice(null)).toBe('₹0');
  });
});

describe('fieldErrors', () => {
  it('maps API validation error details to a field->message object', () => {
    const err = { response: { data: { error: { details: [{ field: 'email', message: 'Invalid email' }] } } } };
    expect(fieldErrors(err)).toEqual({ email: 'Invalid email' });
  });
  it('returns an empty object when there are no details', () => {
    expect(fieldErrors({})).toEqual({});
  });
});
