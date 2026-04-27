import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../types/form.types';

const ARCHIVING = ['CLOCKSS', 'LOCKSS', 'Portico', 'PMC', 'National Library', 'Internet Archive'];
const REPOSITORY = ['Pre-print allowed', 'Post-print allowed', 'Published version allowed'];
const PIDS = ['DOI', 'Handle', 'ARK', 'PURL'];

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={`cursor-pointer rounded-md border px-3 py-1 text-sm ${
              value.includes(opt)
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={value.includes(opt)}
              onChange={() => toggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export function StepBestPractice() {
  const { watch, setValue } = useFormContext<FormData>();
  const { t } = useTranslation();
  const archiving = watch('bestPractice.archivingServices') ?? [];
  const repos = watch('bestPractice.repositoryPolicies') ?? [];
  const pids = watch('bestPractice.persistentIdentifiers') ?? [];

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">{t('step.bestPractice.title')}</h2>
      <ChipGroup
        label={t('step.bestPractice.archivingServices')}
        options={ARCHIVING}
        value={archiving}
        onChange={(v) => setValue('bestPractice.archivingServices', v)}
      />
      <ChipGroup
        label={t('step.bestPractice.repositoryPolicies')}
        options={REPOSITORY}
        value={repos}
        onChange={(v) => setValue('bestPractice.repositoryPolicies', v)}
      />
      <ChipGroup
        label={t('step.bestPractice.persistentIdentifiers')}
        options={PIDS}
        value={pids}
        onChange={(v) => setValue('bestPractice.persistentIdentifiers', v)}
      />
    </section>
  );
}
