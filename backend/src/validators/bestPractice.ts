import { scrapeUrl } from '../scraper/pageScraper';
import { analyzePageContent } from '../ai/aiClient';
import type { BestPracticeData } from '../types/formData';
import type { ReportItem } from '../types/report';
import { describeAccessFailure } from './shared';

const AI_POLICY_SUGGESTION =
  'DOAJ recommends a public policy on the use of AI and automated tools by authors, reviewers, and editors (e.g. disclosure requirements, whether reviewers may upload manuscripts to AI tools, and who is accountable for the content).';

/**
 * DOAJ Guide v2.9, "Best practices": a policy on AI and automated tools for
 * authors, reviewers and editors. A "should" item, so it never fails.
 */
async function checkAiPolicy(url: string, language?: string): Promise<ReportItem> {
  const base = { section: 'Best Practice', field: 'aiPolicyUrl' } as const;
  if (!url) {
    return {
      ...base,
      status: 'warning',
      message: 'No policy on AI and automated tools declared.',
      suggestion: AI_POLICY_SUGGESTION,
    };
  }
  const scraped = await scrapeUrl(url);
  if (!scraped.accessible) {
    const failure = describeAccessFailure(url, scraped);
    return { ...base, status: 'warning', message: failure.message, suggestion: failure.suggestion, url };
  }
  const analysis = await analyzePageContent({
    pageText: scraped.text,
    criteria:
      'Does this page state a policy on the use of AI or automated tools (e.g. generative AI, large language models) in the journal, covering authors and ideally also reviewers and editors?',
    url,
    language,
  });
  if (analysis.found) {
    return {
      ...base,
      status: 'pass',
      message: `A policy on AI and automated tools was found at ${url}.`,
      suggestion: '',
      url,
      confidence: analysis.confidence,
      evidence: analysis.evidence,
    };
  }
  return {
    ...base,
    status: 'warning',
    message: analysis.skipped
      ? `The page is accessible, but AI verification of its content could not run. ${analysis.evidence}`
      : `No AI and automated tools policy found at ${url}. ${analysis.evidence}`,
    suggestion: AI_POLICY_SUGGESTION,
    url,
    confidence: analysis.skipped ? undefined : analysis.confidence,
    evidence: analysis.skipped ? undefined : analysis.evidence,
  };
}

export async function validateBestPractice(
  data: BestPracticeData,
  language?: string
): Promise<ReportItem[]> {
  const results: ReportItem[] = [];

  // Check: Long-term archiving (recommended)
  if (!data.archivingServices || data.archivingServices.length === 0) {
    results.push({
      section: 'Best Practice',
      field: 'archivingServices',
      status: 'warning',
      message: 'No long-term archiving or preservation service declared.',
      suggestion:
        'DOAJ recommends that journal content is preserved in a long-term digital archive such as CLOCKSS, LOCKSS, PKP PN, Portico, or a national library.',
    });
  } else {
    results.push({
      section: 'Best Practice',
      field: 'archivingServices',
      status: 'pass',
      message: `Content is preserved via: ${data.archivingServices.join(', ')}.`,
      suggestion: '',
    });
  }

  // Check: Repository deposit policy (recommended)
  if (!data.repositoryPolicies || data.repositoryPolicies.length === 0) {
    results.push({
      section: 'Best Practice',
      field: 'repositoryPolicies',
      status: 'warning',
      message: 'No repository deposit policy declared.',
      suggestion:
        'DOAJ recommends a clear policy on whether authors may deposit article versions in repositories (e.g. institutional, subject, or a registry such as Sherpa Romeo).',
    });
  } else {
    results.push({
      section: 'Best Practice',
      field: 'repositoryPolicies',
      status: 'pass',
      message: `Repository deposit policy declared: ${data.repositoryPolicies.join(', ')}.`,
      suggestion: '',
    });
  }

  // Check: Persistent identifier scheme (recommended)
  if (!data.persistentIdentifiers || data.persistentIdentifiers.length === 0) {
    results.push({
      section: 'Best Practice',
      field: 'persistentIdentifiers',
      status: 'warning',
      message: 'No persistent identifier scheme declared.',
      suggestion:
        'DOAJ recommends using persistent identifiers such as DOI, ARK, or Handle so articles remain reachable long-term.',
    });
  } else {
    results.push({
      section: 'Best Practice',
      field: 'persistentIdentifiers',
      status: 'pass',
      message: `Persistent identifiers in use: ${data.persistentIdentifiers.join(', ')}.`,
      suggestion: '',
    });
  }

  // Check: Articles have DOIs (recommended)
  if (!data.articlesHaveDois) {
    results.push({
      section: 'Best Practice',
      field: 'articlesHaveDois',
      status: 'warning',
      message: 'Articles do not have DOIs or other persistent identifiers.',
      suggestion:
        'DOAJ strongly recommends that each article has a persistent identifier (e.g. DOI). DOIs ensure long-term stable links and are expected by most indexing services. Consider registering with CrossRef to obtain DOIs.',
    });
  } else {
    results.push({
      section: 'Best Practice',
      field: 'articlesHaveDois',
      status: 'pass',
      message: 'Articles have persistent identifiers (DOIs).',
      suggestion: '',
    });
  }

  // Check: Policy on AI and automated tools (recommended)
  results.push(await checkAiPolicy(data.aiPolicyUrl ?? '', language));

  return results;
}
