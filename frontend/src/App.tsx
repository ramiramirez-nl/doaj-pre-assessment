import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, type FieldErrors, type FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData, ReportResponse } from './types/form.types';
import { submitAssessment } from './api/client';
import { useMultiStepForm } from './hooks/useMultiStepForm';
import { loadDraft, saveDraft, clearDraft } from './utils/draft';
import { Stepper } from './components/Stepper';
import { LanguageSelector } from './components/LanguageSelector';
import { AssessmentProgress } from './components/AssessmentProgress';
import { StepOpenAccess } from './components/steps/StepOpenAccess';
import { StepAbout } from './components/steps/StepAbout';
import { StepCopyright } from './components/steps/StepCopyright';
import { StepEditorial } from './components/steps/StepEditorial';
import { StepBusinessModel } from './components/steps/StepBusinessModel';
import { StepEthics } from './components/steps/StepEthics';
import { StepBestPractice } from './components/steps/StepBestPractice';
import { StepReview } from './components/steps/StepReview';
import { ReportDashboard } from './components/Report/ReportDashboard';

const STEP_KEYS = [
  'steps.openAccess',
  'steps.about',
  'steps.copyright',
  'steps.editorial',
  'steps.ethics',
  'steps.businessModel',
  'steps.bestPractice',
  'steps.review',
] as const;

// Fields validated when leaving each step (and used to map errors to steps).
const STEP_FIELDS: FieldPath<FormData>[][] = [
  ['openAccess.openAccessStatementUrl'],
  ['about.journalTitle', 'about.homepageUrl', 'about.issnPrint', 'about.issnOnline'],
  ['copyright.licenseInfoUrl', 'copyright.copyrightTermsUrl'],
  [
    'editorial.peerReviewPolicyUrl',
    'editorial.aimsAndScopeUrl',
    'editorial.editorialBoardUrl',
    'editorial.instructionsForAuthorsUrl',
    'editorial.plagiarismPolicyUrl',
  ],
  ['businessModel.apcInfoUrl'],
  [],
  [],
];

const DEFAULT_VALUES: FormData = {
  openAccess: { adheresToDefinition: false, hasNoEmbargo: false, openAccessStatementUrl: '', licenseStartDate: '' },
  about: {
    journalTitle: '',
    homepageUrl: '',
    issnPrint: '',
    issnOnline: '',
  },
  copyright: {
    licenses: [],
    licenseInfoUrl: '',
    embedsLicenseInArticles: false,
    authorsRetainCopyright: false,
    copyrightTermsUrl: '',
    licenseConsistentOnArticlePages: false,
    licenseConsistentInPdfs: false,
    noCopyrightConflicts: false,
  },
  editorial: {
    peerReviewTypes: [],
    peerReviewPolicyUrl: '',
    screensPlagiarism: false,
    plagiarismPolicyUrl: '',
    aimsAndScopeUrl: '',
    editorialBoardUrl: '',
    instructionsForAuthorsUrl: '',
    avgWeeksSubmissionToPublication: 0,
    endogenyCompliant: false,
    articleDatesDisplayed: false,
  },
  ethics: {
    publicationEthicsUrl: '',
    hasRetractionsPolicy: false,
    hasConflictPolicy: false,
    noMisleadingMetrics: false,
    indexingClaimsVerifiable: false,
  },
  businessModel: {
    chargesApc: false,
    apcFees: [],
    apcInfoUrl: '',
    providesWaiver: false,
    chargesOtherFees: false,
    otherFeesInfoUrl: '',
  },
  bestPractice: {
    archivingServices: [],
    repositoryPolicies: [],
    persistentIdentifiers: [],
    articlesHaveDois: false,
  },
};

function fieldError(errors: FieldErrors<FormData>, path: string): boolean {
  let node: unknown = errors;
  for (const key of path.split('.')) {
    if (!node || typeof node !== 'object') return false;
    node = (node as Record<string, unknown>)[key];
  }
  return Boolean(node);
}

function App() {
  const { t } = useTranslation();
  const [initialDraft] = useState(() => loadDraft(DEFAULT_VALUES));
  const [draftNotice, setDraftNotice] = useState(initialDraft !== null);
  const methods = useForm<FormData>({
    defaultValues: initialDraft ?? DEFAULT_VALUES,
    mode: 'onBlur',
  });
  const stepper = useMultiStepForm(STEP_KEYS.length);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Persist the form as a draft (debounced) so a refresh never loses work.
  useEffect(() => {
    const subscription = methods.watch((values) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveDraft(values), 500);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [methods]);

  const { errors } = methods.formState;
  const errorSteps = STEP_FIELDS.flatMap((fields, idx) =>
    fields.some((f) => fieldError(errors, f)) ? [idx] : [],
  );

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitAssessment(data);
      setReport(result);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  // When submit is blocked by validation, jump to the first step with errors.
  const onInvalid = (errs: FieldErrors<FormData>) => {
    const idx = STEP_FIELDS.findIndex((fields) => fields.some((f) => fieldError(errs, f)));
    if (idx >= 0) stepper.goTo(idx);
  };

  const handleNext = async () => {
    const fields = STEP_FIELDS[stepper.currentStep];
    const valid = fields.length === 0 || (await methods.trigger(fields));
    if (valid) stepper.next();
  };

  const reset = () => {
    setReport(null);
    setError(null);
    clearDraft();
    setDraftNotice(false);
    methods.reset(DEFAULT_VALUES);
    stepper.goTo(0);
  };

  const handleClearDraft = () => {
    clearDraft();
    setDraftNotice(false);
    methods.reset(DEFAULT_VALUES);
    stepper.goTo(0);
  };

  const goBackToReview = () => {
    setReport(null);
    setError(null);
    stepper.goTo(STEP_KEYS.length - 1);
  };

  const stepLabels = STEP_KEYS.map((k) => t(k));

  const renderStep = () => {
    switch (stepper.currentStep) {
      case 0: return <StepOpenAccess />;
      case 1: return <StepAbout />;
      case 2: return <StepCopyright />;
      case 3: return <StepEditorial />;
      case 4: return <StepEthics />;
      case 5: return <StepBusinessModel />;
      case 6: return <StepBestPractice />;
      case 7: return <StepReview />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('app.title')}</h1>
              <p className="mt-1 text-sm text-gray-600">{t('app.subtitle')}</p>
            </div>
            <LanguageSelector />
          </div>
        </header>

        {report ? (
          <ReportDashboard report={report} onReset={reset} onBack={goBackToReview} />
        ) : submitting ? (
          <AssessmentProgress />
        ) : (
          <FormProvider {...methods}>
            {draftNotice && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                <span>{t('draft.restored')}</span>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-300 hover:bg-blue-100"
                >
                  {t('draft.clear')}
                </button>
              </div>
            )}
            <form
              onSubmit={methods.handleSubmit(onSubmit, onInvalid)}
              className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200"
            >
              <Stepper
                steps={stepLabels}
                currentStep={stepper.currentStep}
                errorSteps={errorSteps}
                onStepClick={stepper.goTo}
              />
              {renderStep()}
              {error && (
                <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
              )}
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={stepper.prev}
                  disabled={stepper.isFirst}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                >
                  {t('nav.back')}
                </button>
                {stepper.isLast ? (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? t('nav.submitting') : t('nav.submit')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {t('nav.next')}
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
}

export default App;
