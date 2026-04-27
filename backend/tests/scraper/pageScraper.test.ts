import { describe, it, expect, vi } from 'vitest';

// We mock puppeteer to keep tests fast and offline
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        setUserAgent: vi.fn().mockResolvedValue(undefined),
        goto: vi.fn().mockResolvedValue({ status: () => 200 }),
        content: vi.fn().mockResolvedValue('<html><body><p>Creative Commons BY license</p><a href="https://creativecommons.org/licenses/by/4.0/">CC BY</a></body></html>'),
        close: vi.fn(),
      }),
      close: vi.fn(),
    }),
  },
}));

import { scrapeUrl } from '../../src/scraper/pageScraper';

describe('scrapeUrl', () => {
  it('returns page text and links', async () => {
    const result = await scrapeUrl('https://example.com/license');
    expect(result.text).toContain('Creative Commons BY license');
    expect(result.links).toContain('https://creativecommons.org/licenses/by/4.0/');
    expect(result.accessible).toBe(true);
  });

  it('returns accessible false on error', async () => {
    const puppeteer = await import('puppeteer');
    (puppeteer.default.launch as any).mockRejectedValueOnce(new Error('Network error'));
    const result = await scrapeUrl('https://broken-url.example.com');
    expect(result.accessible).toBe(false);
    expect(result.text).toBe('');
  });
});
