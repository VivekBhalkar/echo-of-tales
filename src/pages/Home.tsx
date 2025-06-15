
import { useState } from "react";
import { Link } from "react-router-dom";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Home, Music, Podcast, FileAudio } from "lucide-react";

const FILTERS = [
  { id: "all", label: "All", icon: Home },
  { id: "music", label: "Music", icon: Music },
  { id: "podcast", label: "Podcast", icon: Podcast },
  { id: "stories", label: "Stories", icon: FileAudio }
];

export default function HomePage() {
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start w-full bg-background pb-10 relative">
      {/* Consistent Navbar */}
      <Navbar />

      {/* Filters as smooth tabs */}
      <div className="flex items-center justify-center gap-3 mt-16 mb-9 w-full max-w-lg">
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

      {/* Search bar centered below Navbar */}
      <div className="flex justify-center w-full mb-4">
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
        <Button
          asChild
          className="ml-4 w-24 min-w-[96px] h-11 text-base md:text-lg font-semibold rounded-xl flex items-center justify-center"
          title="Go to upload"
          variant="default"
        >
          <Link to="/stories">Add</Link>
        </Button>
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
