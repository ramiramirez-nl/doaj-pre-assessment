import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export interface ScrapeResult {
  accessible: boolean;
  text: string;
  links: string[];
  statusCode: number;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    const statusCode = response?.status() ?? 0;
    const html = await page.content();
    const $ = cheerio.load(html);

    // Extract visible text
    $('script, style, nav, footer').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract all links
    const links: string[] = [];
    $('a[href]').each((_i, el) => {
      const href = $(el).attr('href') ?? '';
      if (href.startsWith('http')) links.push(href);
    });

    return { accessible: true, text, links, statusCode };
  } catch {
    return { accessible: false, text: '', links: [], statusCode: 0 };
  } finally {
    await browser?.close();
  }
}
