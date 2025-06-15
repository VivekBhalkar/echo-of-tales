
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, Plus, Music, Podcast, FileAudio } from "lucide-react";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import AudioStoryUpload from "@/components/AudioStoryUpload";
import { Button } from "@/components/ui/button";

const FILTERS = [
  { id: "all", label: "All", icon: Home },
  { id: "music", label: "Music", icon: Music },
  { id: "podcast", label: "Podcast", icon: Podcast },
  { id: "stories", label: "Stories", icon: FileAudio }
];

export default function HomePage() {
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start w-full bg-background pb-10 relative">
      {/* Top Nav Bar */}
      <div className="w-full flex items-center justify-between sticky top-0 z-40 py-5 px-2 md:px-8 glass-card backdrop-blur-lg border border-glass-border shadow-lg bg-glass-bg/90">
        {/* Home Icon */}
        <button
          className="icon-btn"
          aria-label="Home"
          onClick={() => window.location.href='/'}
        >
          <Home size={24} className="text-primary" />
        </button>

        {/* Centered search bar */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-1 justify-center w-full">
          <input
            type="text"
            className="glass-input outline-none w-full max-w-[340px] mx-2 shadow text-base"
            placeholder="Search stories, music, podcasts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "rgba(48,54,76,0.96)",
            }}
          />
        </div>

        {/* Add Button -- routes to /stories using Link for reliability */}
        <Button
          asChild
          aria-label="Add"
          className="icon-btn ml-2"
        >
          <Link to="/stories">
            <Plus size={24} className="text-primary" />
          </Link>
        </Button>
      </div>

      {/* Filters as smooth tabs */}
      <div className="flex items-center justify-center gap-3 mt-11 mb-9 w-full max-w-lg">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            className={`tab-btn drop-shadow-sm backdrop-blur transition-all duration-150 ${active === filter.id ? "active scale-105" : ""}`}
            onClick={() => setActive(filter.id)}
            style={active === filter.id ? {
              background: "rgba(37,41,57,0.90)",
              borderColor: "var(--primary)",
              color: "var(--primary)",
              boxShadow: "0 0 16px 0 var(--primary), 0 1.5px 7px 0 rgba(90,120,255,0.08)"
            } : undefined}
          >
            <filter.icon size={18} className="inline mr-1" />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Stories section */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-2xl glass-card p-8 animate-fade-in">
          <AudioStoryFeed category={active} search={search} />
        </div>
      </div>
    </div>
  );
}
