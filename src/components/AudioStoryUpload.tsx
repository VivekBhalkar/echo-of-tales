
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onUpload?: () => void;
}

export default function AudioStoryUpload({ onUpload }: Props) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
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
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    // 1. Upload file
    const { data: storageData, error: storageErr } = await supabase
      .storage
      .from("story-audio")
      .upload(filePath, file);
    if (storageErr) {
      toast({title: "Upload failed", description: storageErr.message, variant: "destructive"});
      setUploading(false);
      return;
    }
    // 2. Create DB record
    const { error: dbErr } = await supabase.from("audio_stories").insert([
      {
        title,
        audio_url: `https://pxnwcbxhqwsuoqmvcsph.supabase.co/storage/v1/object/public/story-audio/${filePath}`,
        uploaded_by: user.id
      }
    ]);
    if (dbErr) {
      toast({title: "Failed to save story", description: dbErr.message, variant: "destructive"});
    } else {
      toast({title:"Story uploaded!"});
      setTitle("");
      setFile(null);
      if (onUpload) onUpload();
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4 bg-card shadow-md rounded-xl p-6 w-full max-w-md mx-auto mb-6">
      <h2 className="text-xl font-bold">Upload a story</h2>
      <Input 
        placeholder="Story title"
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={uploading}
      />
      <Input 
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <Button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
