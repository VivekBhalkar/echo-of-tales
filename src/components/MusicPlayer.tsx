import React, { useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MusicPlayerProps {
  audioUrl: string;
  coverUrl: string;
  title: string;
  artist: string;
  variant?: "default" | "mobile-modal";
}

export default function MusicPlayer({
  audioUrl,
  coverUrl,
  title,
  artist,
  variant = "default",
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Toggle playback
  const handleToggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying((p) => !p);
  };

  // Seek when slider moves
  const handleSeek = (val: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = val[0];
    setProgress(val[0]);
  };

  // Format time as mm:ss
  const format = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Update progress from audio tag
  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  // On load, set duration
  const onLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  if (variant === "mobile-modal") {
    // Single seek/slider only for the player UI here.
    return (
      <div className="flex flex-col items-center w-full px-2 pt-2">
        {/* Cover with curved mask */}
        <div className="relative w-full flex justify-center">
          <div className="w-48 h-60 md:w-56 md:h-68 relative overflow-hidden">
            <img
              src={coverUrl}
              alt={title + " cover"}
              className="w-full h-full object-cover"
              style={{
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                borderBottomLeftRadius: 115,
                borderBottomRightRadius: 115,
              }}
            />
            {/* White bottom arc under image */}
            <div
              className="absolute left-0 bottom-0 w-full h-1.5"
              style={{
                background: "linear-gradient(to top, #f5f6fa 80%, transparent 105%)",
                borderBottomLeftRadius: 115,
                borderBottomRightRadius: 115,
              }}
            />
          </div>
        </div>
        {/* Title and Artist */}
        <div className="mt-5 w-full flex flex-col items-center">
          <div className="text-lg font-bold text-neutral-900 text-center mb-1">{title}</div>
          <div className="text-sm text-neutral-400 font-medium">{artist}</div>
        </div>
        {/* Seek bar / slider */}
        <div className="w-full flex flex-col items-center mt-8 mb-2">
          <div className="w-5/6">
            <Slider
              value={[progress]}
              min={0}
              max={duration || 1}
              step={1}
              onValueChange={handleSeek}
              className="bg-transparent"
              style={{ background: "none" }}
            />
          </div>
        </div>
        {/* Time and Controls */}
        <div className="flex flex-col items-center w-full mt-2">
          <span className="mb-2 text-xs text-neutral-400 font-mono">{format(progress)}</span>
          <div className="flex items-end justify-center gap-8 mb-2">
            <div className="flex flex-col items-center">
              <button
                aria-label="Skip Back"
                className="bg-white border border-neutral-200 rounded-full p-2 shadow"
                onClick={() => {
                  if (!audioRef.current) return;
                  audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                }}
              >
                <SkipBack size={22} className="text-black" />
              </button>
              {/* 10 sec label below SkipBack */}
              <span className="mt-1 text-[10px] text-neutral-400 font-medium">10 sec</span>
            </div>
            <button
              aria-label={isPlaying ? "Pause" : "Play"}
              className="rounded-full bg-black shadow-inner p-4 mx-2 transition-transform hover:scale-110"
              style={{
                boxShadow:
                  "0 2.5px 22px 0 rgba(0,0,0,0.14), 0 1px 14px 0 rgba(147,255,193,0.12)",
              }}
              onClick={handleToggle}
            >
              {isPlaying ? (
                <Pause size={32} className="text-white" />
              ) : (
                <Play size={32} className="text-white" />
              )}
            </button>
            <div className="flex flex-col items-center">
              <button
                aria-label="Skip Forward"
                className="bg-white border border-neutral-200 rounded-full p-2 shadow"
                onClick={() => {
                  if (!audioRef.current) return;
                  audioRef.current.currentTime = Math.min(
                    duration,
                    audioRef.current.currentTime + 10
                  );
                }}
              >
                <SkipForward size={22} className="text-black" />
              </button>
              {/* 10 sec label below SkipForward */}
              <span className="mt-1 text-[10px] text-neutral-400 font-medium">10 sec</span>
            </div>
          </div>
        </div>
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <img src={coverUrl} alt={title + " cover"} className="w-48 h-48 object-cover rounded-md" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-500">{artist}</p>
      <div className="flex items-center mt-4">
        <button
          onClick={() => {
            if (!audioRef.current) return;
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full focus:outline-none"
        >
          <SkipBack size={20} />
        </button>
        <button
          onClick={handleToggle}
          className="mx-4 px-6 py-3 bg-blue-500 text-white rounded-full focus:outline-none"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={() => {
            if (!audioRef.current) return;
            audioRef.current.currentTime = Math.min(
              duration,
              audioRef.current.currentTime + 10
            );
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full focus:outline-none"
        >
          <SkipForward size={20} />
        </button>
      </div>
      <input
        type="range"
        min="0"
        max={duration}
        value={progress}
        onChange={(e) => {
          if (!audioRef.current) return;
          audioRef.current.currentTime = parseInt(e.target.value);
          setProgress(parseInt(e.target.value));
        }}
        className="w-full mt-4"
      />
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
