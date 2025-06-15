
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

export default function ArtistProfilesList() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtists() {
      setLoading(true);
      // Get unique uploaded_by user ids
      const { data: stories, error: storyErr } = await supabase
        .from("audio_stories")
        .select("uploaded_by")
        .neq("uploaded_by", null);

      if (storyErr || !stories) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Get unique user ids
      const userIds: string[] = Array.from(new Set(stories.map(x => x.uploaded_by)));

      if (userIds.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for those user ids
      const { data: artistProfiles, error: profileErr } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      if (profileErr || !artistProfiles) {
        setProfiles([]);
      } else {
        // Sort alphabetically by name if any, else by id
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
    <div className="flex flex-wrap gap-5 py-3 justify-center">
      {profiles.map((profile) => (
        <div key={profile.id} className="flex flex-col items-center w-24">
          <div className="mb-1">
            <Avatar className="h-12 w-12 ring-2 ring-primary">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.name || "Artist"} />
              ) : (
                <AvatarFallback className="text-lg bg-muted">
                  {getInitials(profile.name)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="w-full text-xs text-center truncate">
            {profile.name || (
              <span className="opacity-60 italic flex items-center justify-center gap-1">
                <UserIcon size={12} /> Unknown
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
