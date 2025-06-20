
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Store user state, respond to auth state changes.
  useEffect(() => {
    let ignore = false;

    // Listen for auth state changes reliably
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (ignore) return;
      if (session?.user) {
        navigate("/stories");
      }
    });

    // On initial mount, check session as backup
    supabase.auth.getUser().then(({ data }) => {
      if (!ignore && data.user) {
        navigate("/stories");
      }
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      // Add 'name' to user_metadata
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { name }
        }
      });
      if (!error) {
        toast({ title: "Check your email!", description: "A confirmation link was sent." });
      } else {
        toast({ title: "Sign up error", description: error.message, variant: "destructive" });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        toast({ title: "Signed in!" });
        navigate("/stories");
      } else {
        toast({ title: "Login error", description: error.message, variant: "destructive" });
      }
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/stories`
      }
    });
    
    if (error) {
      toast({ title: "Google sign-in error", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-card shadow-xl p-8 rounded-lg flex flex-col gap-4 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">{mode === "login" ? "Welcome back" : "Create an account"}</h1>
        
        {/* Google Sign-in Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Input
          placeholder="Email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        {mode === "signup" && (
          <Input
            placeholder="Your Name"
            type="text"
            value={name}
            autoComplete="name"
            onChange={e => setName(e.target.value)}
            required
            disabled={loading}
          />
        )}
        <Input
          placeholder="Password"
          type="password"
          value={password}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : (mode === "login" ? "Login" : "Sign up")}
        </Button>
        <div className="flex flex-row gap-1 text-sm text-muted-foreground justify-center">
          {mode === "login" ? (
            <>
              Don't have an account?
              <button className="underline" type="button" onClick={() => setMode("signup")}>Sign up</button>
            </>
          ) : (
            <>
              Already have an account?
              <button className="underline" type="button" onClick={() => setMode("login")}>Log in</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
