import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';
import { LinkField } from '../LinkField';
import { URL_PATTERN } from '../../utils/validation';

function useLocalizedMonths(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2000, i, 1)));
}

const inputCls =
  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';

export function StepOpenAccess() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<FormData>();
  const { t, i18n } = useTranslation();
  const MONTHS = useLocalizedMonths(i18n.language);

  const stored = watch('openAccess.licenseStartDate') ?? '';
  // Parse stored "YYYY-MM" or "YYYY" or "YYYY-MM-DD"
  const [yearPart = '', monthPart = ''] = stored.split('-');

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 1950; y--) years.push(y);

  const updateDate = (year: string, month: string) => {
    if (!year) {
      setValue('openAccess.licenseStartDate', '', { shouldDirty: true });
      return;
    }
    const val = month ? `${year}-${month.padStart(2, '0')}` : year;
    setValue('openAccess.licenseStartDate', val, { shouldDirty: true });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.openAccess.title')}</h2>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('openAccess.adheresToDefinition')} />
        <span>{t('step.openAccess.adheresToDefinition')}</span>
      </label>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('openAccess.hasNoEmbargo')} />
        <span>{t('step.openAccess.hasNoEmbargo')}</span>
      </label>
      <LinkField
        label={t('step.openAccess.statementUrl')}
        hint={t('step.openAccess.statementHint')}
        error={errors.openAccess?.openAccessStatementUrl?.message}
        {...register('openAccess.openAccessStatementUrl', {
          required: t('validation.required'),
          pattern: { value: URL_PATTERN, message: t('validation.url') },
        })}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('step.openAccess.licenseStartDate')}{' '}
          <span className="text-xs font-normal text-gray-400">{t('step.openAccess.approxOptional')}</span>
        </label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <select
            className={inputCls}
            value={yearPart}
            onChange={(e) => updateDate(e.target.value, monthPart)}
          >
            <option value="">{t('step.openAccess.selectYear')}</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
          <select
            className={inputCls}
            value={monthPart}
            onChange={(e) => updateDate(yearPart, e.target.value)}
            disabled={!yearPart}
          >
            <option value="">{t('step.openAccess.selectMonth')}</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={String(i + 1).padStart(2, '0')}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
