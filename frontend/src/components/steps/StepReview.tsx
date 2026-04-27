import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-gray-100 py-1 text-sm">
      <dt className="text-gray-600">{label}</dt>
      <dd className="col-span-2 text-gray-900">{value || <span className="text-gray-400">—</span>}</dd>
    </div>
  );
}

export function StepReview() {
  const { watch } = useFormContext<FormData>();
  const { t } = useTranslation();
  const data = watch();

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.review.title')}</h2>
      <p className="text-sm text-gray-600">{t('step.review.description')}</p>
      <div className="rounded-md border border-gray-200 p-4">
        <h3 className="mb-2 font-semibold">{t('step.review.openAccess')}</h3>
        <dl>
          <Row label={t('step.review.adheresToDefinition')} value={String(data.openAccess?.adheresToDefinition)} />
          <Row label={t('step.review.oaStatementUrl')} value={data.openAccess?.openAccessStatementUrl} />
          <Row label={t('step.review.licenseStartDate')} value={data.openAccess?.licenseStartDate} />
        </dl>
        <h3 className="mb-2 mt-4 font-semibold">{t('step.review.about')}</h3>
        <dl>
          <Row label={t('step.review.journalTitle')} value={data.about?.journalTitle} />
          <Row label={t('step.review.homepage')} value={data.about?.homepageUrl} />
          <Row label={t('step.review.issnOnline')} value={data.about?.issnOnline} />
          <Row label={t('step.review.issnPrint')} value={data.about?.issnPrint} />
          <Row label={t('step.review.publisher')} value={data.about?.publisherName} />
        </dl>
        <h3 className="mb-2 mt-4 font-semibold">{t('step.review.copyright')}</h3>
        <dl>
          <Row label={t('step.review.licenses')} value={data.copyright?.licenses?.join(', ')} />
          <Row label={t('step.review.licenseInfoUrl')} value={data.copyright?.licenseInfoUrl} />
        </dl>
        <h3 className="mb-2 mt-4 font-semibold">{t('step.review.editorial')}</h3>
        <dl>
          <Row label={t('step.review.peerReviewTypes')} value={data.editorial?.peerReviewTypes?.join(', ')} />
          <Row label={t('step.review.editorialBoardUrl')} value={data.editorial?.editorialBoardUrl} />
          <Row label={t('step.review.aimsAndScopeUrl')} value={data.editorial?.aimsAndScopeUrl} />
        </dl>
        <h3 className="mb-2 mt-4 font-semibold">{t('step.review.businessModel')}</h3>
        <dl>
          <Row label={t('step.review.chargesApc')} value={String(data.businessModel?.chargesApc)} />
          <Row label={t('step.review.apcInfoUrl')} value={data.businessModel?.apcInfoUrl} />
        </dl>
        <h3 className="mb-2 mt-4 font-semibold">{t('step.review.bestPractice')}</h3>
        <dl>
          <Row label={t('step.review.archiving')} value={data.bestPractice?.archivingServices?.join(', ')} />
          <Row label={t('step.review.pids')} value={data.bestPractice?.persistentIdentifiers?.join(', ')} />
        </dl>
      </div>
    </section>
  );
}
