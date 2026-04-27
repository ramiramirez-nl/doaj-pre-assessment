import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapeResult {
  accessible: boolean;
  text: string;
  links: string[];
  statusCode: number;
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
      validateStatus: (status) => status < 500, // accept 4xx as a response
      responseType: 'text',
    });

    const statusCode = response.status;
    const html = String(response.data ?? '');

    // 4xx = page exists but blocked/missing — treat as not accessible content-wise
    if (statusCode >= 400) {
      return { accessible: false, text: '', links: [], statusCode };
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
  } catch {
    return { accessible: false, text: '', links: [], statusCode: 0 };
  }
}
