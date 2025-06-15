
import React from "react";
import { FileAudio, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function StoriesHeroSection() {
  return (
    <section
      className="w-full flex flex-col items-center justify-center pt-[86px] pb-5 px-3 bg-background border-b border-primary/30 shadow-sm animate-fade-in"
      style={{ minHeight: 110 }}
    >
      <div className="max-w-2xl w-full flex flex-col items-center text-center mb-3">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <FileAudio size={28} />
          <span className="font-neon text-2xl tracking-tight font-bold">Audio Stories</span>
        </div>
        <p className="text-muted-foreground text-base mb-3">
          Listen, discover and share short audio stories, music, and podcasts from creators.<br />
          Use the upload button to submit your own story!
        </p>
        <Button
          asChild
          variant="default"
          className="font-neon px-5 py-2 text-base flex items-center gap-2"
        >
          <Link to="/stories">
            <Plus className="mr-1" size={18} />
            Upload Story
          </Link>
        </Button>
      </div>
    </section>
  );
}
