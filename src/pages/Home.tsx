
import { useState, useEffect } from "react";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ArtistProfilesList from "@/components/ArtistProfilesList";
import { supabase } from "@/integrations/supabase/client";
import { Play, Clock } from "lucide-react";

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
    // You can implement audio player functionality here
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start w-full bg-background pb-10 relative">
      <Navbar />
      <div className="w-full" style={{ height: 72 }} />
      <HeroSection
        active={active}
        setActive={setActive}
        search={search}
        setSearch={setSearch}
      />

      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl glass-card p-8 animate-fade-in">
          <AudioStoryFeed category={active} search={search} />
          
          {/* Artists section only under the ALL section */}
          {active === "all" && (
            <div className="mt-10">
              <div className="text-xl font-bold mb-4">Artists</div>
              <div className="w-full min-h-[120px] rounded-lg border border-dashed border-primary/50 bg-muted/40 px-4 py-4">
                <ArtistProfilesList
                  selectedArtistId={selectedArtistId}
                  onSelectArtist={setSelectedArtistId}
                />
                
                {/* Show songs by selected artist below */}
                {selectedArtistId && (
                  <div className="mt-8">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">
                        Songs by {selectedArtistName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {artistSongs.length} {artistSongs.length === 1 ? 'song' : 'songs'}
                      </p>
                    </div>
                    
                    {songsLoading ? (
                      <div className="flex w-full justify-center py-8 text-muted-foreground">
                        Loading songs...
                      </div>
                    ) : artistSongs.length === 0 ? (
                      <div className="flex w-full justify-center py-8 text-muted-foreground">
                        No songs uploaded yet.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {artistSongs.map(song => (
                          <SongCard
                            key={song.id}
                            title={song.title}
                            cover_image_url={song.cover_image_url}
                            created_at={song.created_at}
                            onClick={() => handleSongPlay(song)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
