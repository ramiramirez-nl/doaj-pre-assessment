import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReportResponse } from '../../types/form.types';
import { SummaryBanner } from './SummaryBanner';
import { IssueCard } from './IssueCard';

interface Props {
  report: ReportResponse;
  onReset: () => void;
  onBack: () => void;
}

function buildPlainText(report: ReportResponse, lang: string): string {
  const lines = [
    'DOAJ Pre-Assessment Report',
    `Generated: ${new Date().toLocaleString(lang)}`,
    '',
    `Overall Status: ${report.overallStatus.toUpperCase()}`,
    `Passed: ${report.passCount}  |  Issues: ${report.failCount}`,
    '',
    '--- Issues ---',
    ...report.issues
      .filter((i) => i.status !== 'pass')
      .map(
        (i) =>
          `[${i.status.toUpperCase()}] ${i.section} / ${i.field}\n  ${i.message}${
            i.suggestion ? '\n  Suggestion: ' + i.suggestion : ''
          }${i.url ? '\n  URL: ' + i.url : ''}`,
      ),
    '',
    '--- Disclaimer ---',
    'This report was generated using AI-assisted tools and may contain inaccuracies.',
    'All results should be independently verified before submitting an application to DOAJ.',
    'DOAJ: https://doaj.org',
  ];
  return lines.join('\n');
}

export function ReportDashboard({ report, onReset, onBack }: Props) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const issues = report.issues.filter((i) => i.status !== 'pass');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPlainText(report, i18n.language));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SummaryBanner
        status={report.overallStatus}
        passCount={report.passCount}
        failCount={report.failCount}
      />

      {issues.length === 0 ? (
        <div className="rounded-md bg-white p-6 text-center text-gray-700 shadow-sm ring-1 ring-gray-200">
          {t('report.noIssues')}
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('report.itemsNeedAttention_other', { count: issues.length })}
          </h2>
          {issues.map((item, idx) => (
            <IssueCard key={`${item.section}-${item.field}-${idx}`} item={item} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
        >
          {t('report.backToForm')}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
        >
          {copied ? t('report.copied') : t('report.copyReport')}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
        >
          {t('report.printSavePdf')}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          {t('report.newAssessment')}
        </button>
      </div>
    </div>
  );
}
