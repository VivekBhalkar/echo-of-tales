
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

function getInitials(name: string | null) {
  if (!name) return "U";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
}

interface ArtistProfilesListProps {
  selectedArtistId: string | null;
  onSelectArtist: (artistId: string | null) => void;
}

export default function ArtistProfilesList({ selectedArtistId, onSelectArtist }: ArtistProfilesListProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtists() {
      setLoading(true);
      const { data: stories, error: storyErr } = await supabase
        .from("audio_stories")
        .select("uploaded_by")
        .neq("uploaded_by", null);

      if (storyErr || !stories) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      const userIds: string[] = Array.from(new Set(stories.map(x => x.uploaded_by)));

      if (userIds.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      const { data: artistProfiles, error: profileErr } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      if (profileErr || !artistProfiles) {
        setProfiles([]);
      } else {
        setProfiles(
          [...artistProfiles].sort((a, b) =>
            (a.name || a.id).localeCompare(b.name || b.id)
          )
        );
      }

      setLoading(false);
    }
    fetchArtists();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full justify-center items-center py-10 text-muted-foreground">
        Loading artists...
      </div>
    );
  }

  if (!profiles.length) {
    return (
      <div className="flex w-full justify-center items-center py-10 text-muted-foreground">
        No artists found yet.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
      {/* Show an "All" option to clear selection */}
      <button
        onClick={() => onSelectArtist(null)}
        className={`flex flex-col items-center w-20 px-1 py-2 rounded-xl cursor-pointer border-2 transition
          ${selectedArtistId === null ? 'border-primary bg-primary/10 shadow-md' : 'border-transparent hover:bg-muted/70'}
        `}
        aria-label="Show all artists"
      >
        <Avatar className="h-10 w-10 ring-2 ring-primary flex items-center justify-center">
          <AvatarFallback className="bg-muted text-lg flex items-center justify-center">
            <UserIcon size={18} />
          </AvatarFallback>
        </Avatar>
        <span className="mt-1 text-xs font-semibold truncate text-center">All</span>
      </button>
      {profiles.map((profile) => (
        <button
          key={profile.id}
          onClick={() => onSelectArtist(profile.id)}
          className={`flex flex-col items-center w-20 px-1 py-2 rounded-xl cursor-pointer border-2 transition
            ${selectedArtistId === profile.id ? 'border-primary bg-primary/10 shadow-md' : 'border-transparent hover:bg-muted/70'}
          `}
          aria-label={profile.name || 'Artist profile'}
        >
          <Avatar className="h-10 w-10 ring-2 ring-primary">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.name || "Artist"} />
            ) : (
              <AvatarFallback className="text-lg bg-muted">
                {getInitials(profile.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="mt-1 w-full text-xs text-center truncate">
            {profile.name || (
              <span className="opacity-60 italic flex items-center justify-center gap-1">
                <UserIcon size={12} /> Unknown
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
