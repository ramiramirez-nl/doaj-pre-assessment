import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';
import { LinkField } from '../LinkField';

const inputCls =
  'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';

export function StepBusinessModel() {
  const { register, control, watch } = useFormContext<FormData>();
  const { t } = useTranslation();
  const chargesApc = watch('businessModel.chargesApc');
  const { fields, append, remove } = useFieldArray({ control, name: 'businessModel.apcFees' });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.businessModel.title')}</h2>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('businessModel.chargesApc')} />
        <span>{t('step.businessModel.chargesApc')}</span>
      </label>
      {chargesApc && (
        <div className="space-y-2 rounded-md border border-gray-200 p-3">
          <p className="text-sm font-medium text-gray-700">{t('step.businessModel.apcFees')}</p>
          {fields.map((f, idx) => (
            <div key={f.id} className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600">{t('step.businessModel.currency')}</label>
                <input
                  className={inputCls}
                  placeholder="USD"
                  {...register(`businessModel.apcFees.${idx}.currency` as const)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600">{t('step.businessModel.amount')}</label>
                <input
                  type="number"
                  className={inputCls}
                  {...register(`businessModel.apcFees.${idx}.amount` as const, { valueAsNumber: true })}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
              >
                {t('step.businessModel.removeFee')}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ currency: '', amount: 0 })}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            {t('step.businessModel.addFee')}
          </button>
        </div>
      )}
      <LinkField label={t('step.businessModel.apcInfoUrl')} {...register('businessModel.apcInfoUrl')} />
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('businessModel.providesWaiver')} />
        <span>{t('step.businessModel.providesWaiver')}</span>
      </label>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-0.5" {...register('businessModel.chargesOtherFees')} />
        <span>{t('step.businessModel.chargesOtherFees')}</span>
      </label>
    </section>
  );
}
