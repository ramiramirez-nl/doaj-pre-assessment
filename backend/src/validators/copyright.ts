import { scrapeUrl } from '../scraper/pageScraper';
import { analyzePageContent } from '../ai/geminiClient';
import type { CopyrightData } from '../types/formData';
import type { ReportItem } from '../types/report';

const ACCEPTED_LICENSES = [
  'CC BY',
  'CC BY-SA',
  'CC BY-ND',
  'CC BY-NC',
  'CC BY-NC-SA',
  'CC BY-NC-ND',
  'CC0',
  'Public Domain',
];

export async function validateCopyright(
  data: CopyrightData
): Promise<ReportItem[]> {
  const results: ReportItem[] = [];

  // Check 1: At least one CC license must be selected
  if (!data.licenses || data.licenses.length === 0) {
    results.push({
      section: 'Copyright',
      field: 'licenses',
      status: 'fail',
      message: 'No license selected.',
      suggestion:
        'DOAJ requires journals to apply a Creative Commons license (or equivalent open license) to all published content. Select at least one CC license (CC BY recommended).',
    });
  } else {
    const hasAcceptedLicense = data.licenses.some((lic) =>
      ACCEPTED_LICENSES.some((accepted) =>
        lic.toUpperCase().includes(accepted.toUpperCase().replace('CC ', ''))
      )
    );
    if (hasAcceptedLicense) {
      results.push({
        section: 'Copyright',
        field: 'licenses',
        status: 'pass',
        message: `Open license declared: ${data.licenses.join(', ')}.`,
        suggestion: '',
      });
    } else {
      results.push({
        section: 'Copyright',
        field: 'licenses',
        status: 'warning',
        message: `Selected license(s) "${data.licenses.join(', ')}" may not match a recognised CC license.`,
        suggestion:
          'DOAJ prefers Creative Commons licenses. Verify your license matches one of: CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA, CC BY-ND, CC BY-NC-ND, or CC0.',
      });
    }
  }

  // Check 2: License info URL accessibility + content
  if (!data.licenseInfoUrl) {
    results.push({
      section: 'Copyright',
      field: 'licenseInfoUrl',
      status: 'fail',
      message: 'No URL provided for license information page.',
      suggestion:
        'Provide a URL to a page on your journal website that explains the license under which articles are published.',
    });
  } else {
    const scraped = await scrapeUrl(data.licenseInfoUrl);
    if (!scraped.accessible) {
      results.push({
        section: 'Copyright',
        field: 'licenseInfoUrl',
        status: 'warning',
        message: `Could not access ${data.licenseInfoUrl} from our servers (may be geo-restricted).`,
        suggestion:
          'We could not verify this URL from our servers. Please manually confirm the page is publicly accessible and explains the license terms.',
        url: data.licenseInfoUrl,
      });
    } else {
      const analysis = await analyzePageContent({
        pageText: scraped.text,
        criteria:
          'Does this page clearly state the Creative Commons (or equivalent open) license under which the journal publishes articles?',
        url: data.licenseInfoUrl,
      });
      results.push({
        section: 'Copyright',
        field: 'licenseInfoUrl',
        status: analysis.found ? 'pass' : 'fail',
        message: analysis.found
          ? 'License information page clearly states the license.'
          : `License terms not clearly stated. ${analysis.evidence}`,
        suggestion: analysis.found
          ? ''
          : 'Update the page to explicitly name the Creative Commons license used (e.g. "All articles are published under CC BY 4.0").',
        url: data.licenseInfoUrl,
      });
    }
  }

  // Check 3: License must be embedded in articles
  if (data.embedsLicenseInArticles === false) {
    results.push({
      section: 'Copyright',
      field: 'embedsLicenseInArticles',
      status: 'fail',
      message: 'License is not embedded in published articles.',
      suggestion:
        'DOAJ requires the license to appear on or in every article (e.g. on the article landing page and inside the PDF).',
    });
  } else if (data.embedsLicenseInArticles === true) {
    results.push({
      section: 'Copyright',
      field: 'embedsLicenseInArticles',
      status: 'pass',
      message: 'License is embedded in articles.',
      suggestion: '',
    });
  }

  // Check 4: Authors must retain copyright
  if (data.authorsRetainCopyright === false) {
    results.push({
      section: 'Copyright',
      field: 'authorsRetainCopyright',
      status: 'warning',
      message: 'Authors do not retain copyright.',
      suggestion:
        'DOAJ recommends authors retain copyright without restrictions. Many journals require authors to transfer copyright; review your policy.',
    });
  } else if (data.authorsRetainCopyright === true) {
    results.push({
      section: 'Copyright',
      field: 'authorsRetainCopyright',
      status: 'pass',
      message: 'Authors retain copyright.',
      suggestion: '',
    });
  }

  // Check 5: Copyright terms URL (optional but helpful)
  if (data.copyrightTermsUrl) {
    const scraped = await scrapeUrl(data.copyrightTermsUrl);
    if (!scraped.accessible) {
      results.push({
        section: 'Copyright',
        field: 'copyrightTermsUrl',
        status: 'warning',
        message: `Could not access ${data.copyrightTermsUrl} from our servers (may be geo-restricted).`,
        suggestion:
          'We could not verify this URL from our servers. Please manually confirm the page is publicly accessible.',
        url: data.copyrightTermsUrl,
      });
    } else {
      results.push({
        section: 'Copyright',
        field: 'copyrightTermsUrl',
        status: 'pass',
        message: 'Copyright terms page is accessible.',
        suggestion: '',
        url: data.copyrightTermsUrl,
      });
    }
  }

  return results;
}
