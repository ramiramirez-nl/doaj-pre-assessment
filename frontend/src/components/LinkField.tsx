import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface LinkFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const LinkField = forwardRef<HTMLInputElement, LinkFieldProps>(
  function LinkField({ label, hint, error, value, ...rest }, ref) {
    const { t } = useTranslation();
    const url = typeof value === 'string' ? value : '';
    const canOpen = /^https?:\/\//i.test(url);
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-2">
          <input
            ref={ref}
            type="url"
            value={value as string | number | readonly string[] | undefined}
            placeholder="https://example.com/..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            {...rest}
          />
          <button
            type="button"
            disabled={!canOpen}
            onClick={() => canOpen && window.open(url, '_blank', 'noopener')}
            className="shrink-0 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-40"
          >
            {t('linkField.openLink')}
          </button>
        </div>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
