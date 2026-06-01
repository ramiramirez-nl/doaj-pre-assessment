import type { BestPracticeData } from '../types/formData';
import type { ReportItem } from '../types/report';

export async function validateBestPractice(
  data: BestPracticeData
): Promise<ReportItem[]> {
  const results: ReportItem[] = [];

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
