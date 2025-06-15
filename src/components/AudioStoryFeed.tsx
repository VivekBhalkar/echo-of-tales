
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

// Use the Supabase-generated row type for audio_stories, now with category!
type AudioStoryRow = Database["public"]["Tables"]["audio_stories"]["Row"];

interface AudioStoryFeedProps {
  search?: string;
  category?: string;
}

export default function AudioStoryFeed({ search = "", category = "all" }: AudioStoryFeedProps) {
  const [stories, setStories] = useState<AudioStoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase
        .from("audio_stories")
        .select("id, title, category, audio_url, created_at, cover_image_url, uploaded_by") // include category!
        .order("created_at", { ascending: false })
        .limit(30);

      // Apply category filter if not "all"
      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      // Be explicit with the returned data type to avoid deep inference issues
      const { data, error } = await query;
      let filtered: AudioStoryRow[] = [];
      if (!error && data) {
        filtered = (data as AudioStoryRow[]);
        if (search) {
          filtered = filtered.filter(story =>
            (story.title || "").toLowerCase().includes(search.toLowerCase())
          );
        }
      }
      setStories(filtered);
      setLoading(false);
    })();
  }, [search, category]);

  // Section label logic
  let sectionLabel = "All";
  if (category && category !== "all") {
    sectionLabel = category.charAt(0).toUpperCase() + category.slice(1);
  }

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-bold mb-4 w-full text-left max-w-2xl">
        {sectionLabel} {search && <>/ <span className="font-normal">Search: {search}</span></>}
      </h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : stories.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No {sectionLabel.toLowerCase()} found.
        </div>
      ) : (
        <div className="space-y-4 w-full max-w-2xl animate-fade-in">
          {stories.map((story) => (
            <Card key={story.id} className="p-4 flex flex-col bg-card/90 backdrop-blur relative overflow-hidden">
              {/* Show Cover Image if present */}
              {story.cover_image_url && (
                <div className="w-full h-36 md:h-48 rounded-lg overflow-hidden mb-3 bg-muted/60 relative">
                  <img
                    src={story.cover_image_url}
                    alt={story.title + " cover"}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: "center" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-transparent pointer-events-none" />
                </div>
              )}
              <div className="font-semibold mb-1">{story.title}</div>
              <audio controls src={story.audio_url} className="w-full mt-2"/>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>
                  {story.category
                    ? story.category.charAt(0).toUpperCase() + story.category.slice(1)
                    : "Uncategorized"}
                </span>
                <span>
                  Uploaded {story.created_at ? new Date(story.created_at).toLocaleString() : ""}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
