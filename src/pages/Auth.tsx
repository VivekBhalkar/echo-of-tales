
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate("/stories");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      // Always set redirect for magic link flows
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/` }
      });
      if (!error) {
        toast({title: "Check your email!", description: "A confirmation link was sent."});
      } else {
        toast({ title: "Sign up error", description: error.message, variant: "destructive"});
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        toast({title: "Signed in!"});
        navigate("/stories");
      } else {
        toast({ title: "Login error", description: error.message, variant: "destructive"});
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-card shadow-xl p-8 rounded-lg flex flex-col gap-4 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">{mode === "login" ? "Welcome back" : "Create an account"}</h1>
        <Input
          placeholder="Email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
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
