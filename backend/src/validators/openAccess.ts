import { scrapeUrl } from '../scraper/pageScraper';
import { analyzePageContent } from '../ai/geminiClient';
import type { OpenAccessData } from '../types/formData';
import type { ReportItem } from '../types/report';

export async function validateOpenAccess(
  data: OpenAccessData
): Promise<ReportItem[]> {
  const results: ReportItem[] = [];

  // Check 1: User must affirm OA definition compliance
  if (!data.adheresToDefinition) {
    results.push({
      section: 'Open Access',
      field: 'adheresToDefinition',
      status: 'fail',
      message: 'Journal does not adhere to DOAJ open access definition.',
      suggestion:
        'DOAJ only accepts fully open access journals. Ensure all content is immediately free with a CC or equivalent open license, no embargo, no registration required.',
    });
    return results; // No point checking further
  }

  results.push({
    section: 'Open Access',
    field: 'adheresToDefinition',
    status: 'pass',
    message: 'Journal affirms DOAJ open access compliance.',
    suggestion: '',
  });

  // Check 2: OA statement URL must be accessible
  if (!data.openAccessStatementUrl) {
    results.push({
      section: 'Open Access',
      field: 'openAccessStatementUrl',
      status: 'fail',
      message: 'No URL provided for open access statement.',
      suggestion:
        'Provide a direct link to the page on your journal website where the open access statement is published.',
    });
    return results;
  }

  const scraped = await scrapeUrl(data.openAccessStatementUrl);
  if (!scraped.accessible) {
    results.push({
      section: 'Open Access',
      field: 'openAccessStatementUrl',
      status: 'warning',
      message: `Could not access ${data.openAccessStatementUrl} from our servers (may be geo-restricted).`,
      suggestion:
        'We could not verify this URL from our servers. Please manually confirm the page is publicly accessible without login.',
      url: data.openAccessStatementUrl,
    });
    return results;
  }

  // Check 3: AI verifies OA statement content
  const analysis = await analyzePageContent({
    pageText: scraped.text,
    criteria:
      'Does this page contain an open access statement that explicitly states the journal provides immediate free access to all content under an open license (Creative Commons or equivalent)?',
    url: data.openAccessStatementUrl,
  });

  results.push({
    section: 'Open Access',
    field: 'openAccessStatementUrl',
    status: analysis.found ? 'pass' : 'fail',
    message: analysis.found
      ? 'Open access statement found on the linked page.'
      : `Open access statement not clearly found. Evidence: ${analysis.evidence}`,
    suggestion: analysis.found
      ? ''
      : 'Add an explicit open access statement to this page. It must state that content is immediately accessible for free under an open license.',
    url: data.openAccessStatementUrl,
  });

  return results;
}
