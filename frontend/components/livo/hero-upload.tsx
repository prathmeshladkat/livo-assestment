import { Upload, ArrowRight, Zap, Mic, CheckCircle } from 'lucide-react';
import { useRef } from 'react';

interface HeroUploadProps {
  onFileSelect: (file: File) => void;
}

export default function HeroUpload({ onFileSelect }: HeroUploadProps) {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-accent', 'bg-accent/5');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-accent', 'bg-accent/5');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-accent', 'bg-accent/5');
    }

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-block">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight text-balance">
            Instant pronunciation feedback
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Get AI-powered scoring and personalized coaching to perfect your speech
        </p>
      </div>

      {/* Upload Zone */}
      <div
        ref={dropZoneRef}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border/60 rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300 hover:border-border/100 hover:bg-card/30"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
              <Upload className="w-8 h-8 text-accent" />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground mb-1">
              Drop your audio file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              MP3, WAV, or M4A — between 30-45 seconds
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        <div className="flex flex-col items-center sm:items-start space-y-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
            <Upload className="w-5 h-5 text-accent" />
          </div>
          <div className="text-center sm:text-left">
            <p className="font-semibold text-foreground">Upload</p>
            <p className="text-sm text-muted-foreground">Share your audio file</p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-start space-y-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div className="text-center sm:text-left">
            <p className="font-semibold text-foreground">Analyze</p>
            <p className="text-sm text-muted-foreground">AI evaluates your speech</p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-start space-y-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-accent" />
          </div>
          <div className="text-center sm:text-left">
            <p className="font-semibold text-foreground">Get Feedback</p>
            <p className="text-sm text-muted-foreground">Receive detailed insights</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}
