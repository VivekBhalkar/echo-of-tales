
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
  playlist?: Track[]; // optional new prop: playlist
  initialTrackIndex?: number; // for playlist mode, optional
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [localProgress, setLocalProgress] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);

  // Track for this player
  const track = {
    id: audioUrl, // Use audioUrl as unique ID
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

  // When track changes, reset progress/duration for local player only
  useEffect(() => {
    if (variant === "default") {
      setLocalProgress(0);
      setLocalDuration(0);
      if (audioRef.current) {
        audioRef.current.load();
        setLocalIsPlaying(false);
      }
    }
  }, [activeTrack.audioUrl, variant]);

  // For local playback (when not using global player)
  const handleLocalToggle = () => {
    if (!audioRef.current) return;
    if (localIsPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setLocalIsPlaying(!localIsPlaying);
  };

  // Handle play button - use global player for mobile variant
  const handleToggle = () => {
    if (variant === "mobile-modal") {
      // Use global player for mobile variant
      const playlistTracks = playlist?.map((p, index) => ({
        id: p.audioUrl + index,
        audioUrl: p.audioUrl,
        coverUrl: p.coverUrl,
        title: p.title,
        artist: p.artist,
      })) || [track];
      
      playTrack(track, playlistTracks);
    } else {
      // Use local player for default variant
      handleLocalToggle();
    }
  };

  // Seek when slider moves
  const handleSeek = (val: number[]) => {
    if (variant === "mobile-modal") {
      seekTo(val[0]);
    } else {
      if (!audioRef.current) return;
      audioRef.current.currentTime = val[0];
      setLocalProgress(val[0]);
    }
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

  // Update progress from audio tag (local player only)
  const onTimeUpdate = () => {
    if (!audioRef.current || variant === "mobile-modal") return;
    setLocalProgress(audioRef.current.currentTime);
  };

  // On load, set duration (local player only)
  const onLoadedMetadata = () => {
    if (!audioRef.current || variant === "mobile-modal") return;
    setLocalDuration(audioRef.current.duration);
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

  // Use global state for mobile variant, local state for default
  const effectiveIsPlaying = variant === "mobile-modal" && isCurrentTrack ? isPlaying : localIsPlaying;
  const effectiveProgress = variant === "mobile-modal" && isCurrentTrack ? progress : localProgress;
  const effectiveDuration = variant === "mobile-modal" && isCurrentTrack ? duration : localDuration;

  if (variant === "mobile-modal") {
    // Mobile UI: replace skip by prev/next track if playlist is given
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
              className="rounded-full bg-black shadow-inner p-4 mx-2 transition-transform hover:scale-110"
              style={{
                boxShadow:
                  "0 2.5px 22px 0 rgba(0,0,0,0.14), 0 1px 14px 0 rgba(147,255,193,0.12)",
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

  // Desktop (default): similar replacement
  return (
    <div className="flex flex-col items-center">
      <img src={activeTrack.coverUrl} alt={activeTrack.title + " cover"} className="w-48 h-48 object-cover rounded-md" />
      <h2 className="mt-4 text-lg font-semibold text-white">{activeTrack.title}</h2>
      <p className="text-sm text-gray-500">{activeTrack.artist}</p>
      <div className="flex items-center mt-4">
        {hasPlaylist ? (
          <button
            onClick={handlePrevSong}
            disabled={!canGoPrev}
            className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-full focus:outline-none ${!canGoPrev ? "opacity-50 cursor-default pointer-events-none" : ""}`}
          >
            <SkipBack size={20} />
          </button>
        ) : null}
        <button
          onClick={handleToggle}
          className="mx-4 px-6 py-3 bg-blue-500 text-white rounded-full focus:outline-none"
        >
          {effectiveIsPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        {hasPlaylist ? (
          <button
            onClick={handleNextSong}
            disabled={!canGoNext}
            className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-full focus:outline-none ${!canGoNext ? "opacity-50 cursor-default pointer-events-none" : ""}`}
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
        onChange={(e) => {
          if (!audioRef.current) return;
          audioRef.current.currentTime = parseInt(e.target.value);
          setLocalProgress(parseInt(e.target.value));
        }}
        className="w-full mt-4"
      />
      {/* Only render local audio for default variant */}
      <audio
        ref={audioRef}
        src={activeTrack.audioUrl}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setLocalIsPlaying(true)}
        onPause={() => setLocalIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
