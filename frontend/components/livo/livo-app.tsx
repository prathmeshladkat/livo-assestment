'use client';

import { useState } from 'react';
import { AlertCircle, Mic } from 'lucide-react';
import HeroUpload from './hero-upload';
import FileSelected from './file-selected';
import Processing from './processing';
import Results from './result';
import { submitAudio, pollUntilDone, type AnalyzeResult } from '@/lib/api';

type AppState = 'hero' | 'file-selected' | 'processing' | 'results' | 'error';

export default function LivoApp() {
  const [state, setState] = useState<AppState>('hero');
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isChecked, setIsChecked] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setIsChecked(false);

    const audio = new Audio();
    const objectUrl = URL.createObjectURL(selectedFile);
    audio.src = objectUrl;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setState('file-selected');
      URL.revokeObjectURL(objectUrl);
    };

    audio.onerror = () => {
      setError('Failed to load audio file. It may be corrupted or an unsupported format.');
      setState('error');
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleAnalyze = async () => {
    if (!file || duration < 30 || duration > 45) {
      setError('Audio must be between 30-45 seconds.');
      setState('error');
      return;
    }

    if (!isChecked) {
      setError('Please consent to audio processing before continuing.');
      setState('error');
      return;
    }

    setState('processing');
    setError('');
    setProgress(0);

    try {
      const jobId = await submitAudio(file);
      const finalResult = await pollUntilDone(jobId, setProgress);
      setResult(finalResult);
      setState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setDuration(0);
    setIsChecked(false);
    setResult(null);
    setProgress(0);
    setError('');
    setState('hero');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
              <Mic className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Livo</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-3xl">
          {state === 'hero' && <HeroUpload onFileSelect={handleFileSelect} />}

          {state === 'file-selected' && file && (
            <FileSelected
              file={file}
              duration={duration}
              isChecked={isChecked}
              onCheckChange={setIsChecked}
              onAnalyze={handleAnalyze}
            />
          )}

          {state === 'processing' && <Processing progress={progress} />}

          {state === 'results' && result && (
            <Results result={result} onReset={handleReset} />
          )}

          {state === 'error' && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-destructive mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Error</h3>
                  <p className="text-foreground/80 text-sm mb-4">{error}</p>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border/40 bg-background/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-muted-foreground">
          <p>Your audio is never stored — processed and deleted immediately.</p>
        </div>
      </footer>
    </div>
  );
}