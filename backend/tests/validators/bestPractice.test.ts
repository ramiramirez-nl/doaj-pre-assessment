import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/scraper/pageScraper', () => ({ scrapeUrl: vi.fn() }));
vi.mock('../../src/ai/aiClient', () => ({ analyzePageContent: vi.fn() }));

import { scrapeUrl } from '../../src/scraper/pageScraper';
import { analyzePageContent } from '../../src/ai/aiClient';
import { validateBestPractice } from '../../src/validators/bestPractice';

describe('validateBestPractice', () => {
  it('warns if no archiving services are used', async () => {
    const results = await validateBestPractice({
      archivingServices: [],
      repositoryPolicies: [],
      persistentIdentifiers: [],
      articlesHaveDois: false
    });

    const archResult = results.find(r => r.field === 'archivingServices');
    expect(archResult?.status).toBe('warning');
  });

  it('passes if recognised archiving service is used', async () => {
    const results = await validateBestPractice({
      archivingServices: ['CLOCKSS'],
      repositoryPolicies: ['Institutional'],
      persistentIdentifiers: ['DOI'],
      articlesHaveDois: true
    });

    const archResult = results.find(r => r.field === 'archivingServices');
    expect(archResult?.status).toBe('pass');
  });

  describe('AI policy', () => {
    const data = { archivingServices: [], repositoryPolicies: [], persistentIdentifiers: [], articlesHaveDois: true };

    it('warns when no AI policy URL is given', async () => {
      const results = await validateBestPractice({ ...data, aiPolicyUrl: '' });
      expect(results.find((r) => r.field === 'aiPolicyUrl')?.status).toBe('warning');
    });

    it('passes when the page states an AI policy', async () => {
      (scrapeUrl as any).mockResolvedValue({ accessible: true, text: 'Use of generative AI', links: [], statusCode: 200 });
      (analyzePageContent as any).mockResolvedValue({ found: true, confidence: 'high', evidence: 'AI policy', issues: [] });
      const results = await validateBestPractice({ ...data, aiPolicyUrl: 'https://example.com/ai' });
      expect(results.find((r) => r.field === 'aiPolicyUrl')?.status).toBe('pass');
    });

    it('warns (never fails) when the page has no AI policy', async () => {
      (scrapeUrl as any).mockResolvedValue({ accessible: true, text: 'Nothing', links: [], statusCode: 200 });
      (analyzePageContent as any).mockResolvedValue({ found: false, confidence: 'high', evidence: 'None', issues: [] });
      const results = await validateBestPractice({ ...data, aiPolicyUrl: 'https://example.com/ai' });
      expect(results.find((r) => r.field === 'aiPolicyUrl')?.status).toBe('warning');
    });
  });
});
