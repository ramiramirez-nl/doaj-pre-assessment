import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/scraper/pageScraper', () => ({
  scrapeUrl: vi.fn(),
}));
vi.mock('../../src/ai/geminiClient', () => ({
  analyzePageContent: vi.fn(),
}));

import { scrapeUrl } from '../../src/scraper/pageScraper';
import { analyzePageContent } from '../../src/ai/geminiClient';
import { validateOpenAccess } from '../../src/validators/openAccess';
import type { OpenAccessData } from '../../src/types/formData';

describe('validateOpenAccess', () => {
  it('passes when OA statement found on linked page', async () => {
    (scrapeUrl as any).mockResolvedValue({
      accessible: true,
      text: 'This journal provides immediate open access to its content on the principle that making research freely available supports a greater global exchange of knowledge.',
      links: [],
      statusCode: 200,
    });
    (analyzePageContent as any).mockResolvedValue({
      found: true,
      confidence: 'high',
      evidence: 'Page contains open access statement',
      issues: [],
    });

    const data: OpenAccessData = {
      adheresToDefinition: true,
      openAccessStatementUrl: 'https://example.com/oa',
      licenseStartDate: '2023-01',
    };

    const results = await validateOpenAccess(data);
    expect(results.every((r) => r.status === 'pass')).toBe(true);
  });

  it('fails when user says No to OA definition', async () => {
    const data: OpenAccessData = {
      adheresToDefinition: false,
      openAccessStatementUrl: '',
      licenseStartDate: '',
    };
    const results = await validateOpenAccess(data);
    const oaCheck = results.find((r) => r.field === 'adheresToDefinition');
    expect(oaCheck?.status).toBe('fail');
    expect(oaCheck?.suggestion).toContain('open access');
  });

  it('fails when OA statement URL is inaccessible', async () => {
    (scrapeUrl as any).mockResolvedValue({
      accessible: false,
      text: '',
      links: [],
      statusCode: 0,
    });

    const data: OpenAccessData = {
      adheresToDefinition: true,
      openAccessStatementUrl: 'https://broken.example.com/oa',
      licenseStartDate: '2023-01',
    };
    const results = await validateOpenAccess(data);
    const urlCheck = results.find((r) => r.field === 'openAccessStatementUrl');
    expect(urlCheck?.status).toBe('fail');
  });
});
