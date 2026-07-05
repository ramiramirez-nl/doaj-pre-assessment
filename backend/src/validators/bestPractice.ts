import type { BestPracticeData } from '../types/formData';
import type { ReportItem } from '../types/report';

export async function validateBestPractice(
  data: BestPracticeData
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

  return results;
}
