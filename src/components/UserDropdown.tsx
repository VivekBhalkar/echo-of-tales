import { useState, useEffect, useRef, useLayoutEffect } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown position state
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});

  // this margin ensures the dropdown is always at least 9px away from browser edges
  const SCREEN_MARGIN = 9; // 0.5cm ~= 18.9px

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

  // Position the dropdown: centered under icon, but clamped 0-9px from edges
  useLayoutEffect(() => {
    if (open && dropdownRef.current && menuRef.current) {
      const dropdown = dropdownRef.current;
      const button = menuRef.current;
      const dropdownRect = dropdown.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      // Center dropdown horizontally below user icon
      let left =
        buttonRect.left + buttonRect.width / 2 - dropdownRect.width / 2;
      // Clamp left so dropdown stays within 0-9px margin of window
      left = Math.max(SCREEN_MARGIN, left);
      // If it would overflow right, clamp back in
      if (left + dropdownRect.width > windowWidth - SCREEN_MARGIN) {
        left = windowWidth - SCREEN_MARGIN - dropdownRect.width;
      }
      // Never allow negative left
      left = Math.max(left, SCREEN_MARGIN);

      setDropdownStyles({
        position: "absolute",
        top: button.offsetHeight + 8,
        minWidth: 200,
        left: left,
        zIndex: 60,
      });
    }
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
        style={{
          boxShadow: open
            ? "0 0 14px 3px #2295ff88, 0 2px 8px #0002"
            : undefined,
          transition: "box-shadow 0.2s",
        }}
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            <UserIcon size={20} className="text-primary" />
          </AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div
          ref={dropdownRef}
          style={{
            ...dropdownStyles,
            background: "var(--card, #111827)",
            borderRadius: "0.5rem",
            border: "1px solid var(--border, #1e293b)",
            boxShadow: "0 0 24px 6px #2295ff77, 0 8px 28px #0002",
            padding: 16,
            marginTop: 0,
            animation: "fade-in 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="z-[60] p-4 min-w-[200px] animate-fade-in"
        >
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
