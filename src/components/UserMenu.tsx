
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Util to get initials
function getInitials(name: string | null) {
  if (!name) return "U";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
}

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          .single();
        if (!error) {
          setProfile(data);
          setEditName(data.name || "");
        }
      }
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

  // --- Avatar upload ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setAvatarFile(file);

    // No storage bucket yet, maybe add later!
    toast({ title: "Avatar upload not implemented", description: "Avatar upload coming soon." });
    // Optionally, once storage bucket is implemented, upload and update profile.avatar_url here.
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate("/"); // Go to home on logout
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Profile menu">
          <Avatar>
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.name || "User"} />
            ) : (
              <AvatarFallback>
                {getInitials(profile.name)}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <div className="flex flex-col items-center p-2">
          <Avatar className="h-14 w-14 mb-2">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.name || "User"} />
            ) : (
              <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
            )}
          </Avatar>
          <div className="w-full text-center">
            <div className="font-semibold text-base">{profile.name || "No Name"}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <label className="block text-xs mb-1 font-medium">Edit Name</label>
          <div className="flex gap-2">
            <Input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="max-w-[120px] py-1.5 text-xs"
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
              style={{ minWidth: "2.3rem" }}
            >
              {saving ? <Loader2 className="animate-spin" size={14} /> : "Save"}
            </Button>
          </div>
        </div>
        <div className="px-2 py-1">
          <label className="block text-xs mb-1 font-medium">Photo (unavailable)</label>
          <Input
            type="file"
            className="max-w-[160px] py-1.5 text-xs"
            disabled
            onChange={handleAvatarChange}
            accept="image/*"
          />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
          <LogOut className="mr-2 w-4 h-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
