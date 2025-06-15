
import { useState } from "react";
import { Home, Plus, Music, Podcast, FileAudio } from "lucide-react";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import AudioStoryUpload from "@/components/AudioStoryUpload";
import Navbar from "@/components/Navbar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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

  // You may implement search/filter logic in the feed if needed

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      {/* Top bar: Home icon, search bar, Add button */}
      <div className="flex items-center justify-between gap-2 sticky top-0 z-30 bg-card/90 border-b border-primary/30 px-4 py-3 backdrop-blur shadow-sm mb-2">
        {/* Home icon - clicking sends to home (reloads) */}
        <Button variant="ghost" size="icon" className="hover-scale" onClick={() => window.location.href = "/"}>
          <Home size={22} className="text-primary" />
        </Button>
        {/* Search bar */}
        <div className="flex-1 max-w-md mx-2">
          <Input
            type="search"
            placeholder="Search stories, music, podcasts..."
            className="rounded-full bg-background border border-primary/20 px-4 text-foreground"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Add Story button opens upload sheet */}
        <Sheet open={uploadOpen} onOpenChange={setUploadOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover-scale" aria-label="Add">
              <Plus size={22} className="text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="max-w-md w-full shadow-neon border border-primary/30">
            <h2 className="mb-4 text-xl font-bold neon-text">Upload a Story</h2>
            <AudioStoryUpload onUpload={() => setUploadOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      {/* Filters */}
      <div className="flex items-center w-full justify-center gap-2 mb-8">
        {FILTERS.map(filter => (
          <Button
            key={filter.id}
            variant={active === filter.id ? "default" : "outline"}
            className={`rounded-full font-neon shadow-md text-base transition hover-scale
              ${active === filter.id ? "bg-primary text-background neon-text" : "border-primary/40 text-primary/80"}`}
            onClick={() => setActive(filter.id)}
          >
            <filter.icon className="mr-1" size={18} />
            {filter.label}
          </Button>
        ))}
      </div>
      {/* Audio story feed */}
      <div className="flex flex-col items-center px-2 pb-8">
        <AudioStoryFeed />
      </div>
    </div>
  );
}
