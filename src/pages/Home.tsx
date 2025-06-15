
import { useState, useEffect } from "react";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ArtistProfilesList from "@/components/ArtistProfilesList";
import { supabase } from "@/integrations/supabase/client";

// SongCard is an inline component for displaying a song
function SongCard({ title, cover_image_url }: { title: string, cover_image_url?: string | null }) {
  return (
    <div className="flex flex-col w-32 md:w-36 m-1 rounded-lg border bg-background shadow-sm hover:shadow-lg cursor-pointer hover-scale transition">
      <div className="relative w-full h-32 md:h-36 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
        {cover_image_url
          ? <img src={cover_image_url} alt={title} className="object-cover w-full h-full" />
          : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted">No Image</div>
        }
      </div>
      <div className="flex-shrink-0 px-2 py-1 text-xs font-medium text-center truncate">{title}</div>
    </div>
  );
}

export default function HomePage() {
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [artistSongs, setArtistSongs] = useState<any[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);

  // Fetch songs for the selected artist
  useEffect(() => {
    const fetchSongs = async () => {
      if (!selectedArtistId) {
        setArtistSongs([]);
        setSongsLoading(false);
        return;
      }
      setSongsLoading(true);
      const { data: stories, error } = await supabase
        .from("audio_stories")
        .select("id, title, audio_url, cover_image_url, category, created_at")
        .eq("uploaded_by", selectedArtistId)
        .order("created_at", { ascending: false });
      setArtistSongs(error || !stories ? [] : stories);
      setSongsLoading(false);
    };
    fetchSongs();
  }, [selectedArtistId]);

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
        <div className="w-full max-w-2xl glass-card p-8 animate-fade-in">
          <AudioStoryFeed category={active} search={search} />
          {/* Artists section only under the ALL section */}
          {active === "all" && (
            <div className="mt-10">
              <div className="text-xl font-bold mb-3">Artists</div>
              <div
                className="w-full min-h-[80px] rounded-lg border border-dashed border-primary/50 bg-muted/40 px-3 py-2"
                style={{ minHeight: 120 }}
              >
                <ArtistProfilesList
                  selectedArtistId={selectedArtistId}
                  onSelectArtist={setSelectedArtistId}
                />
                {/* Show songs by selected artist below */}
                {selectedArtistId && (
                  <div className="mt-7">
                    <div className="mb-2 text-base font-semibold">
                      Songs by this artist:
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
                      <div className="flex flex-row flex-wrap gap-4 justify-start">
                        {artistSongs.map(song => (
                          <SongCard
                            key={song.id}
                            title={song.title}
                            cover_image_url={song.cover_image_url}
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
