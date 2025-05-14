import { cn } from "@/lib/utils"

export interface Step {
  title: string;
  description: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="relative after:absolute after:inset-x-0 after:top-1/2 after:block after:h-0.5 after:-translate-y-1/2 after:rounded-lg after:bg-gray-100">
        <div className="relative z-10 flex justify-between">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold",
                  index <= currentStep
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 bg-white text-gray-300"
                )}
              >
                {index + 1}
              </div>
              <div className="mt-3 w-24 text-center">
                <div
                  className={cn(
                    "text-sm font-semibold",
                    index <= currentStep ? "text-indigo-600" : "text-gray-400"
                  )}
                >
                  {step.title}
                </div>
                <div
                  className={cn(
                    "mt-1 text-xs",
                    index <= currentStep ? "text-gray-600" : "text-gray-400"
                  )}
                >
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 