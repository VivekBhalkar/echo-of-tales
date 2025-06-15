
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

type AudioStory = {
  id: string;
  title: string;
  audio_url: string;
  uploaded_by: string;
  created_at: string;
};

export default function AudioStoryFeed() {
  const [stories, setStories] = useState<AudioStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("audio_stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error && data) setStories(data as AudioStory[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-bold mb-4 w-full text-left max-w-2xl">Recent Stories</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : stories.length === 0 ? (
        <div className="text-center text-muted-foreground">No stories yet.</div>
      ) : (
        <div className="space-y-4 w-full max-w-2xl">
          {stories.map((story) => (
            <Card key={story.id} className="p-4 flex flex-col">
              <div className="font-semibold mb-1">{story.title}</div>
              <audio controls src={story.audio_url} className="w-full mt-2"/>
              <span className="text-xs text-muted-foreground mt-1">
                Uploaded {new Date(story.created_at).toLocaleString()}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
