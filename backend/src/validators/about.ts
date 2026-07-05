import { scrapeUrl } from '../scraper/pageScraper';
import { lookupIssn } from '../issn/issnClient';
import type { AboutData } from '../types/formData';
import type { ReportItem } from '../types/report';
import { describeAccessFailure } from './shared';

export async function validateAbout(data: AboutData): Promise<ReportItem[]> {
  const results: ReportItem[] = [];

  // Check 1: Homepage accessibility
  if (!data.homepageUrl) {
    results.push({
      section: 'About',
      field: 'homepageUrl',
      status: 'fail',
      message: 'No journal homepage URL provided.',
      suggestion: 'Provide the direct URL to the journal homepage.',
    });
  } else {
    const scraped = await scrapeUrl(data.homepageUrl);
    if (scraped.accessible) {
      results.push({
        section: 'About',
        field: 'homepageUrl',
        status: 'pass',
        message: 'Journal homepage is accessible.',
        suggestion: '',
        url: data.homepageUrl,
      });
    } else {
      const failure = describeAccessFailure(data.homepageUrl, scraped);
      results.push({
        section: 'About',
        field: 'homepageUrl',
        status: scraped.errorType === 'timeout' ? 'warning' : 'fail',
        message: failure.message,
        suggestion: failure.suggestion,
        url: data.homepageUrl,
      });
    }
  }

  // Check 2: At least one ISSN must be provided
  const hasIssn = data.issnOnline || data.issnPrint;
  if (!hasIssn) {
    results.push({
      section: 'About',
      field: 'issnOnline',
      status: 'fail',
      message: 'No ISSN provided.',
      suggestion:
        'The journal must have at least one ISSN (print or online) registered at issn.org.',
    });
  } else {
    // Check the provided ISSN against issn.org
    const issnToCheck = data.issnOnline || data.issnPrint;
    const fieldName = data.issnOnline ? 'issnOnline' : 'issnPrint';
    const lookup = await lookupIssn(issnToCheck);

    results.push({
      section: 'About',
      field: fieldName,
      status: lookup.valid ? 'pass' : lookup.lookupFailed ? 'warning' : 'fail',
      message: lookup.valid
        ? `ISSN ${issnToCheck} is registered at issn.org as "${lookup.registeredTitle}".`
        : lookup.lookupFailed
          ? `ISSN ${issnToCheck} could not be verified: issn.org did not respond. This does not mean the ISSN is invalid.`
          : `ISSN ${issnToCheck} is not confirmed at issn.org.`,
      suggestion: lookup.valid
        ? ''
        : lookup.lookupFailed
          ? 'Re-run the assessment later, or check the ISSN manually at https://portal.issn.org.'
          : 'Register your ISSN at issn.org and ensure it is confirmed before applying. The journal name must match what is shown at issn.org.',
    });

    // Check 3: Title match (warning if ISSN found but title differs significantly).
    // Compare normalized full titles both ways — issn.org often appends
    // qualifiers like "(Online)" to the registered title.
    const normalizeTitle = (s: string) =>
      s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const registeredNorm = normalizeTitle(lookup.registeredTitle ?? '');
    const providedNorm = normalizeTitle(data.journalTitle ?? '');
    const titlesMatch =
      registeredNorm.length > 0 &&
      providedNorm.length > 0 &&
      (registeredNorm.includes(providedNorm) || providedNorm.includes(registeredNorm));
    if (lookup.valid && lookup.registeredTitle && !titlesMatch) {
      results.push({
        section: 'About',
        field: 'journalTitle',
        status: 'warning',
        message: `Journal title "${data.journalTitle}" may not match ISSN-registered title "${lookup.registeredTitle}".`,
        suggestion:
          'The journal name in the application and on the website must match what is shown at issn.org.',
      });
    }
  }

  return results;
}
