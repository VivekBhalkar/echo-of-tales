
// Main landing page

import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import { Button } from "@/components/ui/button";

const Index = () => (
  <div className="bg-background min-h-screen">
    <Navbar />
    <div className="flex flex-col gap-12 items-center justify-center max-w-2xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight neon-text font-neon">
          Spotify-like Audio Stories
        </h1>
        <p className="text-xl text-muted-foreground mb-4" style={{ color: "#00eb69" }}>
          Listen to and upload audio stories! <br />
          Sign in to contribute your own, or browse the latest stories.
        </p>
        <Button asChild className="btn-lighting shadow-neon font-neon text-base">
          <Link to="/stories">See Recent Stories</Link>
        </Button>
      </div>
      <div className="w-full">
        <AudioStoryFeed />
      </div>
    </div>
  </div>
);

export default Index;
