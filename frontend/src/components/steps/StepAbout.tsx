import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';
import { LinkField } from '../LinkField';
import { LANGUAGES } from '../../data/languages';
import { COUNTRIES } from '../../data/countries';

const inputCls =
  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';

export function StepAbout() {
  const { register, setValue, watch } = useFormContext<FormData>();
  const { t } = useTranslation();
  const keywords = watch('about.keywords') ?? [];
  const languages = watch('about.languages') ?? [];

  const toggleLanguage = (lang: string) => {
    const next = languages.includes(lang)
      ? languages.filter((l) => l !== lang)
      : [...languages, lang];
    setValue('about.languages', next, { shouldDirty: true });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.about.title')}</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('step.about.journalTitle')}</label>
        <input className={inputCls} {...register('about.journalTitle')} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('step.about.alternativeTitle')}</label>
        <input className={inputCls} {...register('about.alternativeTitle')} />
      </div>
      <LinkField label={t('step.about.homepageUrl')} {...register('about.homepageUrl')} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('step.about.issnPrint')}</label>
          <input className={inputCls} placeholder="1234-5678" {...register('about.issnPrint')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('step.about.issnOnline')}</label>
          <input className={inputCls} placeholder="1234-5678" {...register('about.issnOnline')} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('step.about.keywords')}</label>
        <input
          className={inputCls}
          defaultValue={keywords.join(', ')}
          onChange={(e) =>
            setValue('about.keywords', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('step.about.languages')}
        </label>
        <p className="text-xs text-gray-500 mb-2">
          {languages.length > 0
            ? languages.join(', ')
            : 'Select one or more from the list below.'}
        </p>
        <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 p-2 grid grid-cols-2 gap-x-4 gap-y-1">
          {LANGUAGES.map((lang) => (
            <label key={lang} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={languages.includes(lang)}
                onChange={() => toggleLanguage(lang)}
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('step.about.publisherName')}</label>
          <input className={inputCls} {...register('about.publisherName')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('step.about.publisherCountry')}</label>
          <select className={inputCls} {...register('about.publisherCountry')}>
            <option value="">— Select country —</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
