import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to m0mentum
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your daily reflection engine
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full h-10 sm:h-12 text-sm sm:text-base"
              size="lg"
            >
              Sign In
            </Button>
            
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Sign in with your Replit account to track your habits and build momentum
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}