import type { BestPracticeData } from '../types/formData';
import type { ReportItem } from '../types/report';

export async function validateBestPractice(
  data: BestPracticeData
): Promise<ReportItem[]> {
  const results: ReportItem[] = [];

  // Check 1: Long-term archiving (recommended)
  if (!data.archivingServices || data.archivingServices.length === 0) {
    results.push({
      section: 'Best Practice',
      field: 'archivingServices',
      status: 'warning',
      message: 'No long-term archiving service declared.',
      suggestion:
        'DOAJ recommends content be preserved with at least one archiving service (e.g. CLOCKSS, Portico, PKP PN, LOCKSS, Internet Archive). New journals may declare "no archiving yet" but should plan for it.',
    });
  } else {
    results.push({
      section: 'Best Practice',
      field: 'archivingServices',
      status: 'pass',
      message: `Long-term archiving declared: ${data.archivingServices.join(', ')}.`,
      suggestion: '',
    });
  }

  // Check 2: Persistent identifiers (DOI, etc.)
  if (!data.persistentIdentifiers || data.persistentIdentifiers.length === 0) {
    results.push({
      section: 'Best Practice',
      field: 'persistentIdentifiers',
      status: 'warning',
      message: 'No persistent identifiers used.',
      suggestion:
        'DOAJ strongly recommends DOIs (or ARK, Handle, PURL) for all articles to ensure long-term citation stability.',
    });
  } else {
    results.push({
      section: 'Best Practice',
      field: 'persistentIdentifiers',
      status: 'pass',
      message: `Persistent identifiers declared: ${data.persistentIdentifiers.join(', ')}.`,
      suggestion: '',
    });
  }

  return results;
}
