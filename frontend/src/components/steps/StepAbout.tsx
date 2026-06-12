import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';
import { LinkField } from '../LinkField';
import { ChipInput } from '../ChipInput';
import { URL_PATTERN, ISSN_PATTERN } from '../../utils/validation';

const inputCls =
  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export function StepAbout() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<FormData>();
  const { t } = useTranslation();

  const issnRule = (value: string | undefined) =>
    !value || ISSN_PATTERN.test(value) || t('validation.issn');

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.about.title')}</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('step.about.journalTitle')}</label>
        <input
          className={inputCls}
          {...register('about.journalTitle', { required: t('validation.required') })}
        />
        <FieldError message={errors.about?.journalTitle?.message} />
      </div>
      <LinkField
        label={t('step.about.homepageUrl')}
        hint={t('step.about.homepageHint')}
        error={errors.about?.homepageUrl?.message}
        {...register('about.homepageUrl', {
          required: t('validation.required'),
          pattern: { value: URL_PATTERN, message: t('validation.url') },
        })}
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('step.about.issnPrint')}</label>
          <input
            className={inputCls}
            placeholder="1234-5678"
            {...register('about.issnPrint', { validate: issnRule })}
          />
          <FieldError message={errors.about?.issnPrint?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('step.about.issnOnline')}</label>
          <input
            className={inputCls}
            placeholder="1234-5678"
            {...register('about.issnOnline', {
              validate: {
                format: issnRule,
                atLeastOne: (value, formValues) =>
                  Boolean(value) ||
                  Boolean(formValues.about.issnPrint) ||
                  t('validation.issnRequired'),
              },
            })}
          />
          <FieldError message={errors.about?.issnOnline?.message} />
        </div>
      </div>
    </section>
  );
}
