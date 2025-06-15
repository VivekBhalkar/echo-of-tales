import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Keeps session updated in all tabs
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-card shadow-sm sticky top-0 z-40 border-b border-primary/60">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="hover-scale">
          <Link to="/home">
            <Home size={22} className="text-primary" />
          </Link>
        </Button>
        <Link
          to="/stories"
          className="text-2xl font-neon font-bold tracking-wide neon-text drop-shadow-lg"
          style={{
            textShadow:
              "0 0 6px #00ff99, 0 0 12px #00ff99, 0 0 24px #00ff99"
          }}
        >
          AudioStory
        </Link>
      </div>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-sm neon-text">{user.email}</span>
            <Button
              variant="outline"
              onClick={signOut}
              className="border-primary text-primary neon-text"
              style={{ borderColor: "#00ff99", color: "#00ff99" }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              asChild
              variant="default"
              className="btn-lighting shadow-neon font-neon"
            >
              <Link to="/auth">Login</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
