import { scrapeUrl } from '../scraper/pageScraper';
import { lookupIssn } from '../issn/issnClient';
import type { AboutData } from '../types/formData';
import type { ReportItem } from '../types/report';

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
    results.push({
      section: 'About',
      field: 'homepageUrl',
      status: scraped.accessible ? 'pass' : 'fail',
      message: scraped.accessible
        ? 'Journal homepage is accessible.'
        : `Homepage URL ${data.homepageUrl} is not accessible.`,
      suggestion: scraped.accessible
        ? ''
        : 'The journal must have a dedicated URL accessible from any location without login.',
      url: data.homepageUrl,
    });
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
      status: lookup.valid ? 'pass' : 'fail',
      message: lookup.valid
        ? `ISSN ${issnToCheck} is registered at issn.org as "${lookup.registeredTitle}".`
        : `ISSN ${issnToCheck} is not confirmed at issn.org.`,
      suggestion: lookup.valid
        ? ''
        : 'Register your ISSN at issn.org and ensure it is confirmed before applying. The journal name must match what is shown at issn.org.',
    });

    // Check 3: Title match (warning if ISSN found but title differs significantly)
    if (
      lookup.valid &&
      lookup.registeredTitle &&
      !lookup.registeredTitle
        .toLowerCase()
        .includes(data.journalTitle.toLowerCase().slice(0, 5))
    ) {
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
