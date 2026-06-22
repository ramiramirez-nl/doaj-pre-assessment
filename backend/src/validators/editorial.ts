import { scrapeUrl } from '../scraper/pageScraper';
import { analyzePageContent } from '../ai/aiClient';
import type { EditorialData } from '../types/formData';
import type { ReportItem } from '../types/report';
import { describeAccessFailure } from './shared';

async function checkUrl(
  url: string,
  section: string,
  field: string,
  aiCriteria: string,
  failSuggestion: string,
  language?: string
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
    const failure = describeAccessFailure(url, scraped);
    results.push({
      section,
      field,
      status: scraped.errorType === 'timeout' ? 'warning' : 'fail',
      message: failure.message,
      suggestion: failure.suggestion,
      url,
    });
    return results;
  }
  const analysis = await analyzePageContent({
    pageText: scraped.text,
    criteria: aiCriteria,
    url,
    language,
  });
  results.push({
    section,
    field,
    status: analysis.found ? 'pass' : analysis.skipped ? 'warning' : 'fail',
    message: analysis.found
      ? `Required content found at ${url}.`
      : analysis.skipped
        ? `The page is accessible, but AI verification of its content could not run. ${analysis.evidence}`
        : `Required content not found. ${analysis.evidence}`,
    suggestion: analysis.found
      ? ''
      : analysis.skipped
        ? `Verify the page content manually. ${failSuggestion}`
        : failSuggestion,
    url,
  });
  return results;
}

export async function validateEditorial(
  data: EditorialData,
  language?: string
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
    'Add a clear peer review policy page. It must state the review type and confirm at least two independent reviewers per article.',
    language
  );
  results.push(...prResults);

  // Check 3: Editorial board URL
  const boardResults = await checkUrl(
    data.editorialBoardUrl,
    'Editorial',
    'editorialBoardUrl',
    'Does this page list at least 5 editors with their names and institutional affiliations?',
    'The editorial board page must list all members with name and institutional affiliation. Minimum 5 editors recommended, ideally from different institutions.',
    language
  );
  results.push(...boardResults);

  // Check 4: Aims & Scope URL
  const aimsResults = await checkUrl(
    data.aimsAndScopeUrl,
    'Editorial',
    'aimsAndScopeUrl',
    'Does this page describe the journal\'s aims and scope clearly?',
    'Add an Aims & Scope page that clearly describes what subject areas the journal covers.',
    language
  );
  results.push(...aimsResults);

  // Check 5: Instructions for authors URL
  const instructionsResults = await checkUrl(
    data.instructionsForAuthorsUrl,
    'Editorial',
    'instructionsForAuthorsUrl',
    'Does this page provide instructions for authors on how to submit articles?',
    'Add an Instructions for Authors page with submission guidelines.',
    language
  );
  results.push(...instructionsResults);

  // Check 6: Article dates displayed (recommended)
  if (!data.articleDatesDisplayed) {
    results.push({
      section: 'Editorial',
      field: 'articleDatesDisplayed',
      status: 'warning',
      message: 'Articles do not display submission, acceptance, and publication dates.',
      suggestion:
        'DOAJ strongly recommends showing at least two of: date submitted, date accepted, date published on each article page. This is a transparency signal reviewed during evaluation.',
    });
  } else {
    results.push({
      section: 'Editorial',
      field: 'articleDatesDisplayed',
      status: 'pass',
      message: 'Articles display submission/acceptance/publication dates.',
      suggestion: '',
    });
  }

  // Check 7: Endogeny ≤ 25%
  if (data.endogenyCompliant === false) {
    results.push({
      section: 'Editorial',
      field: 'endogenyCompliant',
      status: 'fail',
      message: 'In-house authorship exceeds the 25% DOAJ threshold.',
      suggestion:
        'DOAJ requires that no more than 25% of published research articles have an author who is also an editor, editorial board member, or reviewer. Reduce in-house publishing or diversify the editorial board.',
    });
  } else {
    results.push({
      section: 'Editorial',
      field: 'endogenyCompliant',
      status: 'pass',
      message: 'In-house authorship is within the 25% DOAJ limit.',
      suggestion: '',
    });
  }

  return results;
}
