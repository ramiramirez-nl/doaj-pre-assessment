interface FormStepperProps {
  currentStep: number;
  onGoTo: (step: number) => void;
}

const STEPS = [
  'Open Access',
  'About',
  'Copyright',
  'Editorial',
  'Business Model',
  'Best Practice',
  'Review',
];

export function FormStepper({ currentStep, onGoTo }: FormStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-col items-center flex-1">
            <button
              onClick={() => onGoTo(index)}
              className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                index === currentStep
                  ? 'bg-red-600 text-white'
                  : index < currentStep
                  ? 'bg-green-600 text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-500 cursor-default'
              }`}
              disabled={index > currentStep}
            >
              {index + 1}
            </button>
            <span className="text-xs mt-1 text-center text-gray-600 hidden sm:block">
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-full mt-4 absolute ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
