interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex flex-wrap gap-2">
        {steps.map((label, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          const base =
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition';
          const cls = isActive
            ? 'bg-blue-600 text-white'
            : isDone
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => onStepClick?.(idx)}
                className={`${base} ${cls}`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-xs">
                  {idx + 1}
                </span>
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
