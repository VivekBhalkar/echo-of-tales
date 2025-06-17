
import React from "react";
import { FileAudio, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function StoriesHeroSection() {
  return (
    <section
      className="w-full flex flex-col items-center justify-center pt-[86px] pb-8 px-3 bg-background border-b border-amber-500/30 shadow-lg animate-fade-in relative"
      style={{ 
        minHeight: 120,
        backgroundImage: "url('/lovable-uploads/100c870b-a737-49cb-a975-1ec080560c2a.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Content with relative positioning */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="max-w-2xl w-full flex flex-col items-center text-center mb-4">
          <div className="flex items-center gap-3 mb-3 text-amber-400">
            <div className="p-2 rounded-full bg-amber-500/20 audio-glow">
              <FileAudio size={28} />
            </div>
            <span className="font-neon text-2xl tracking-tight font-bold text-amber-200">Audio Stories</span>
          </div>
          <p className="text-amber-100 text-base mb-4 drop-shadow-md">
            Listen, discover and share short audio stories, music, and podcasts from creators.<br />
            Use the upload button to submit your own story!
          </p>
          <Button
            asChild
            variant="default"
            className="font-neon px-6 py-3 text-base flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white border-amber-500 audio-glow"
          >
            <Link to="/stories">
              <Plus className="mr-1" size={18} />
              Upload Story
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
