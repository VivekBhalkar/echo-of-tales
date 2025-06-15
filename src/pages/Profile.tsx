import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User as UserIcon, Loader2, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Util for initials
function getInitials(name: string | null) {
  if (!name) return "U";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // avatar upload state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user and profile data
  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (!error && data) {
          setProfile(data);
          setEditName(data.name || "");
        }
      }
      setLoading(false);
    };
    getUserAndProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          getUserAndProfile();
        }, 0);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  // Handle profile name update
  const handleSave = async () => {
    if (!profile || saving || editName.trim() === "" || editName === profile.name) return;
    setSaving(true);
    const { error, data } = await supabase
      .from("profiles")
      .update({ name: editName, updated_at: new Date().toISOString() })
      .eq("id", profile.id)
      .select()
      .single();
    setSaving(false);
    if (!error) {
      setProfile(data);
      toast({ title: "Profile updated!" });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate("/auth");
  };

  // Avatar upload logic
  const onAvatarClick = () => {
    if (uploading) return; // Don't allow new upload while uploading
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset so user can reselect same file if needed
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file is .jpg (or .jpeg)
    if (!file.type.match(/^image\/jpeg$/)) {
      toast({ title: "Only .jpg images allowed", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Not authenticated", variant: "destructive" });
      return;
    }

    setUploading(true);
    const filename = `${user.id}_${Date.now()}.jpg`;
    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filename, file, { upsert: true, contentType: "image/jpeg" });
      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filename);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL for uploaded image.");

      // Update profile.avatar_url
      const { error: updateError, data: updatedProfile } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(updatedProfile);
      toast({ title: "Profile photo updated!" });
    } catch (err: any) {
      toast({ title: "Failed to upload photo", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <Avatar className="h-14 w-14 mb-2">
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <div className="font-semibold text-base">No profile found</div>
        <Button className="mt-4" onClick={() => navigate("/auth")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-card p-6 rounded-xl shadow flex flex-col items-center gap-6 border border-primary/10">
      {/* Back button */}
      <div className="w-full flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/home")}
          className="mb-4"
          aria-label="Back to home"
        >
          <ArrowLeft size={22} />
        </Button>
      </div>
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="relative h-20 w-20 mb-1">
          <Avatar className="h-20 w-20 ring-2 ring-primary">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.name || "User"} />
            ) : (
              <AvatarFallback className="text-2xl bg-muted">
                {getInitials(profile.name)}
              </AvatarFallback>
            )}
          </Avatar>
          {/* Plus symbol overlays bottom-right of avatar */}
          <button
            type="button"
            className="absolute right-0 bottom-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center w-8 h-8 border-2 border-background shadow-lg disabled:opacity-60"
            onClick={onAvatarClick}
            aria-label={uploading ? "Uploading..." : "Upload new photo"}
            disabled={uploading}
            style={{ cursor: uploading ? "not-allowed" : "pointer" }}
          >
            {uploading
              ? <Loader2 className="animate-spin" size={20} />
              : <Plus size={24} />}
          </button>
          {/* Actual hidden file input */}
          <input
            type="file"
            accept=".jpg,image/jpeg"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
        </div>
      </div>
      {/* Center the name field */}
      <div className="flex flex-col w-full items-center gap-2 text-center">
        <label className="text-sm font-bold mb-0.5 w-full text-center">Name:</label>
        <div className="flex gap-2 w-full justify-center">
          <Input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="max-w-[160px] py-1.5 text-base flex-1 text-center"
            placeholder="Your Name"
            disabled={saving}
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || editName.trim() === "" || editName === profile.name}
            className="px-2"
            variant="secondary"
            type="button"
            style={{ minWidth: "2.8rem" }}
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : "Save"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col w-full items-center gap-1 mt-2">
        <label className="text-sm font-bold">Email:</label>
        <div className="w-full text-center text-base text-muted-foreground truncate">{user.email}</div>
      </div>
      <div className="w-full pt-4">
        <Button
          className="w-full"
          variant="destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2" size={18} />
          Sign out
        </Button>
      </div>
    </div>
  );
}
