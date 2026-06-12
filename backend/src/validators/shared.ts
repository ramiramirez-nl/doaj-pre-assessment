import type { ScrapeResult } from '../scraper/pageScraper';

export interface AccessFailure {
  message: string;
  suggestion: string;
}

export function describeAccessFailure(url: string, scraped: ScrapeResult): AccessFailure {
  switch (scraped.errorType) {
    case 'timeout':
      return {
        message: `The URL ${url} did not respond within 15 seconds (timeout). It may be slow or temporarily down — this is not proof the page is missing.`,
        suggestion:
          'Verify the page loads quickly from a regular browser and re-run the assessment. Slow-loading pages may also fail DOAJ editorial review.',
      };
    case 'http':
      return {
        message: `The URL ${url} returned HTTP ${scraped.statusCode}.`,
        suggestion:
          'Fix the broken link: the page must be publicly accessible without login and return HTTP 200.',
      };
    default:
      return {
        message: `The URL ${url} could not be reached (network error or invalid address).`,
        suggestion:
          'Check the URL for typos and ensure the site is online and publicly accessible without login.',
      };
  }
}
