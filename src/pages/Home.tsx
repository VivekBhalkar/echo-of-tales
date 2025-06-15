import { useState } from "react";
import AudioStoryFeed from "@/components/AudioStoryFeed";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ArtistProfilesList from "@/components/ArtistProfilesList";

export default function HomePage() {
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start w-full bg-background pb-10 relative">
      {/* Consistent Navbar */}
      <Navbar />
      {/* Yeh spacer div hai! */}
      <div className="w-full" style={{ height: 72 }} /> {/* height same as Navbar + shadow */}
      {/* HERO section */}
      <HeroSection
        active={active}
        setActive={setActive}
        search={search}
        setSearch={setSearch}
      />

      {/* Stories section */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-2xl glass-card p-8 animate-fade-in">
          <AudioStoryFeed category={active} search={search} />

          {/* Add artist section under the ALL section */}
          {active === "all" && (
            <div className="mt-10">
              <div className="text-xl font-bold mb-3">Artists</div>
              {/* Show real artist profiles */}
              <div
                className="w-full min-h-[80px] rounded-lg border border-dashed border-primary/50 bg-muted/40 px-3 py-2"
                style={{ minHeight: 120 }}
              >
                <ArtistProfilesList />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
