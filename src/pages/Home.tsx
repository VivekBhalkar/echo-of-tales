
import { useState, useEffect } from "react";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ArtistProfilesList from "@/components/ArtistProfilesList";
import UserSearch from "@/components/UserSearch";
import { supabase } from "@/integrations/supabase/client";
import { Play, Clock, Music, Headphones, Mic } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

// Enhanced SongCard component for better playlist-like appearance
function SongCard({ 
  title, 
  cover_image_url, 
  created_at,
  onClick 
}: { 
  title: string;
  cover_image_url?: string | null;
  created_at?: string;
  onClick?: () => void;
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg border bg-background shadow-sm hover:shadow-md cursor-pointer hover:bg-muted/50 transition-all duration-200 group"
      onClick={onClick}
    >
      {/* Album Art */}
      <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
        {cover_image_url ? (
          <img 
            src={cover_image_url} 
            alt={title} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            <Clock size={20} />
          </div>
        )}
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Play size={20} className="text-white" />
        </div>
      </div>
      
      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        {created_at && (
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(created_at)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [artistSongs, setArtistSongs] = useState<any[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [selectedArtistName, setSelectedArtistName] = useState<string>("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { playTrack } = useAudioPlayer();

  // Fetch songs for the selected artist
  useEffect(() => {
    const fetchSongs = async () => {
      if (!selectedArtistId) {
        setArtistSongs([]);
        setSongsLoading(false);
        setSelectedArtistName("");
        return;
      }
      
      setSongsLoading(true);
      console.log("Fetching songs for artist:", selectedArtistId);
      
      // Fetch artist name
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", selectedArtistId)
        .single();
      
      setSelectedArtistName(profile?.name || "Unknown Artist");
      
      // Fetch songs
      const { data: stories, error } = await supabase
        .from("audio_stories")
        .select("id, title, audio_url, cover_image_url, category, created_at")
        .eq("uploaded_by", selectedArtistId)
        .order("created_at", { ascending: false });
      
      console.log("Songs data:", stories);
      console.log("Songs error:", error);
      
      setArtistSongs(error || !stories ? [] : stories);
      setSongsLoading(false);
    };
    
    fetchSongs();
  }, [selectedArtistId]);

  const handleSongPlay = (song: any) => {
    console.log("Playing song:", song);
    const track = {
      id: song.id,
      audioUrl: song.audio_url || "",
      coverUrl: song.cover_image_url || "",
      title: song.title || "",
      artist: selectedArtistName,
    };
    
    // Create playlist from all artist songs
    const playlist = artistSongs.map(s => ({
      id: s.id,
      audioUrl: s.audio_url || "",
      coverUrl: s.cover_image_url || "",
      title: s.title || "",
      artist: selectedArtistName,
    }));
    
    playTrack(track, playlist);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start w-full bg-background pb-20 relative">
      <Navbar />
      <div className="w-full" style={{ height: 72 }} />
      <HeroSection
        active={active}
        setActive={setActive}
        search={search}
        setSearch={setSearch}
      />

      {/* Enhanced content section with better styling */}
      <div className="w-full flex justify-center relative">
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"></div>
        </div>
        
        <div className="w-full max-w-4xl glass-card p-8 animate-fade-in shadow-neon relative z-10">
          {/* Tab Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setShowUserSearch(false)}
              className={`px-4 py-2 rounded-lg transition-all ${
                !showUserSearch
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                  : "text-amber-100/70 hover:text-amber-200"
              }`}
            >
              Audio Content
            </button>
            <button
              onClick={() => setShowUserSearch(true)}
              className={`px-4 py-2 rounded-lg transition-all ${
                showUserSearch
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                  : "text-amber-100/70 hover:text-amber-200"
              }`}
            >
              Find Users
            </button>
          </div>

          {showUserSearch ? (
            <UserSearch />
          ) : (
            <>
              {/* Content header with music theme */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-amber-500/20 audio-glow">
                  <Music className="text-amber-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-amber-200">Latest Audio Content</h2>
              </div>

              <AudioStoryFeed category={active} search={search} />
              
              {/* Artists section with enhanced design */}
              {active === "all" && (
                <div className="mt-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-full bg-amber-500/20 audio-glow">
                      <Headphones className="text-amber-400" size={24} />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-amber-200">Featured Artists</div>
                      <p className="text-sm text-amber-100/70">Discover talented creators and their audio stories</p>
                    </div>
                  </div>
                  
                  <div className="w-full min-h-[120px] rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-sm px-6 py-6 shadow-neon">
                    <ArtistProfilesList
                      selectedArtistId={selectedArtistId}
                      onSelectArtist={setSelectedArtistId}
                    />
                    
                    {/* Show songs by selected artist below */}
                    {selectedArtistId && (
                      <div className="mt-8">
                        <div className="mb-6 flex items-center gap-3">
                          <div className="p-2 rounded-full bg-amber-500/20 audio-glow">
                            <Mic className="text-amber-400" size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-amber-200">
                              Songs by {selectedArtistName}
                            </h3>
                            <p className="text-sm text-amber-100/70">
                              {artistSongs.length} {artistSongs.length === 1 ? 'song' : 'songs'}
                            </p>
                          </div>
                        </div>
                        
                        {songsLoading ? (
                          <div className="flex w-full justify-center py-8 text-amber-300">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                              Loading songs...
                            </div>
                          </div>
                        ) : artistSongs.length === 0 ? (
                          <div className="flex w-full justify-center py-8 text-amber-300/70">
                            No songs uploaded yet.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {artistSongs.map(song => (
                              <div key={song.id} className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                                <SongCard
                                  title={song.title}
                                  cover_image_url={song.cover_image_url}
                                  created_at={song.created_at}
                                  onClick={() => handleSongPlay(song)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional content sections for better design */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-lg p-6 border border-amber-500/20 shadow-neon">
                  <Music className="text-amber-400 mb-3" size={32} />
                  <h3 className="text-lg font-semibold text-amber-200 mb-2">Music</h3>
                  <p className="text-sm text-amber-100/70">Discover amazing musical compositions from talented artists worldwide.</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-lg p-6 border border-amber-500/20 shadow-neon">
                  <Headphones className="text-amber-400 mb-3" size={32} />
                  <h3 className="text-lg font-semibold text-amber-200 mb-2">Podcasts</h3>
                  <p className="text-sm text-amber-100/70">Listen to engaging conversations and educational content.</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-lg p-6 border border-amber-500/20 shadow-neon">
                  <Mic className="text-amber-400 mb-3" size={32} />
                  <h3 className="text-lg font-semibold text-amber-200 mb-2">Stories</h3>
                  <p className="text-sm text-amber-100/70">Immerse yourself in captivating audio stories and narratives.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
