import type { FormData } from '../types/formData';
import type { ReportItem, ReportResponse } from '../types/report';
import { validateOpenAccess } from './openAccess';
import { validateAbout } from './about';
import { validateEditorial } from './editorial';

export async function runAllValidations(
  formData: FormData
): Promise<ReportResponse> {
  const [oaResults, aboutResults, editorialResults] = await Promise.all([
    validateOpenAccess(formData.openAccess),
    validateAbout(formData.about),
    validateEditorial(formData.editorial),
  ]);

  const allResults: ReportItem[] = [
    ...oaResults,
    ...aboutResults,
    ...editorialResults,
  ];

  const failCount = allResults.filter((r) => r.status === 'fail').length;
  const passCount = allResults.filter((r) => r.status === 'pass').length;
  const issues = allResults.filter((r) => r.status !== 'pass');

  return {
    overallStatus: failCount > 0 ? 'fail' : 'pass',
    passCount,
    failCount,
    issues,
  };
}
