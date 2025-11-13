import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        setLocation("/dashboard");
      } else {
        setLocation("/login");
      }
    }
  }, [isAuthenticated, loading, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );
}
