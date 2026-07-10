import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileSelectedProps {
  file: File;
  duration: number;
  isChecked: boolean;
  onCheckChange: (checked: boolean) => void;
  onAnalyze: () => void;
}

export default function FileSelected({
  file,
  duration,
  isChecked,
  onCheckChange,
  onAnalyze,
}: FileSelectedProps) {
  const isValidDuration = duration >= 30 && duration <= 45;
  const formattedDuration = duration.toFixed(1);

  return (
    <div className="space-y-6">
      {/* File Card */}
      <div className="bg-card border border-border/60 rounded-2xl p-8 space-y-6">
        {/* File Info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-accent"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        {/* Duration Status */}
        <div className="border-t border-border/40 pt-6">
          <div className="flex items-start gap-4">
            {isValidDuration ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                Duration: {formattedDuration}s
              </p>
              <p
                className={`text-sm mt-1 ${
                  isValidDuration ? 'text-green-500/80' : 'text-red-500/80'
                }`}
              >
                {isValidDuration
                  ? '✓ Perfect length for analysis'
                  : '✗ Must be between 30-45 seconds'}
              </p>
            </div>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="border-t border-border/40 pt-6 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onCheckChange(e.target.checked)}
              className="w-5 h-5 rounded border border-border/80 bg-card text-accent accent-accent cursor-pointer mt-0.5 flex-shrink-0"
            />
            <span className="text-sm text-foreground group-hover:text-foreground/90 transition-colors">
              I consent to this audio being processed for pronunciation scoring only
            </span>
          </label>
        </div>

        {/* Analyze Button */}
        <button
          onClick={onAnalyze}
          disabled={!isValidDuration || !isChecked}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-base transition-all duration-200 ${
            isValidDuration && isChecked
              ? 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] shadow-lg hover:shadow-xl'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
          }`}
        >
          Analyze my pronunciation
        </button>
      </div>

      {/* Privacy Note */}
      <p className="text-xs text-muted-foreground text-center">
          Your audio is never stored — processed and deleted immediately.
      </p>
    </div>
  );
}
