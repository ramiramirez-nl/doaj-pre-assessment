import { describe, it, expect, vi } from 'vitest';
import { validateBusinessModel } from '../../src/validators/businessModel';
import * as scraper from '../../src/scraper/pageScraper';

vi.mock('../../src/scraper/pageScraper');

describe('validateBusinessModel', () => {
  it('fails if no APC URL is provided when chargesApc is true', async () => {
    const results = await validateBusinessModel({
      chargesApc: true,
      apcFees: [],
      apcInfoUrl: '',
      providesWaiver: false,
      chargesOtherFees: false,
      otherFeesInfoUrl: ''
    });

    const urlResult = results.find(r => r.field === 'apcInfoUrl');
    expect(urlResult?.status).toBe('fail');
  });

  it('passes if charges APC and provides URL', async () => {
    vi.mocked(scraper.scrapeUrl).mockResolvedValue({ accessible: true, text: 'test', links: [], statusCode: 200 });

    const results = await validateBusinessModel({
      chargesApc: true,
      apcFees: [{ amount: 100, currency: 'USD' }],
      apcInfoUrl: 'https://example.com/apc',
      providesWaiver: true,
      chargesOtherFees: false,
      otherFeesInfoUrl: ''
    });

    const urlResult = results.find(r => r.field === 'apcInfoUrl');
    expect(urlResult?.status).toBe('pass');
  });
});
