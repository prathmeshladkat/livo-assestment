'use client';

import { useState } from 'react';
import { RotateCcw, Zap } from 'lucide-react';
import type { AnalyzeResult } from '@/lib/api';

interface ResultsProps {
  result: AnalyzeResult;
  onReset: () => void;
}

export default function Results({ result, onReset }: ResultsProps) {
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: 'bg-green-500/10', ring: 'ring-green-500/30', text: 'text-green-500' };
    if (score >= 60) return { bg: 'bg-yellow-500/10', ring: 'ring-yellow-500/30', text: 'text-yellow-500' };
    return { bg: 'bg-red-500/10', ring: 'ring-red-500/30', text: 'text-red-500' };
  };

  const scoreColors = getScoreColor(result.overallScore);
  const flaggedWords = result.words.filter((w) => w.flagged);

  return (
    <div className="space-y-8">
      {/* Score Section */}
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Pronunciation Score
          </p>
        </div>

        <div className={`relative w-40 h-40 rounded-full ring-8 ${scoreColors.ring} ${scoreColors.bg} flex items-center justify-center`}>
          <div className="text-center">
            <p className={`text-6xl font-bold ${scoreColors.text}`}>{result.overallScore}</p>
            <p className="text-sm text-muted-foreground mt-1">/100</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center max-w-md">
          {result.overallScore >= 85
            ? 'Excellent pronunciation! Keep up the great work.'
            : result.overallScore >= 60
              ? 'Good work! Practice the flagged words for improvement.'
              : 'Keep practicing! Focus on the highlighted areas.'}
        </p>
      </div>

      {/* Transcript Section — words rendered directly from result.words,
          each carrying its own flagged/confidence state, rather than
          re-parsing the transcript string and matching by lowercase text.
          This is more correct: it handles repeated words correctly
          (e.g. "the" appearing 5 times, only one instance flagged). */}
      <div className="bg-card border border-border/60 rounded-2xl p-8 space-y-4">
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
          Transcript
        </h3>
        <p className="text-lg leading-relaxed text-foreground/90 text-pretty">
          {result.words.map((w, idx) => (
            <span key={idx}>
              <span
                className={`transition-colors duration-200 ${
                  w.flagged
                    ? `bg-accent/30 text-accent px-1.5 rounded cursor-help ${
                        hoveredWord === idx ? 'bg-accent/50' : ''
                      }`
                    : 'text-foreground'
                }`}
                onMouseEnter={() => w.flagged && setHoveredWord(idx)}
                onMouseLeave={() => setHoveredWord(null)}
                title={w.flagged ? `Confidence: ${Math.round(w.confidence * 100)}%` : undefined}
              >
                {w.word}
              </span>
              {' '}
            </span>
          ))}
        </p>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
          Highlighted words need improvement. Hover or tap for details.
        </p>
      </div>

      {/* Feedback Card */}
      <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-2xl p-8 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">Personalized Feedback</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{result.feedback}</p>
          </div>
        </div>
      </div>

      {/* Flagged Words Summary */}
      {flaggedWords.length > 0 && (
        <div className="bg-card border border-border/60 rounded-2xl p-8 space-y-4">
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
            Words to Practice
          </h3>
          <div className="flex flex-wrap gap-2">
            {flaggedWords.map((w, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 text-sm font-medium hover:bg-accent/20 transition-colors cursor-pointer"
                title={`Confidence: ${Math.round(w.confidence * 100)}%`}
              >
                {w.word}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-3 px-4 rounded-xl font-semibold text-base bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
      >
        <RotateCcw className="w-5 h-5" />
        Try another recording
      </button>
    </div>
  );
}