
import React from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

export const BottomAudioPlayer: React.FC = () => {
  const {
    currentTrack,
    playlist,
    currentTrackIndex,
    isPlaying,
    progress,
    duration,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const handleSeek = (val: number[]) => {
    seekTo(val[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canGoPrev = playlist.length > 1 && currentTrackIndex > 0;
  const canGoNext = playlist.length > 1 && currentTrackIndex < playlist.length - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center gap-4 px-4 py-3 max-w-6xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate text-white">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={previousTrack}
            disabled={!canGoPrev}
            className={`p-1 rounded-full transition-colors ${
              canGoPrev 
                ? 'hover:bg-muted text-foreground' 
                : 'text-muted-foreground cursor-not-allowed'
            }`}
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={togglePlayPause}
            className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            onClick={nextTrack}
            disabled={!canGoNext}
            className={`p-1 rounded-full transition-colors ${
              canGoNext 
                ? 'hover:bg-muted text-foreground' 
                : 'text-muted-foreground cursor-not-allowed'
            }`}
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-md">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTime(progress)}
          </span>
          <div className="flex-1">
            <Slider
              value={[progress]}
              min={0}
              max={duration || 1}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};
