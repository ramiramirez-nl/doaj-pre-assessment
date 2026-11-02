import { scrapeUrl } from '../scraper/pageScraper';
import { lookupIssn } from '../issn/issnClient';
import { analyzePageContent } from '../ai/aiClient';
import type { AboutData } from '../types/formData';
import type { ReportItem } from '../types/report';
import type { ScrapeResult } from '../scraper/pageScraper';
import { describeAccessFailure } from './shared';

/**
 * DOAJ Guide v2.9, "Journal website": the country given in the application
 * and on the website must be where the publisher is registered and carries
 * out its business. Missing country is a fail. The contact page (or the
 * homepage, if none is given) is checked for a matching address; no match is
 * a warning, because the address may sit on yet another page.
 */
async function checkPublisherCountry(
  data: AboutData,
  homepage: ScrapeResult | null,
  language?: string
): Promise<ReportItem> {
  const country = (data.publisherCountry ?? '').replace(/[^\p{L}\p{N} .,'()-]/gu, '').trim().slice(0, 100);
  if (!country) {
    return {
      section: 'About',
      field: 'publisherCountry',
      status: 'fail',
      message: 'No publisher country provided.',
      suggestion:
        'Give the country where the publisher is registered and carries out its business activities. It must match the publisher information on the journal website.',
    };
  }
  const suggestion = `Show the publisher's name and full address (in ${country}) on the journal website, e.g. on the Contact page or in the footer. The country must be where the publisher is registered and operates.`;

  // Prefer the contact page (where most journals put the postal address);
  // fall back to the already-scraped homepage when none is given.
  const contactUrl = (data.contactPageUrl ?? '').trim();
  const source = contactUrl ? await scrapeUrl(contactUrl) : homepage;
  const sourceUrl = contactUrl || data.homepageUrl;
  const pageLabel = contactUrl ? 'contact page' : 'homepage';
  if (!source?.accessible) {
    return {
      section: 'About',
      field: 'publisherCountry',
      status: 'warning',
      message: `Publisher country "${country}" could not be checked against the website because the ${pageLabel} was not reachable.`,
      suggestion,
      url: sourceUrl || undefined,
    };
  }
  // Addresses often sit in the footer, so give the AI both ends of the page
  // instead of only the first 3000 characters.
  const text = source.text;
  const pageText = text.length > 3000 ? `${text.slice(0, 1500)} … ${text.slice(-1500)}` : text;
  const publisher = (data.publisherName ?? '').slice(0, 200);
  const analysis = await analyzePageContent({
    pageText,
    criteria: `Does this page state the publisher${publisher ? ` ("${publisher}")` : ''} with an address or location in the country "${country}"? Answer found=true only if the stated publisher location is in that country.`,
    url: sourceUrl,
    language,
  });
  if (analysis.found) {
    return {
      section: 'About',
      field: 'publisherCountry',
      status: 'pass',
      message: `The website shows publisher information located in ${country}.`,
      suggestion: '',
      url: sourceUrl,
      confidence: analysis.confidence,
      evidence: analysis.evidence,
    };
  }
  return {
    section: 'About',
    field: 'publisherCountry',
    status: 'warning',
    message: analysis.skipped
      ? `Publisher country "${country}" could not be verified: AI verification did not run. ${analysis.evidence}`
      : `The ${pageLabel} does not show a publisher address in ${country}. ${analysis.evidence}`,
    suggestion: contactUrl
      ? suggestion
      : `${suggestion} If the address is on a contact page, add its URL in the form so it can be checked.`,
    url: sourceUrl,
    confidence: analysis.skipped ? undefined : analysis.confidence,
    evidence: analysis.skipped ? undefined : analysis.evidence,
  };
}

export async function validateAbout(data: AboutData, language?: string): Promise<ReportItem[]> {
  const results: ReportItem[] = [];
  let homepage: ScrapeResult | null = null;

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
    homepage = scraped;
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

  // Check 4: Publisher country matches the website
  results.push(await checkPublisherCountry(data, homepage, language));

  return results;
}
