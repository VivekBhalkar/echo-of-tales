import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import AudioStoryUpload from "@/components/AudioStoryUpload";
import Navbar from "@/components/Navbar";
import StoriesHeroSection from "@/components/StoriesHeroSection";
import { supabase } from "@/integrations/supabase/client";

export default function StoriesPage() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/auth");
      setUser(data.user);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, []);

  // Refetch stories on upload
  const [refreshFeed, setRefreshFeed] = useState(0);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <StoriesHeroSection />
      <div className="max-w-3xl mx-auto pt-2 px-2">
        {user && (
          <div className="mb-6 rounded-lg p-4 bg-card border border-primary/60">
            <AudioStoryUpload onUpload={() => setRefreshFeed(x => x + 1)} />
          </div>
        )}
        <div className="rounded-lg bg-card/80 border border-primary/50 shadow-neon">
          <AudioStoryFeed key={refreshFeed} />
        </div>
      </div>
    </div>
  );
}
