
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import UserDropdown from "@/components/UserDropdown";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="w-full fixed left-0 top-0 z-50 flex justify-between items-center px-6 py-3 bg-card shadow-sm border-b border-primary/60">
      <div className="flex items-center gap-2">
        {/* Logo first */}
        <Link to="/stories" className="flex items-center select-none" style={{ minHeight: 40 }}>
          <img
            src="/lovable-uploads/1d104bc9-dd41-40e5-9f02-6d09d043d69e.png"
            alt="AudioStory Logo"
            className="h-10 w-auto max-w-[40px] rounded-xl shadow-lg bg-black"
            style={{
              objectFit: "contain",
              boxShadow: "0 0 16px #2295ffaa",
            }}
          />
        </Link>
        {/* Home Icon */}
        <Button asChild variant="ghost" size="icon" className="hover-scale">
          <Link to="/home">
            <Home size={22} className="text-primary" />
          </Link>
        </Button>
        {/* User icon next to logo and home */}
        {user && (
          <div className="ml-2">
            <UserDropdown />
          </div>
        )}
      </div>
      <div className="flex gap-4 items-center">
        {user ? (
          <Button
            variant="outline"
            size="icon"
            aria-label="Logout"
            onClick={handleLogout}
            className="hover:bg-destructive/80 hover:text-destructive"
          >
            <LogOut size={20} />
          </Button>
        ) : (
          <Button
            asChild
            variant="default"
            className="font-neon"
          >
            <Link to="/auth">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
