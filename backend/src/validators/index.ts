import type { FormData } from '../types/formData';
import type { ReportItem, ReportResponse } from '../types/report';
import { validateOpenAccess } from './openAccess';
import { validateAbout } from './about';
import { validateEditorial } from './editorial';
import { validateCopyright } from './copyright';
import { validateBusinessModel } from './businessModel';
import { validateBestPractice } from './bestPractice';

export async function runAllValidations(
  formData: FormData
): Promise<ReportResponse> {
  const [
    oaResults,
    aboutResults,
    editorialResults,
    copyrightResults,
    businessResults,
    bestPracticeResults,
  ] = await Promise.all([
    validateOpenAccess(formData.openAccess),
    validateAbout(formData.about),
    validateEditorial(formData.editorial),
    validateCopyright(formData.copyright),
    validateBusinessModel(formData.businessModel),
    validateBestPractice(formData.bestPractice),
  ]);

  const allResults: ReportItem[] = [
    ...oaResults,
    ...aboutResults,
    ...editorialResults,
    ...copyrightResults,
    ...businessResults,
    ...bestPracticeResults,
  ];

  const failCount = allResults.filter((r) => r.status === 'fail').length;
  const warningCount = allResults.filter((r) => r.status === 'warning').length;
  const passCount = allResults.filter((r) => r.status === 'pass').length;
  const issues = allResults.filter((r) => r.status !== 'pass');

  // Overall status: fail if any FAIL, warning if any WARNING, otherwise pass
  const overallStatus =
    failCount > 0 ? 'fail' : warningCount > 0 ? 'warning' : 'pass';

  return {
    overallStatus,
    passCount,
    failCount,
    warningCount,
    items: allResults,
    issues,
  };
}
