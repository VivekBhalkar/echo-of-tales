import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
    <nav className="flex justify-between items-center px-6 py-3 bg-card shadow-sm sticky top-0 z-40">
      <Link to="/stories" className="text-2xl font-bold tracking-tight">AudioStory</Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-sm">{user.email}</span>
            <Button variant="outline" onClick={signOut}>Logout</Button>
          </>
        ) : (
          <>
            <Button asChild variant="default">
              <Link to="/auth">Login</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
