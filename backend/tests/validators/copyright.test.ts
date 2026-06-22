import { describe, it, expect, vi } from 'vitest';
import { validateCopyright } from '../../src/validators/copyright';
import * as scraper from '../../src/scraper/pageScraper';
import * as ai from '../../src/ai/geminiClient';

vi.mock('../../src/scraper/pageScraper');
vi.mock('../../src/ai/geminiClient');

describe('validateCopyright', () => {
  it('fails if no licenses are provided', async () => {
    vi.mocked(scraper.scrapeUrl).mockResolvedValue({ accessible: true, text: 'test', links: [], statusCode: 200 });
    vi.mocked(ai.analyzePageContent).mockResolvedValue({ found: true, confidence: 'high', evidence: '', issues: [] });

    const results = await validateCopyright({
      licenses: [],
      licenseInfoUrl: 'https://example.com',
      embedsLicenseInArticles: true,
      authorsRetainCopyright: true,
      copyrightTermsUrl: '',
      licenseConsistentOnArticlePages: true,
      licenseConsistentInPdfs: true,
      noCopyrightConflicts: true,
    });

    const licResult = results.find(r => r.field === 'licenses');
    expect(licResult?.status).toBe('fail');
  });

  it('passes for exact CC0 matching', async () => {
    vi.mocked(scraper.scrapeUrl).mockResolvedValue({ accessible: true, text: 'test', links: [], statusCode: 200 });
    vi.mocked(ai.analyzePageContent).mockResolvedValue({ found: true, confidence: 'high', evidence: '', issues: [] });

    const results = await validateCopyright({
      licenses: ['CC0'],
      licenseInfoUrl: 'https://example.com',
      embedsLicenseInArticles: true,
      authorsRetainCopyright: true,
      copyrightTermsUrl: '',
      licenseConsistentOnArticlePages: true,
      licenseConsistentInPdfs: true,
      noCopyrightConflicts: true,
    });

    const licResult = results.find(r => r.field === 'licenses');
    expect(licResult?.status).toBe('pass');
  });
});
