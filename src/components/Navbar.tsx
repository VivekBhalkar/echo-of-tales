
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/UserMenu";

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
      <div className="flex items-center gap-3" style={{ minHeight: 40 }}>
        {/* Show Avatar if logged in, else nothing */}
        {user ? (
          <UserMenu />
        ) : null}
      </div>
      <div className="flex gap-4 items-center">
        {!user && (
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
