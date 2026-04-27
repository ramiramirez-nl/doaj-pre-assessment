import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/scraper/pageScraper', () => ({
  scrapeUrl: vi.fn(),
}));
vi.mock('../../src/issn/issnClient', () => ({
  lookupIssn: vi.fn(),
}));
vi.mock('../../src/ai/geminiClient', () => ({
  analyzePageContent: vi.fn(),
}));

import { scrapeUrl } from '../../src/scraper/pageScraper';
import { lookupIssn } from '../../src/issn/issnClient';
import { validateAbout } from '../../src/validators/about';
import type { AboutData } from '../../src/types/formData';

describe('validateAbout', () => {
  it('passes when ISSN is valid and homepage is accessible', async () => {
    (lookupIssn as any).mockResolvedValue({
      valid: true,
      registeredTitle: 'Test Journal',
      issn: '1234-5678',
    });
    (scrapeUrl as any).mockResolvedValue({
      accessible: true,
      text: 'Welcome to Test Journal homepage',
      links: [],
      statusCode: 200,
    });

    const data: AboutData = {
      journalTitle: 'Test Journal',
      alternativeTitle: '',
      homepageUrl: 'https://example.com',
      issnPrint: '',
      issnOnline: '1234-5678',
      keywords: ['engineering'],
      languages: ['English'],
      publisherName: 'Test Publisher',
      publisherCountry: 'Turkey',
    };

    const results = await validateAbout(data);
    const issnCheck = results.find((r) => r.field === 'issnOnline');
    expect(issnCheck?.status).toBe('pass');
  });

  it('fails when ISSN is not registered at issn.org', async () => {
    (lookupIssn as any).mockResolvedValue({
      valid: false,
      registeredTitle: '',
      issn: '0000-0000',
    });
    (scrapeUrl as any).mockResolvedValue({
      accessible: true,
      text: '',
      links: [],
      statusCode: 200,
    });

    const data: AboutData = {
      journalTitle: 'Test Journal',
      alternativeTitle: '',
      homepageUrl: 'https://example.com',
      issnPrint: '',
      issnOnline: '0000-0000',
      keywords: [],
      languages: ['English'],
      publisherName: 'Publisher',
      publisherCountry: 'Turkey',
    };

    const results = await validateAbout(data);
    const issnCheck = results.find((r) => r.field === 'issnOnline');
    expect(issnCheck?.status).toBe('fail');
    expect(issnCheck?.suggestion).toContain('issn.org');
  });
});
