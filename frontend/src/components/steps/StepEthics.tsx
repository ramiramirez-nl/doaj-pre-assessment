import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';
import { LinkField } from '../LinkField';

export function StepEthics() {
  const { register } = useFormContext<FormData>();
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.ethics.title')}</h2>
      <p className="text-sm text-gray-600">{t('step.ethics.description')}</p>

      <LinkField
        label={t('step.ethics.publicationEthicsUrl')}
        hint={t('step.ethics.publicationEthicsHint')}
        {...register('ethics.publicationEthicsUrl')}
      />

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('ethics.hasRetractionsPolicy')} />
        <span>{t('step.ethics.hasRetractionsPolicy')}</span>
      </label>
      <p className="text-xs text-gray-500">{t('step.ethics.retractionHint')}</p>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('ethics.hasConflictPolicy')} />
        <span>{t('step.ethics.hasConflictPolicy')}</span>
      </label>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('ethics.indexingClaimsVerifiable')} />
        <span>{t('step.ethics.indexingClaimsVerifiable')}</span>
      </label>
      <p className="text-xs text-gray-500">{t('step.ethics.indexingClaimsHint')}</p>

      <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-2">
        <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">{t('step.ethics.misleadingMetricsTitle')}</p>
        <p className="text-xs text-red-700">{t('step.ethics.misleadingMetricsExplain')}</p>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" className="mt-0.5" {...register('ethics.noMisleadingMetrics')} />
          <span className="font-medium">{t('step.ethics.noMisleadingMetrics')}</span>
        </label>
      </div>
    </section>
  );
}
