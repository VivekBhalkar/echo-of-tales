
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
// Removed UserMenu import

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

  return (
    <nav className="w-full fixed left-0 top-0 z-50 flex justify-between items-center px-6 py-3 bg-card shadow-sm border-b border-primary/60">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="hover-scale">
          <Link to="/home">
            <Home size={22} className="text-primary" />
          </Link>
        </Button>
        {/* Logo Image - blue glow now */}
        <Link to="/stories" className="flex items-center select-none" style={{ minHeight: 40 }}>
          <img
            src="/lovable-uploads/1d104bc9-dd41-40e5-9f02-6d09d043d69e.png"
            alt="AudioStory Logo"
            className="h-10 w-auto max-w-[40px] rounded-xl shadow-lg bg-black"
            style={{
              objectFit: "contain",
              // Blue glow instead of green
              boxShadow: "0 0 16px #2295ffaa",
            }}
          />
        </Link>
      </div>
      <div className="flex gap-4 items-center">
        {/* Remove UserMenu, only show login button if not logged in */}
        {!user && (
          <Button
            asChild
            variant="default"
            className="font-neon"
          >
            <Link to="/auth">Login</Link>
          </Button>
        )}
        {/* If user is logged in, show nothing */}
      </div>
    </nav>
  );
}
