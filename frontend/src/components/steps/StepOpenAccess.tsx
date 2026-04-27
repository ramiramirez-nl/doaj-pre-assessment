import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';
import { LinkField } from '../LinkField';

export function StepOpenAccess() {
  const { register } = useFormContext<FormData>();
  const { t } = useTranslation();
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.openAccess.title')}</h2>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('openAccess.adheresToDefinition')} />
        <span>{t('step.openAccess.adheresToDefinition')}</span>
      </label>
      <LinkField
        label={t('step.openAccess.statementUrl')}
        hint={t('step.openAccess.statementHint')}
        {...register('openAccess.openAccessStatementUrl')}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('step.openAccess.licenseStartDate')}</label>
        <input
          type="date"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
          {...register('openAccess.licenseStartDate')}
        />
      </div>
    </section>
  );
}
