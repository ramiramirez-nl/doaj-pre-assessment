import { describe, it, expect, vi } from 'vitest';
import { validateEthics } from '../../src/validators/ethics';
import * as scraper from '../../src/scraper/pageScraper';
import * as ai from '../../src/ai/aiClient';

vi.mock('../../src/scraper/pageScraper');
vi.mock('../../src/ai/aiClient');

describe('validateEthics', () => {
  it('fails if publication ethics URL is missing', async () => {
    const results = await validateEthics({
      publicationEthicsUrl: '',
      hasRetractionsPolicy: true,
      hasConflictPolicy: true,
      noMisleadingMetrics: true,
      indexingClaimsVerifiable: true
    });

    const urlResult = results.find(r => r.field === 'publicationEthicsUrl');
    expect(urlResult?.status).toBe('fail');
  });

  it('passes if URL is provided and accessible', async () => {
    vi.mocked(scraper.scrapeUrl).mockResolvedValue({ accessible: true, text: 'ethics', links: [], statusCode: 200 });
    vi.mocked(ai.analyzePageContent).mockResolvedValue({ found: true, confidence: 'high', evidence: '', issues: [] });
    
    const results = await validateEthics({
      publicationEthicsUrl: 'https://example.com/ethics',
      hasRetractionsPolicy: true,
      hasConflictPolicy: true,
      noMisleadingMetrics: true,
      indexingClaimsVerifiable: true
    });

    const urlResult = results.find(r => r.field === 'publicationEthicsUrl');
    expect(urlResult?.status).toBe('pass');
  });

  it('fails if misleading metrics are used', async () => {
    vi.mocked(scraper.scrapeUrl).mockResolvedValue({ accessible: true, text: 'ethics', links: [], statusCode: 200 });
    vi.mocked(ai.analyzePageContent).mockResolvedValue({ found: true, confidence: 'high', evidence: '', issues: [] });

    const results = await validateEthics({
      publicationEthicsUrl: 'https://example.com/ethics',
      hasRetractionsPolicy: true,
      hasConflictPolicy: true,
      noMisleadingMetrics: false,
      indexingClaimsVerifiable: true
    });

    const metricsResult = results.find(r => r.field === 'noMisleadingMetrics');
    expect(metricsResult?.status).toBe('fail');
  });
});
