import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData, ReportResponse } from './types/form.types';
import { submitAssessment } from './api/client';
import { useMultiStepForm } from './hooks/useMultiStepForm';
import { Stepper } from './components/Stepper';
import { LanguageSelector } from './components/LanguageSelector';
import { StepOpenAccess } from './components/steps/StepOpenAccess';
import { StepAbout } from './components/steps/StepAbout';
import { StepCopyright } from './components/steps/StepCopyright';
import { StepEditorial } from './components/steps/StepEditorial';
import { StepBusinessModel } from './components/steps/StepBusinessModel';
import { StepBestPractice } from './components/steps/StepBestPractice';
import { StepReview } from './components/steps/StepReview';
import { ReportDashboard } from './components/Report/ReportDashboard';

const STEP_KEYS = [
  'steps.openAccess',
  'steps.about',
  'steps.copyright',
  'steps.editorial',
  'steps.businessModel',
  'steps.bestPractice',
  'steps.review',
] as const;

const DEFAULT_VALUES: FormData = {
  openAccess: { adheresToDefinition: false, openAccessStatementUrl: '', licenseStartDate: '' },
  about: {
    journalTitle: '',
    alternativeTitle: '',
    homepageUrl: '',
    issnPrint: '',
    issnOnline: '',
    keywords: [],
    languages: [],
    publisherName: '',
    publisherCountry: '',
  },
  copyright: {
    licenses: [],
    licenseInfoUrl: '',
    embedsLicenseInArticles: false,
    authorsRetainCopyright: false,
    copyrightTermsUrl: '',
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
  },
  businessModel: {
    chargesApc: false,
    apcFees: [],
    apcInfoUrl: '',
    providesWaiver: false,
    chargesOtherFees: false,
  },
  bestPractice: {
    archivingServices: [],
    repositoryPolicies: [],
    persistentIdentifiers: [],
  },
};

function App() {
  const { t } = useTranslation();
  const methods = useForm<FormData>({ defaultValues: DEFAULT_VALUES, mode: 'onBlur' });
  const stepper = useMultiStepForm(STEP_KEYS.length);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitAssessment(data);
      setReport(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setReport(null);
    setError(null);
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
      case 4: return <StepBusinessModel />;
      case 5: return <StepBestPractice />;
      case 6: return <StepReview />;
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
          <p
            className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
            dangerouslySetInnerHTML={{ __html: t('app.disclaimer') }}
          />
        </header>

        {report ? (
          <ReportDashboard report={report} onReset={reset} onBack={goBackToReview} />
        ) : (
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200"
            >
              <Stepper
                steps={stepLabels}
                currentStep={stepper.currentStep}
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
                    onClick={stepper.next}
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
