
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import AudioStoryUpload from "@/components/AudioStoryUpload";
import Navbar from "@/components/Navbar";
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
      <div className="max-w-3xl mx-auto pt-8 px-2">
        {user && <AudioStoryUpload onUpload={() => setRefreshFeed(x => x+1)} />}
        <AudioStoryFeed key={refreshFeed}/>
      </div>
    </div>
  );
}
