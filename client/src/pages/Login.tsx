import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_TITLE } from "@/const";
import { Loader2, Rocket, Scissors, Apple, Lightbulb, Globe } from "lucide-react";

export default function Login() {
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();
  const loginMutation = trpc.simpleAuth.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      const user = await loginMutation.mutateAsync({ name: name.trim() });
      // Store user in localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast.success(`Welcome, ${user.name}!`);
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Failed to login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[oklch(0.2_0.04_250)] via-[oklch(0.25_0.05_260)] to-[oklch(0.3_0.06_270)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Floating icons */}
          <div className="absolute top-20 left-20 animate-bounce-slow">
            <Lightbulb className="w-16 h-16 text-secondary" />
          </div>
          <div className="absolute top-40 right-32 animate-bounce-slow" style={{ animationDelay: "0.5s" }}>
            <Rocket className="w-12 h-12 text-accent" />
          </div>
          <div className="absolute bottom-32 left-32 animate-bounce-slow" style={{ animationDelay: "1s" }}>
            <Scissors className="w-14 h-14 text-destructive" />
          </div>
          <div className="absolute bottom-40 right-20 animate-bounce-slow" style={{ animationDelay: "1.5s" }}>
            <Apple className="w-12 h-12 text-destructive" />
          </div>
          <div className="absolute top-1/2 left-1/4 animate-bounce-slow" style={{ animationDelay: "0.75s" }}>
            <Globe className="w-20 h-20 text-accent" />
          </div>

          {/* Abstract shapes */}
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-secondary/20 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-accent/20 blur-2xl"></div>
          
          {/* Decorative lines */}
          <svg className="absolute top-20 right-1/3 w-32 h-32 text-primary/30" viewBox="0 0 100 100">
            <path d="M 10 50 Q 30 20 50 50 T 90 50" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 20 70 L 80 70" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="5,5" />
          </svg>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8 shadow-2xl border-2 animate-slide-in">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              The Learning Platform
            </h1>
            <p className="text-muted-foreground">
              Enter your name to get started
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Enter your name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-lg py-6"
                disabled={loginMutation.isPending}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>No account? No problem!</p>
            <p className="mt-1">Just enter your name and start learning</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
