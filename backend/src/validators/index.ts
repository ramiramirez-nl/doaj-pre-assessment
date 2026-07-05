import type { FormData } from '../types/formData';
import type { ReportItem, ReportResponse } from '../types/report';
import { validateOpenAccess } from './openAccess';
import { validateAbout } from './about';
import { validateEditorial } from './editorial';
import { validateCopyright } from './copyright';
import { validateEthics } from './ethics';
import { validateBusinessModel } from './businessModel';
import { validateBestPractice } from './bestPractice';
import { criteriaUrlFor } from './criteriaLinks';

export const SECTION_NAMES = [
  'Open Access',
  'About',
  'Editorial',
  'Copyright',
  'Ethics',
  'Business Model',
  'Best Practice',
];

export interface SectionResult {
  section: string;
  index: number;
  items: ReportItem[];
}

export async function runAllValidations(
  formData: FormData,
  language?: string,
  onSection?: (result: SectionResult) => void
): Promise<ReportResponse> {
  const validators: Array<Promise<ReportItem[]>> = [
    validateOpenAccess(formData.openAccess, language),
    validateAbout(formData.about),
    validateEditorial(formData.editorial, language),
    validateCopyright(formData.copyright, language),
    validateEthics(formData.ethics, language),
    validateBusinessModel(formData.businessModel),
    validateBestPractice(formData.bestPractice),
  ];

  // Each validator is wrapped so its result is decorated and emitted the
  // moment it settles (live progress via SSE); a crash degrades to a single
  // warning item instead of failing the whole assessment.
  const wrapped = validators.map((promise, i) =>
    promise
      .then(
        (items) => items,
        (reason): ReportItem[] => {
          const message =
            reason instanceof Error ? reason.message : String(reason);
          console.error(`[validator] ${SECTION_NAMES[i]} crashed:`, message);
          return [
            {
              section: SECTION_NAMES[i],
              field: 'validation',
              status: 'warning',
              message:
                'Validation for this section could not complete due to an unexpected error.',
              suggestion:
                'Please check the information in this section and try again.',
            },
          ];
        }
      )
      .then((items) => {
        // Attach the relevant DOAJ guidance link in one place so individual
        // validators stay focused on their own logic.
        const decorated = items.map((item) => ({
          ...item,
          criteriaUrl: item.criteriaUrl ?? criteriaUrlFor(item.section),
        }));
        onSection?.({ section: SECTION_NAMES[i], index: i, items: decorated });
        return decorated;
      })
  );

  const allResults: ReportItem[] = (await Promise.all(wrapped)).flat();

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
