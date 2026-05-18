import { scrapeUrl } from '../scraper/pageScraper';
import { analyzePageContent } from '../ai/geminiClient';
import type { EthicsData } from '../types/formData';
import type { ReportItem } from '../types/report';

export async function validateEthics(
  data: EthicsData
): Promise<ReportItem[]> {
  const results: ReportItem[] = [];

  // Check 1: Publication ethics URL
  if (!data.publicationEthicsUrl) {
    results.push({
      section: 'Ethics',
      field: 'publicationEthicsUrl',
      status: 'fail',
      message: 'No URL provided for publication ethics / malpractice statement.',
      suggestion:
        'DOAJ requires a public page describing how the journal handles ethical issues (plagiarism, data fabrication, duplicate publication, conflicts of interest). Add this page and link to it from the journal website.',
    });
  } else {
    const scraped = await scrapeUrl(data.publicationEthicsUrl);
    if (!scraped.accessible) {
      results.push({
        section: 'Ethics',
        field: 'publicationEthicsUrl',
        status: 'warning',
        message: `Could not access ${data.publicationEthicsUrl} from our servers (may be geo-restricted).`,
        suggestion:
          'We could not verify this URL from our servers. Please manually confirm the page is publicly accessible and contains a publication ethics / malpractice statement.',
        url: data.publicationEthicsUrl,
      });
    } else {
      const analysis = await analyzePageContent({
        pageText: scraped.text,
        criteria:
          'Does this page contain a publication ethics or malpractice statement? It should address at least some of: plagiarism policy, authorship standards, duplicate publication, data fabrication/falsification, conflicts of interest, or adoption of recognised ethics guidelines (e.g. COPE).',
        url: data.publicationEthicsUrl,
      });
      results.push({
        section: 'Ethics',
        field: 'publicationEthicsUrl',
        status: analysis.found ? 'pass' : 'fail',
        message: analysis.found
          ? 'Publication ethics statement found on the linked page.'
          : `Publication ethics content not clearly found. ${analysis.evidence}`,
        suggestion: analysis.found
          ? ''
          : 'Add a clear publication ethics statement. Consider adopting COPE guidelines (publicationethics.org) and referencing them on this page.',
        url: data.publicationEthicsUrl,
      });
    }
  }

  // Check 2: Corrections and retractions policy
  if (!data.hasRetractionsPolicy) {
    results.push({
      section: 'Ethics',
      field: 'hasRetractionsPolicy',
      status: 'fail',
      message: 'No policy for corrections, retractions, or expressions of concern.',
      suggestion:
        'DOAJ requires journals to have a clearly stated policy for handling post-publication issues: corrections (minor errors), retractions (serious problems), and expressions of concern. Publish this policy on your website.',
    });
  } else {
    results.push({
      section: 'Ethics',
      field: 'hasRetractionsPolicy',
      status: 'pass',
      message: 'Journal has a corrections and retractions policy.',
      suggestion: '',
    });
  }

  // Check 3: Conflicts of interest policy
  if (!data.hasConflictPolicy) {
    results.push({
      section: 'Ethics',
      field: 'hasConflictPolicy',
      status: 'fail',
      message: 'No conflicts of interest policy for authors, reviewers, and editors.',
      suggestion:
        'DOAJ requires journals to explain how authors, reviewers, and editors should declare conflicts of interest and what authorship requires. Add this to your ethics or author guidelines page.',
    });
  } else {
    results.push({
      section: 'Ethics',
      field: 'hasConflictPolicy',
      status: 'pass',
      message: 'Journal has a conflicts of interest policy.',
      suggestion: '',
    });
  }

  // Check 4: No misleading metrics
  if (!data.noMisleadingMetrics) {
    results.push({
      section: 'Ethics',
      field: 'noMisleadingMetrics',
      status: 'fail',
      message: 'Journal displays non-standard or unverifiable "impact factors" from unrecognised sources.',
      suggestion:
        'DOAJ prohibits displaying metrics from commercial registries not recognised by the academic community (e.g. Global Impact Factor, SJIF, ResearchBib IF, Universal Impact Factor, CIF, i-Factor). Remove these from your website. Only verifiable metrics from recognised services are acceptable: Web of Science JIF, Scopus CiteScore, SJR, SNIP, h-index.',
    });
  } else {
    results.push({
      section: 'Ethics',
      field: 'noMisleadingMetrics',
      status: 'pass',
      message: 'No misleading or non-standard metrics displayed.',
      suggestion: '',
    });
  }

  return results;
}
