
import React, { useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MusicPlayerProps {
  audioUrl: string;
  coverUrl: string;
  title: string;
  artist: string;
}

export default function MusicPlayer({
  audioUrl,
  coverUrl,
  title,
  artist,
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

  // Small visual shadow behind the big round art
  return (
    <div className="w-full flex justify-center items-center pt-8 pb-16">
      <div
        className="mx-auto bg-card border border-card/50 rounded-3xl shadow-2xl flex flex-col items-center p-6 md:p-8"
        style={{
          minWidth: 300,
          maxWidth: 350,
          background:
            "linear-gradient(140deg, rgba(38,44,74,0.92) 65%, rgba(23,27,39,0.90) 100%)",
          boxShadow: "0 6px 24px 0 rgba(20, 24, 35, 0.39)",
        }}
      >
        {/* Cover Art - "U" shaped using masking (with fallback to simple circle on mobile) */}
        <div className="relative w-full flex justify-center">
          <div className="w-52 h-64 md:w-60 md:h-72 relative overflow-hidden">
            {/* Masked semi-round lower section */}
            <img
              src={coverUrl}
              alt={title + " cover"}
              className="w-full h-full object-cover"
              style={{
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                borderBottomLeftRadius: 110,
                borderBottomRightRadius: 110,
                boxShadow:
                  "0 4px 24px 0 rgba(0,0,0,0.32), 0 0px 0.7px 0 rgba(130,210,191,0.12)",
              }}
            />
            {/* Shadow effect under the cover */}
            <div
              className="absolute left-0 bottom-0 w-full h-2"
              style={{
                background:
                  "linear-gradient(to top, rgba(17,21,41,0.32) 80%, transparent 105%)",
                borderBottomLeftRadius: 110,
                borderBottomRightRadius: 110,
              }}
            />
          </div>
        </div>
        {/* Song info */}
        <div className="mt-7 w-full flex flex-col items-center">
          <div className="text-lg md:text-xl font-semibold tracking-wide text-foreground text-center">
            {title}
          </div>
          <div className="text-sm text-muted-foreground mt-1 font-medium tracking-wide">
            {artist}
          </div>
        </div>
        {/* Slider/progress (sorta curved illusion with handle and arc shadow) */}
        <div className="relative w-full my-9 flex flex-col items-center">
          {/* Curved "arc" shadow background */}
          <svg
            width="210"
            height="48"
            className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none select-none"
            style={{ zIndex: 0 }}
          >
            <path
              d="M 15 38 Q 105 10 195 38"
              stroke="rgba(62,78,112,0.19)"
              strokeWidth="8"
              fill="none"
            />
          </svg>
          {/* Interactive slider */}
          <div className="relative z-10 w-5/6">
            <Slider
              value={[progress]}
              min={0}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="mt-7"
              style={{
                // Hide default track, use our custom, arc above is just fake visual
                background: "none",
              }}
            />
          </div>
          {/* Slider handle overlay (to match the design style) */}
          <div
            className="absolute left-11 top-7 z-20"
            style={{
              transform: `translateX(${
                ((progress / (duration || 1)) * 148) || 0
              }px)`, // 148 = approx length of arc
              transition: "transform 0.18s",
            }}
          >
            <div className="w-5 h-5 bg-card border-2 border-primary rounded-full shadow-lg" />
          </div>
        </div>
        {/* Timing and controls */}
        <div className="flex items-center justify-between w-full px-3 mb-3 opacity-70 font-mono">
          <span className="text-xs">{format(progress)}</span>
          <span className="text-xs">{format(duration)}</span>
        </div>
        <div className="flex items-center justify-center gap-7 mb-2 mt-1">
          <button
            aria-label="Skip Back"
            className="bg-card/70 rounded-full p-2 hover:scale-110 transition shadow"
            onClick={() => {
              if (!audioRef.current) return;
              audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
            }}
          >
            <SkipBack size={28} className="text-foreground" />
          </button>
          <button
            aria-label={isPlaying ? "Pause" : "Play"}
            className="rounded-full bg-primary shadow-inner p-4 mx-3 transition-transform hover:scale-110"
            style={{
              boxShadow:
                "0 2.5px 22px 0 rgba(0,255,153,0.14), 0 1px 14px 0 rgba(147,255,193,0.28)",
            }}
            onClick={handleToggle}
          >
            {isPlaying ? (
              <Pause size={36} className="text-primary-foreground" />
            ) : (
              <Play size={36} className="text-primary-foreground" />
            )}
          </button>
          <button
            aria-label="Skip Forward"
            className="bg-card/70 rounded-full p-2 hover:scale-110 transition shadow"
            onClick={() => {
              if (!audioRef.current) return;
              audioRef.current.currentTime = Math.min(
                duration,
                audioRef.current.currentTime + 10
              );
            }}
          >
            <SkipForward size={28} className="text-foreground" />
          </button>
        </div>
        {/* Hidden native audio */}
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
    </div>
  );
}
