import { describe, expect, it } from 'vitest';
import { signinSchema, signupSchema } from './schemas';

describe('signupSchema', () => {
  const valid = { name: 'Jane Doe', email: 'jane@example.com', password: 'Str0ng!Pass' };

  it('accepts a valid payload', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a short name', () => {
    expect(signupSchema.safeParse({ ...valid, name: 'Jo' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(signupSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it.each(['short1!', 'noNumber!', 'noSpecial1', 'NoDigitsOrSpecials'])(
    'rejects weak password "%s"',
    (password) => {
      expect(signupSchema.safeParse({ ...valid, password }).success).toBe(false);
    },
  );
});

describe('signinSchema', () => {
  it('requires both fields', () => {
    expect(signinSchema.safeParse({ email: '', password: '' }).success).toBe(false);
  });

  it('accepts valid credentials', () => {
    expect(signinSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });
});
