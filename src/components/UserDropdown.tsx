
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function getInitials(name: string | null) {
  if (!name) return "U";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
}

export default function UserDropdown() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ name: string | null; email: string | null } | null>(null);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setProfile({ name: data?.name || "", email: user.email || "" });
      }
    };
    getUserAndProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setTimeout(() => getUserAndProfile(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown if click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate("/auth");
  };

  if (!user || !profile) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open user menu"
        className="rounded-full flex items-center justify-center w-10 h-10 bg-muted hover:bg-accent transition"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            <UserIcon size={20} className="text-primary" />
          </AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-md bg-card border border-border shadow-lg z-50 p-4 min-w-[200px]">
          <div className="flex flex-col items-center gap-2 pb-2 border-b border-border mb-2">
            <Avatar className="h-12 w-12 mb-1 ring-1 ring-primary">
              <AvatarFallback className="text-xl">{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div className="font-semibold">{profile.name || "No name"}</div>
            <div className="text-sm text-muted-foreground truncate w-full text-center">{profile.email}</div>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
