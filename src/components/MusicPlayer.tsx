
import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface Track {
  audioUrl: string;
  coverUrl: string;
  title: string;
  artist: string;
}

interface MusicPlayerProps {
  audioUrl: string;
  coverUrl: string;
  title: string;
  artist: string;
  playlist?: Track[];
  initialTrackIndex?: number;
  variant?: "default" | "mobile-modal";
}

export default function MusicPlayer({
  audioUrl,
  coverUrl,
  title,
  artist,
  playlist,
  initialTrackIndex = 0,
  variant = "default",
}: MusicPlayerProps) {
  const { playTrack, currentTrack, isPlaying, togglePlayPause, progress, duration, seekTo } = useAudioPlayer();

  // Track for this player
  const track = {
    id: audioUrl,
    audioUrl,
    coverUrl,
    title,
    artist,
  };

  // Check if this is the currently playing track
  const isCurrentTrack = currentTrack?.audioUrl === audioUrl;

  // State for playlist track index
  const [trackIndex, setTrackIndex] = useState<number>(initialTrackIndex);

  // What track do we play? Support old props or playlist
  const activeTrack = playlist
    ? playlist[trackIndex] ?? {
        audioUrl: "",
        coverUrl: "",
        title: "",
        artist: "",
      }
    : {
        audioUrl,
        coverUrl,
        title,
        artist,
      };

  // Handle play button - always use global player for synchronization
  const handleToggle = () => {
    const playlistTracks = playlist?.map((p, index) => ({
      id: p.audioUrl + index,
      audioUrl: p.audioUrl,
      coverUrl: p.coverUrl,
      title: p.title,
      artist: p.artist,
    })) || [track];
    
    if (isCurrentTrack && currentTrack) {
      // If this is the current track, just toggle play/pause
      togglePlayPause();
    } else {
      // If this is a different track, play it
      playTrack(track, playlistTracks);
    }
  };

  // Seek when slider moves
  const handleSeek = (val: number[]) => {
    seekTo(val[0]);
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

  // Next/Previous song navigation (playlist mode)
  const hasPlaylist = Array.isArray(playlist) && playlist.length > 1;

  const canGoPrev = hasPlaylist ? trackIndex > 0 : false;
  const canGoNext = hasPlaylist ? trackIndex < playlist!.length - 1 : false;

  const handlePrevSong = () => {
    if (!hasPlaylist) return;
    setTrackIndex((i) => (i > 0 ? i - 1 : i));
  };

  const handleNextSong = () => {
    if (!hasPlaylist) return;
    setTrackIndex((i) => (i < playlist!.length - 1 ? i + 1 : i));
  };

  // Use global state for consistent playback across all players
  const effectiveIsPlaying = isCurrentTrack ? isPlaying : false;
  const effectiveProgress = isCurrentTrack ? progress : 0;
  const effectiveDuration = isCurrentTrack ? duration : 0;

  if (variant === "mobile-modal") {
    return (
      <div className="flex flex-col items-center w-full px-2 pt-2">
        {/* Cover with curved mask */}
        <div className="relative w-full flex justify-center">
          <div className="w-48 h-60 md:w-56 md:h-68 relative overflow-hidden">
            <img
              src={activeTrack.coverUrl}
              alt={activeTrack.title + " cover"}
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
          <div className="text-lg font-bold text-white text-center mb-1">{activeTrack.title}</div>
          <div className="text-sm text-neutral-400 font-medium">{activeTrack.artist}</div>
        </div>
        {/* Seek bar / slider */}
        <div className="w-full flex flex-col items-center mt-8 mb-2">
          <div className="w-5/6">
            <Slider
              value={[effectiveProgress]}
              min={0}
              max={effectiveDuration || 1}
              step={1}
              onValueChange={handleSeek}
              className="bg-transparent"
              style={{ background: "none" }}
            />
          </div>
        </div>
        {/* Time and Controls */}
        <div className="flex flex-col items-center w-full mt-2">
          <span className="mb-2 text-xs text-neutral-400 font-mono">{format(effectiveProgress)}</span>
          <div className="flex items-end justify-center gap-8 mb-2">
            <div className="flex flex-col items-center">
              {hasPlaylist ? (
                <button
                  aria-label="Previous Song"
                  className={`bg-white border border-neutral-200 rounded-full p-2 shadow ${!canGoPrev ? "opacity-50 cursor-default pointer-events-none" : ""}`}
                  onClick={handlePrevSong}
                  disabled={!canGoPrev}
                >
                  <SkipBack size={22} className="text-black" />
                </button>
              ) : null}
            </div>
            <button
              aria-label={effectiveIsPlaying ? "Pause" : "Play"}
              className="rounded-full bg-amber-600 shadow-inner p-4 mx-2 transition-transform hover:scale-110 audio-glow"
              style={{
                boxShadow:
                  "0 2.5px 22px 0 rgba(245,158,11,0.4), 0 1px 14px 0 rgba(245,158,11,0.2)",
              }}
              onClick={handleToggle}
            >
              {effectiveIsPlaying ? (
                <Pause size={32} className="text-white" />
              ) : (
                <Play size={32} className="text-white" />
              )}
            </button>
            <div className="flex flex-col items-center">
              {hasPlaylist ? (
                <button
                  aria-label="Next Song"
                  className={`bg-white border border-neutral-200 rounded-full p-2 shadow ${!canGoNext ? "opacity-50 cursor-default pointer-events-none" : ""}`}
                  onClick={handleNextSong}
                  disabled={!canGoNext}
                >
                  <SkipForward size={22} className="text-black" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop (default): updated with amber theme
  return (
    <div className="flex flex-col items-center">
      <img src={activeTrack.coverUrl} alt={activeTrack.title + " cover"} className="w-48 h-48 object-cover rounded-md" />
      <h2 className="mt-4 text-lg font-semibold text-white">{activeTrack.title}</h2>
      <p className="text-sm text-amber-300">{activeTrack.artist}</p>
      <div className="flex items-center mt-4">
        {hasPlaylist ? (
          <button
            onClick={handlePrevSong}
            disabled={!canGoPrev}
            className={`px-4 py-2 bg-amber-600 text-white rounded-full focus:outline-none hover:bg-amber-700 transition-colors ${!canGoPrev ? "opacity-50 cursor-default pointer-events-none" : ""}`}
          >
            <SkipBack size={20} />
          </button>
        ) : null}
        <button
          onClick={handleToggle}
          className="mx-4 px-6 py-3 bg-amber-600 text-white rounded-full focus:outline-none hover:bg-amber-700 transition-colors audio-glow"
        >
          {effectiveIsPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        {hasPlaylist ? (
          <button
            onClick={handleNextSong}
            disabled={!canGoNext}
            className={`px-4 py-2 bg-amber-600 text-white rounded-full focus:outline-none hover:bg-amber-700 transition-colors ${!canGoNext ? "opacity-50 cursor-default pointer-events-none" : ""}`}
          >
            <SkipForward size={20} />
          </button>
        ) : null}
      </div>
      <input
        type="range"
        min="0"
        max={effectiveDuration}
        value={effectiveProgress}
        onChange={(e) => seekTo(parseInt(e.target.value))}
        className="w-full mt-4"
      />
    </div>
  );
}
