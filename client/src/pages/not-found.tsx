import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-muted-foreground">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Button onClick={() => window.location.href = "/"} className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Go Home
        </Button>
      </div>
    </div>
  );
}