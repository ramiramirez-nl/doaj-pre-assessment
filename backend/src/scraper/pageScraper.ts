import axios from 'axios';
import * as cheerio from 'cheerio';

export type ScrapeErrorType = 'timeout' | 'network' | 'http';

export interface ScrapeResult {
  accessible: boolean;
  text: string;
  links: string[];
  statusCode: number;
  errorType?: ScrapeErrorType;
}

const REAL_BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    const response = await axios.get(url, {
      headers: REAL_BROWSER_HEADERS,
      timeout: 20000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
      responseType: 'text',
    });

    const statusCode = response.status;
    const html = String(response.data ?? '');

    if (statusCode >= 400) {
      return { accessible: false, text: '', links: [], statusCode, errorType: 'http' };
    }

    const $ = cheerio.load(html);
    $('script, style, nav, footer, noscript, iframe').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    const links: string[] = [];
    $('a[href]').each((_i, el) => {
      const href = $(el).attr('href') ?? '';
      if (href.startsWith('http')) links.push(href);
    });

    return { accessible: true, text, links, statusCode };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const errorType: ScrapeErrorType =
      err instanceof Error && (err.name === 'TimeoutError' || /timeout/i.test(message))
        ? 'timeout'
        : 'network';
    console.warn(`Scrape failed for ${url}: ${message.slice(0, 200)}`);
    return { accessible: false, text: '', links: [], statusCode: 0, errorType };
  }
}
