import { describe, it, expect } from 'vitest';
import { assessRequestSchema } from '../src/schemas/formData';

const minimal = {
  openAccess: {},
  about: {},
  editorial: {},
};

describe('assessRequestSchema', () => {
  it('accepts an empty board size input (serialized as null)', () => {
    const parsed = assessRequestSchema.safeParse({
      ...minimal,
      editorial: { boardMemberCount: null, publishesSpecialIssues: true },
    });
    expect(parsed.success).toBe(true);
  });

  it('defaults the new text fields to empty strings', () => {
    const parsed = assessRequestSchema.parse(minimal);
    expect(parsed.about.publisherCountry).toBe('');
    expect(parsed.bestPractice.aiPolicyUrl).toBe('');
  });
});
