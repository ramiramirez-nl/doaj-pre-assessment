import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';
import { LinkField } from '../LinkField';

const PEER_REVIEW_TYPES = [
  'Editorial review',
  'Peer review',
  'Anonymous peer review',
  'Double anonymous peer review',
  'Open peer review',
  'Post-publication peer review',
];

const inputCls =
  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';

export function StepEditorial() {
  const { register, watch, setValue } = useFormContext<FormData>();
  const { t } = useTranslation();
  const selected = watch('editorial.peerReviewTypes') ?? [];

  const toggle = (type: string) => {
    const next = selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type];
    setValue('editorial.peerReviewTypes', next);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.editorial.title')}</h2>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">{t('step.editorial.peerReviewTypes')}</p>
        <div className="flex flex-wrap gap-2">
          {PEER_REVIEW_TYPES.map((type) => (
            <label
              key={type}
              className={`cursor-pointer rounded-md border px-3 py-1 text-sm ${
                selected.includes(type)
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selected.includes(type)}
                onChange={() => toggle(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>
      <LinkField label={t('step.editorial.peerReviewPolicyUrl')} {...register('editorial.peerReviewPolicyUrl')} />
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('editorial.screensPlagiarism')} />
        <span>{t('step.editorial.screensPlagiarism')}</span>
      </label>
      <LinkField label={t('step.editorial.plagiarismPolicyUrl')} {...register('editorial.plagiarismPolicyUrl')} />
      <LinkField label={t('step.editorial.aimsAndScopeUrl')} {...register('editorial.aimsAndScopeUrl')} />
      <LinkField label={t('step.editorial.editorialBoardUrl')} {...register('editorial.editorialBoardUrl')} />
      <LinkField label={t('step.editorial.instructionsForAuthorsUrl')} {...register('editorial.instructionsForAuthorsUrl')} />
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('step.editorial.avgWeeks')}</label>
        <input
          type="number"
          min={0}
          className={inputCls}
          {...register('editorial.avgWeeksSubmissionToPublication', { valueAsNumber: true })}
        />
      </div>
    </section>
  );
}
