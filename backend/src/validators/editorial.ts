import { scrapeUrl } from '../scraper/pageScraper';
import { analyzePageContent } from '../ai/geminiClient';
import type { EditorialData } from '../types/formData';
import type { ReportItem } from '../types/report';

async function checkUrl(
  url: string,
  section: string,
  field: string,
  aiCriteria: string,
  failSuggestion: string
): Promise<ReportItem[]> {
  const results: ReportItem[] = [];
  if (!url) {
    results.push({
      section,
      field,
      status: 'fail',
      message: `No URL provided for ${field}.`,
      suggestion: failSuggestion,
    });
    return results;
  }
  const scraped = await scrapeUrl(url);
  if (!scraped.accessible) {
    results.push({
      section,
      field,
      status: 'fail',
      message: `URL ${url} is not accessible.`,
      suggestion: 'Ensure the page is publicly accessible without login.',
      url,
    });
    return results;
  }
  const analysis = await analyzePageContent({
    pageText: scraped.text,
    criteria: aiCriteria,
    url,
  });
  results.push({
    section,
    field,
    status: analysis.found ? 'pass' : 'fail',
    message: analysis.found
      ? `Required content found at ${url}.`
      : `Required content not found. ${analysis.evidence}`,
    suggestion: analysis.found ? '' : failSuggestion,
    url,
  });
  return results;
}

export async function validateEditorial(
  data: EditorialData
): Promise<ReportItem[]> {
  const results: ReportItem[] = [];

  // Check 1: Peer review type must be selected
  if (data.peerReviewTypes.length === 0) {
    results.push({
      section: 'Editorial',
      field: 'peerReviewTypes',
      status: 'fail',
      message: 'No peer review type selected.',
      suggestion:
        'DOAJ requires all articles to pass through peer review. Select the type(s) used and describe the process on your website.',
    });
  } else {
    results.push({
      section: 'Editorial',
      field: 'peerReviewTypes',
      status: 'pass',
      message: `Peer review type(s) declared: ${data.peerReviewTypes.join(', ')}.`,
      suggestion: '',
    });
  }

  // Check 2: Peer review policy URL
  const prResults = await checkUrl(
    data.peerReviewPolicyUrl,
    'Editorial',
    'peerReviewPolicyUrl',
    'Does this page clearly describe the peer review process, including the type of review and that at least two independent reviewers evaluate each article?',
    'Add a clear peer review policy page. It must state the review type and confirm at least two independent reviewers per article.'
  );
  results.push(...prResults);

  // Check 3: Editorial board URL
  const boardResults = await checkUrl(
    data.editorialBoardUrl,
    'Editorial',
    'editorialBoardUrl',
    'Does this page list at least 5 editors with their names and institutional affiliations?',
    'The editorial board page must list all members with name and institutional affiliation. Minimum 5 editors recommended, ideally from different institutions.'
  );
  results.push(...boardResults);

  // Check 4: Aims & Scope URL
  const aimsResults = await checkUrl(
    data.aimsAndScopeUrl,
    'Editorial',
    'aimsAndScopeUrl',
    'Does this page describe the journal\'s aims and scope clearly?',
    'Add an Aims & Scope page that clearly describes what subject areas the journal covers.'
  );
  results.push(...aimsResults);

  // Check 5: Instructions for authors URL
  const instructionsResults = await checkUrl(
    data.instructionsForAuthorsUrl,
    'Editorial',
    'instructionsForAuthorsUrl',
    'Does this page provide instructions for authors on how to submit articles?',
    'Add an Instructions for Authors page with submission guidelines.'
  );
  results.push(...instructionsResults);

  return results;
}
