import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Elapsed-time thresholds (seconds) for each phase message. The backend gives
// no intermediate feedback, so phases are estimated from typical durations:
// scraping dominates the first ~25s, then AI analysis.
const PHASES: { key: string; from: number }[] = [
  { key: 'progress.phase.starting', from: 0 },
  { key: 'progress.phase.scraping', from: 3 },
  { key: 'progress.phase.issn', from: 15 },
  { key: 'progress.phase.ai', from: 25 },
  { key: 'progress.phase.compiling', from: 60 },
];

export function AssessmentProgress() {
  const { t } = useTranslation();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const phase = [...PHASES].reverse().find((p) => elapsed >= p.from) ?? PHASES[0];
  // Asymptotic progress: approaches 95% but never completes on its own.
  const percent = Math.min(95, Math.round(100 * (1 - Math.exp(-elapsed / 40))));

  return (
    <div className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
      <div
        className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
        role="status"
        aria-label={t('progress.title')}
      />
      <h2 className="mt-4 text-lg font-semibold text-gray-900">{t('progress.title')}</h2>
      <p className="mt-1 text-sm text-gray-600" aria-live="polite">
        {t(phase.key)}
      </p>
      <div className="mx-auto mt-4 h-2 max-w-md overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {t('progress.elapsed', { seconds: elapsed })}
      </p>
      <p className="mt-4 text-xs text-gray-400">{t('progress.note')}</p>
    </div>
  );
}
