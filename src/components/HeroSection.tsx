
import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Music, Podcast, FileAudio, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Categories list
const FILTERS = [
  { id: "all", label: "All", icon: Home },
  { id: "music", label: "Music", icon: Music },
  { id: "podcast", label: "Podcast", icon: Podcast },
  { id: "stories", label: "Stories", icon: FileAudio }
];

interface HeroSectionProps {
  active: string;
  setActive: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
}

export default function HeroSection({ active, setActive, search, setSearch }: HeroSectionProps) {
  return (
    <section className="w-full flex flex-col items-center justify-center pt-3 pb-8 bg-background">
      {/* App title and tagline */}
      <div className="max-w-2xl flex flex-col items-center mb-7 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-primary text-center mb-2 tracking-tight">
          Discover, Listen & Share
        </h1>
        <p className="text-base md:text-lg text-muted-foreground text-center mb-5">
          Browse audio stories, music and podcasts.<br />
          Start by choosing a category or upload your own story!
        </p>
        {/* Stories page button */}
        <Button
          asChild
          className="mt-2 font-neon px-6 py-3 md:text-lg flex items-center gap-2"
          variant="default"
          title="Upload or Browse Stories"
        >
          <Link to="/stories">
            <Plus className="mr-1" size={20} />
            Add / Stories
          </Link>
        </Button>
      </div>
      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-3 mb-5 w-full max-w-lg">
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
      {/* Search bar */}
      <div className="flex justify-center w-full mb-3">
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
    </section>
  );
}
