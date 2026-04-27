import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';
import { LinkField } from '../LinkField';

const LICENSES = ['CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-ND', 'CC BY-NC-SA', 'CC BY-NC-ND', 'CC0'];

export function StepCopyright() {
  const { register, watch, setValue } = useFormContext<FormData>();
  const { t } = useTranslation();
  const selected = watch('copyright.licenses') ?? [];

  const toggle = (lic: string) => {
    const next = selected.includes(lic) ? selected.filter((l) => l !== lic) : [...selected, lic];
    setValue('copyright.licenses', next);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.copyright.title')}</h2>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">{t('step.copyright.licensesUsed')}</p>
        <div className="flex flex-wrap gap-2">
          {LICENSES.map((lic) => (
            <label
              key={lic}
              className={`cursor-pointer rounded-md border px-3 py-1 text-sm ${
                selected.includes(lic)
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selected.includes(lic)}
                onChange={() => toggle(lic)}
              />
              {lic}
            </label>
          ))}
        </div>
      </div>
      <LinkField label={t('step.copyright.licenseInfoUrl')} {...register('copyright.licenseInfoUrl')} />
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('copyright.embedsLicenseInArticles')} />
        <span>{t('step.copyright.embedsLicense')}</span>
      </label>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('copyright.authorsRetainCopyright')} />
        <span>{t('step.copyright.authorsRetain')}</span>
      </label>
      <LinkField label={t('step.copyright.copyrightTermsUrl')} {...register('copyright.copyrightTermsUrl')} />
    </section>
  );
}
