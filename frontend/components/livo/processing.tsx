interface ProcessingStep {
  id: string;
  label: string;
  icon: string;
}

const steps: ProcessingStep[] = [
  { id: 'transcribe', label: 'Transcribing audio', icon: '🎙️' },
  { id: 'score', label: 'Scoring pronunciation', icon: '⚡' },
  { id: 'feedback', label: 'Generating feedback', icon: '✨' },
];

interface ProcessingProps {
  /** 0-100, from job.updateProgress() checkpoints: 40 / 70 / 90 / 100 */
  progress: number;
}

// Maps backend progress checkpoints to a step index (0, 1, or 2).
// Backend emits 40 after STT, 70 after scoring, 90 after feedback, 100 on completion.
function progressToStepIndex(progress: number): number {
  if (progress >= 70) return 2; // feedback generation in progress/done
  if (progress >= 40) return 1; // scoring done, or STT just finished
  return 0; // still transcribing (or job just started, progress still 0)
}

export default function Processing({ progress }: ProcessingProps) {
  const currentStep = progressToStepIndex(progress);

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border/60 rounded-2xl p-12 space-y-8 text-center">
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-border/40"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="141 282"
                className="text-accent animate-spin"
                style={{ animationDuration: '2s' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-accent/40 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">Processing your audio</p>
          <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
        </div>

        <div className="space-y-3 pt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 transition-all duration-500 ${
                index <= currentStep ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                  index < currentStep
                    ? 'bg-green-500/20 text-green-500'
                    : index === currentStep
                      ? 'bg-accent/20 text-accent animate-pulse'
                      : 'bg-border/40 text-muted-foreground'
                }`}
              >
                {index < currentStep ? '✓' : step.icon}
              </div>
              <span
                className={`text-sm font-medium ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-2 h-2 rounded-full bg-accent/50 animate-pulse" />
      </div>
    </div>
  );
}