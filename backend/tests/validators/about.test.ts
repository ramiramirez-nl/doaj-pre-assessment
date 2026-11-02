import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/scraper/pageScraper', () => ({
  scrapeUrl: vi.fn(),
}));
vi.mock('../../src/issn/issnClient', () => ({
  lookupIssn: vi.fn(),
}));
vi.mock('../../src/ai/aiClient', () => ({
  analyzePageContent: vi.fn(),
}));

import { scrapeUrl } from '../../src/scraper/pageScraper';
import { lookupIssn } from '../../src/issn/issnClient';
import { analyzePageContent } from '../../src/ai/aiClient';
import { validateAbout } from '../../src/validators/about';
import type { AboutData } from '../../src/types/formData';

describe('validateAbout', () => {
  beforeEach(() => {
    (analyzePageContent as any).mockResolvedValue({
      found: true,
      confidence: 'high',
      evidence: 'Footer: Test Publisher, Ankara, Turkey',
      issues: [],
    });
  });

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

  describe('publisher country', () => {
    const base: AboutData = {
      journalTitle: 'Test Journal',
      homepageUrl: 'https://example.com',
      issnPrint: '',
      issnOnline: '1234-5678',
      publisherName: 'Test Publisher',
      publisherCountry: 'Turkey',
    };

    beforeEach(() => {
      (lookupIssn as any).mockResolvedValue({ valid: true, registeredTitle: 'Test Journal' });
      (scrapeUrl as any).mockResolvedValue({ accessible: true, text: 'Home', links: [], statusCode: 200 });
    });

    it('fails when no publisher country is given', async () => {
      const results = await validateAbout({ ...base, publisherCountry: '' });
      expect(results.find((r) => r.field === 'publisherCountry')?.status).toBe('fail');
    });

    it('passes when the website shows a publisher address in that country', async () => {
      const results = await validateAbout(base);
      const item = results.find((r) => r.field === 'publisherCountry');
      expect(item?.status).toBe('pass');
      expect((analyzePageContent as any).mock.calls.at(-1)[0].criteria).toContain('Turkey');
    });

    it('warns when the homepage shows no matching address', async () => {
      (analyzePageContent as any).mockResolvedValue({ found: false, confidence: 'medium', evidence: 'No address', issues: [] });
      const results = await validateAbout(base);
      expect(results.find((r) => r.field === 'publisherCountry')?.status).toBe('warning');
    });

    it('warns without an AI call when the homepage is unreachable', async () => {
      (analyzePageContent as any).mockClear();
      (scrapeUrl as any).mockResolvedValue({ accessible: false, text: '', links: [], statusCode: 0, errorType: 'network' });
      const results = await validateAbout(base);
      expect(results.find((r) => r.field === 'publisherCountry')?.status).toBe('warning');
      expect(analyzePageContent).not.toHaveBeenCalled();
    });
  
    it('checks the contact page instead of the homepage when one is given', async () => {
      (scrapeUrl as any).mockImplementation(async (url: string) => ({
        accessible: true,
        text: url.endsWith('/contact') ? 'Test Publisher, Ankara, Turkey' : 'Home',
        links: [],
        statusCode: 200,
      }));
      const results = await validateAbout({ ...base, contactPageUrl: 'https://example.com/contact' });
      const item = results.find((r) => r.field === 'publisherCountry');
      expect(item?.status).toBe('pass');
      expect(item?.url).toBe('https://example.com/contact');
      expect((analyzePageContent as any).mock.calls.at(-1)[0].pageText).toContain('Ankara');
    });

    it('warns when the contact page is unreachable', async () => {
      (scrapeUrl as any).mockImplementation(async (url: string) =>
        url.endsWith('/contact')
          ? { accessible: false, text: '', links: [], statusCode: 404, errorType: 'http' }
          : { accessible: true, text: 'Home', links: [], statusCode: 200 });
      const results = await validateAbout({ ...base, contactPageUrl: 'https://example.com/contact' });
      const item = results.find((r) => r.field === 'publisherCountry');
      expect(item?.status).toBe('warning');
      expect(item?.message).toContain('contact page');
    });
});
});
