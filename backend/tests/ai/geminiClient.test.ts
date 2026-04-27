import { describe, it, expect, vi } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function () {
    return {
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            found: true,
            confidence: 'high',
            evidence: 'Page contains "Creative Commons BY 4.0" text',
            issues: [],
          }),
        },
      }),
    }),
    };
  }),
}));

import { analyzePageContent } from '../../src/ai/geminiClient';

describe('analyzePageContent', () => {
  it('returns found true when content matches criteria', async () => {
    const result = await analyzePageContent({
      pageText: 'This work is licensed under Creative Commons BY 4.0',
      criteria: 'Does this page display a Creative Commons license?',
      url: 'https://example.com/license',
    });
    expect(result.found).toBe(true);
    expect(result.confidence).toBe('high');
  });

  it('returns structured JSON response', async () => {
    const result = await analyzePageContent({
      pageText: 'Some page content',
      criteria: 'Does this page have an open access statement?',
      url: 'https://example.com',
    });
    expect(result).toHaveProperty('found');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('evidence');
    expect(result).toHaveProperty('issues');
  });
});
