import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/scraper/pageScraper', () => ({
  scrapeUrl: vi.fn(),
}));
vi.mock('../../src/ai/geminiClient', () => ({
  analyzePageContent: vi.fn(),
}));

import { scrapeUrl } from '../../src/scraper/pageScraper';
import { analyzePageContent } from '../../src/ai/geminiClient';
import { validateEditorial } from '../../src/validators/editorial';
import type { EditorialData } from '../../src/types/formData';

describe('validateEditorial', () => {
  it('passes when peer review policy URL is accessible and policy found', async () => {
    (scrapeUrl as any).mockResolvedValue({
      accessible: true,
      text: 'Each article is reviewed by at least two independent peer reviewers using double-blind review.',
      links: [],
      statusCode: 200,
    });
    (analyzePageContent as any).mockResolvedValue({
      found: true,
      confidence: 'high',
      evidence: 'Page describes double-blind peer review with two reviewers',
      issues: [],
    });

    const data: EditorialData = {
      peerReviewTypes: ['Double anonymous peer review'],
      peerReviewPolicyUrl: 'https://example.com/peer-review',
      screensPlagiarism: true,
      plagiarismPolicyUrl: 'https://example.com/plagiarism',
      aimsAndScopeUrl: 'https://example.com/aims',
      editorialBoardUrl: 'https://example.com/board',
      instructionsForAuthorsUrl: 'https://example.com/instructions',
      avgWeeksSubmissionToPublication: 12,
    };

    const results = await validateEditorial(data);
    const peerCheck = results.find((r) => r.field === 'peerReviewPolicyUrl');
    expect(peerCheck?.status).toBe('pass');
  });

  it('fails when no peer review type is selected', async () => {
    (scrapeUrl as any).mockResolvedValue({ accessible: true, text: '', links: [], statusCode: 200 });
    (analyzePageContent as any).mockResolvedValue({ found: false, confidence: 'low', evidence: '', issues: [] });

    const data: EditorialData = {
      peerReviewTypes: [],
      peerReviewPolicyUrl: 'https://example.com/peer-review',
      screensPlagiarism: false,
      plagiarismPolicyUrl: '',
      aimsAndScopeUrl: 'https://example.com/aims',
      editorialBoardUrl: 'https://example.com/board',
      instructionsForAuthorsUrl: 'https://example.com/instructions',
      avgWeeksSubmissionToPublication: 12,
    };

    const results = await validateEditorial(data);
    const peerTypeCheck = results.find((r) => r.field === 'peerReviewTypes');
    expect(peerTypeCheck?.status).toBe('fail');
  });
});
