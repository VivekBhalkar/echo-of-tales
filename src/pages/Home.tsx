
import { useState } from "react";
import { Home, Plus, Music, Podcast, FileAudio } from "lucide-react";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import AudioStoryUpload from "@/components/AudioStoryUpload";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const FILTERS = [
  { id: "all", label: "All", icon: Home },
  { id: "music", label: "Music", icon: Music },
  { id: "podcast", label: "Podcast", icon: Podcast },
  { id: "stories", label: "Stories", icon: FileAudio }
];

export default function HomePage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");

  // Placeholder for search/filter logic in AudioStoryFeed if needed

  return (
    <div className="min-h-screen flex flex-col items-center justify-start w-full bg-background pb-10">
      {/* Top glass nav bar */}
      <div className="w-full flex items-center justify-between sticky top-0 z-40 py-4 px-4 md:px-8 glass-card backdrop-blur-lg border border-glass-border shadow-md bg-glass-bg/70">
        {/* Home Icon */}
        <button
          className="icon-btn"
          aria-label="Home"
          onClick={() => window.location.href='/'}
        >
          <Home size={22} className="text-primary" />
        </button>
        {/* Search Bar */}
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            className="glass-input outline-none w-full max-w-[340px] mx-2 shadow"
            placeholder="Search stories, music, podcasts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Add Button */}
        <Sheet open={uploadOpen} onOpenChange={setUploadOpen}>
          <SheetTrigger asChild>
            <button aria-label="Add" className="icon-btn ml-2">
              <Plus size={22} className="text-primary" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="glass-sheet">
            <h2 className="mb-4 text-xl font-bold" style={{color: "var(--primary)"}}>Upload a Story</h2>
            <AudioStoryUpload onUpload={() => setUploadOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      {/* Filters as tabs */}
      <div className="flex items-center justify-center gap-2 mt-8 mb-7 w-full max-w-lg">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            className={`tab-btn${active === filter.id ? " active" : ""}`}
            onClick={() => setActive(filter.id)}
          >
            <filter.icon size={18} className="inline mr-1" />
            {filter.label}
          </button>
        ))}
      </div>
      {/* Stories section */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-2xl glass-card p-8">
          {/* "All" tab shows recent stories; others can be implemented later */}
          {active === "all" ? (
            <AudioStoryFeed />
          ) : (
            <div className="text-center text-muted-foreground py-16">
              {active.charAt(0).toUpperCase() + active.slice(1)} section coming soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
