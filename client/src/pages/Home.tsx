import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        setLocation("/");
      }
    }
  }, [isAuthenticated, loading, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Induja HRM</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
