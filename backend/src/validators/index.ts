import type { FormData } from '../types/formData';
import type { ReportItem, ReportResponse } from '../types/report';
import { validateOpenAccess } from './openAccess';
import { validateAbout } from './about';
import { validateEditorial } from './editorial';
import { validateCopyright } from './copyright';
import { validateEthics } from './ethics';
import { validateBusinessModel } from './businessModel';
import { validateBestPractice } from './bestPractice';

const SECTION_NAMES = [
  'Open Access',
  'About',
  'Editorial',
  'Copyright',
  'Ethics',
  'Business Model',
  'Best Practice',
];

export async function runAllValidations(
  formData: FormData,
  language?: string
): Promise<ReportResponse> {
  const settled = await Promise.allSettled([
    validateOpenAccess(formData.openAccess, language),
    validateAbout(formData.about),
    validateEditorial(formData.editorial, language),
    validateCopyright(formData.copyright, language),
    validateEthics(formData.ethics, language),
    validateBusinessModel(formData.businessModel),
    validateBestPractice(formData.bestPractice),
  ]);

  const allResults: ReportItem[] = [];
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value);
    } else {
      const reason = result.reason instanceof Error
        ? result.reason.message
        : String(result.reason);
      console.error(`[validator] ${SECTION_NAMES[i]} crashed:`, reason);
      allResults.push({
        section: SECTION_NAMES[i],
        field: 'validation',
        status: 'warning',
        message: 'Validation for this section could not complete due to an unexpected error.',
        suggestion: 'Please check the information in this section and try again.',
      });
    }
  });

  const failCount = allResults.filter((r) => r.status === 'fail').length;
  const warningCount = allResults.filter((r) => r.status === 'warning').length;
  const passCount = allResults.filter((r) => r.status === 'pass').length;
  const issues = allResults.filter((r) => r.status !== 'pass');

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
