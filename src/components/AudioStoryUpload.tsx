
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onUpload?: () => void;
}

const CATEGORIES = [
  { id: "music", label: "Music" },
  { id: "podcast", label: "Podcast" },
  { id: "stories", label: "Stories" },
];

// Helper to upload cover image to Supabase Storage
async function uploadCoverImage(userId: string, file: File): Promise<string | null> {
  if (!file) return null;
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/covers/${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from("audio-story-covers")
    .upload(filePath, file);
  if (error) throw new Error(error.message);
  // Return public URL
  return `https://pxnwcbxhqwsuoqmvcsph.supabase.co/storage/v1/object/public/audio-story-covers/${filePath}`;
}

export default function AudioStoryUpload({ onUpload }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("music");
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      setImageUrlPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      toast({ title: "Missing info", description: "Please add a title and select a file.", variant: "destructive"});
      return;
    }
    setUploading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast({title:"Not authenticated", description:"Please sign in!", variant: "destructive"});
      setUploading(false);
      return;
    }
    // Upload cover image if present
    let coverImageUrl: string | null = null;
    if (imageFile) {
      try {
        coverImageUrl = await uploadCoverImage(user.id, imageFile);
      } catch (err: any) {
        toast({title: "Image upload failed", description: err?.message, variant: "destructive"});
        setUploading(false);
        return;
      }
    }
    // Upload audio
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    const { data: storageData, error: storageErr } = await supabase
      .storage
      .from("story-audio")
      .upload(filePath, file);
    if (storageErr) {
      toast({title: "Upload failed", description: storageErr.message, variant: "destructive"});
      setUploading(false);
      return;
    }
    // Save to DB with (optionally) cover_image_url
    const { error: dbErr } = await supabase.from("audio_stories").insert([
      {
        title,
        category,
        audio_url: `https://pxnwcbxhqwsuoqmvcsph.supabase.co/storage/v1/object/public/story-audio/${filePath}`,
        uploaded_by: user.id,
        cover_image_url: coverImageUrl,
      }
    ]);
    if (dbErr) {
      toast({title: "Failed to save story", description: dbErr.message, variant: "destructive"});
    } else {
      toast({title:"Story uploaded!"});
      setTitle("");
      setFile(null);
      setCategory("music");
      setImageFile(null);
      setImageUrlPreview(null);
      if (onUpload) onUpload();
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-5 bg-card shadow-xl rounded-2xl p-7 w-full max-w-md mx-auto mb-2 animate-fade-in">
      <h2 className="text-xl font-bold text-primary mb-2">Upload Audio</h2>
      <Input 
        placeholder="Story title"
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={uploading}
      />
      <div className="flex justify-between items-center gap-3">
        <label className="font-semibold text-sm">Select category:</label>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              disabled={uploading}
              type="button"
              className={`px-4 py-1 rounded-full font-semibold text-xs transition 
                ${category === cat.id
                  ? "bg-primary text-white shadow" 
                  : "bg-muted text-muted-foreground hover:bg-background/60"}`
              }
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      {/* Image Upload & Preview */}
      <div>
        <label className="block font-semibold text-sm mb-1">Optional background image:</label>
        <Input 
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={uploading}
        />
        {imageUrlPreview && (
          <div className="mt-2 w-full flex justify-center">
            <img
              src={imageUrlPreview}
              alt="Image preview"
              className="max-h-32 rounded-lg border shadow-md object-cover"
              style={{ maxWidth: "220px" }}
            />
          </div>
        )}
      </div>
      <Input 
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <Button type="submit" disabled={uploading} className="btn-primary rounded-xl font-neon uppercase tracking-widest h-11 mt-2">
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}

