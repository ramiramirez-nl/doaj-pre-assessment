import { scrapeUrl } from '../scraper/pageScraper';
import type { BusinessModelData } from '../types/formData';
import type { ReportItem } from '../types/report';

export async function validateBusinessModel(
  data: BusinessModelData
): Promise<ReportItem[]> {
  const results: ReportItem[] = [];

  if (!data.chargesApc) {
    results.push({
      section: 'Business Model',
      field: 'chargesApc',
      status: 'pass',
      message: 'Journal does not charge APCs (Article Processing Charges).',
      suggestion: '',
    });
  } else {
    results.push({
      section: 'Business Model',
      field: 'chargesApc',
      status: 'pass',
      message: 'Journal charges APCs.',
      suggestion:
        'APCs are allowed by DOAJ but must be disclosed transparently on the journal website.',
    });

    // If charges APC, must provide info URL
    if (!data.apcInfoUrl) {
      results.push({
        section: 'Business Model',
        field: 'apcInfoUrl',
        status: 'fail',
        message: 'No APC information URL provided.',
        suggestion:
          'If your journal charges APCs, you must publish a clear, public page describing fees, currencies, and any waiver policy.',
      });
    } else {
      const scraped = await scrapeUrl(data.apcInfoUrl);
      if (!scraped.accessible) {
        results.push({
          section: 'Business Model',
          field: 'apcInfoUrl',
          status: 'warning',
          message: `Could not access ${data.apcInfoUrl} from our servers (may be geo-restricted).`,
          suggestion:
            'We could not verify this URL from our servers. Please manually confirm the page is publicly accessible and clearly lists APC amounts.',
          url: data.apcInfoUrl,
        });
      } else {
        results.push({
          section: 'Business Model',
          field: 'apcInfoUrl',
          status: 'pass',
          message: 'APC information page is accessible.',
          suggestion: '',
          url: data.apcInfoUrl,
        });
      }
    }

    // Waiver policy is recommended for APC journals
    if (data.providesWaiver === false) {
      results.push({
        section: 'Business Model',
        field: 'providesWaiver',
        status: 'warning',
        message: 'No APC waiver policy.',
        suggestion:
          'DOAJ recommends a waiver/discount policy for authors from low-income countries.',
      });
    } else if (data.providesWaiver === true) {
      results.push({
        section: 'Business Model',
        field: 'providesWaiver',
        status: 'pass',
        message: 'Journal offers APC waivers.',
        suggestion: '',
      });
    }
  }

  return results;
}
