import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Trophy, TrendingUp, Users, Eye, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

// Import hand-drawn illustrations
import heroSketch from "@assets/generated_images/Hero_habit_tracking_sketch_ef2aab98.png";
import goalSketch from "@assets/generated_images/Goal_tracking_target_sketch_ea91d7a4.png";
import trophySketch from "@assets/generated_images/Gamification_trophy_sketch_ccd9824b.png";
import aiSketch from "@assets/generated_images/AI_insights_brain_sketch_445adf00.png";
import dashboardSketch from "@assets/generated_images/Dashboard_analytics_sketch_ca998966.png";
import journeySketch from "@assets/generated_images/Journey_progress_climbing_sketch_30b0a104.png";

export function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/app");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="font-['Lexend_Giga'] font-normal">n0ventum</span>
          </h1>
          <div className="flex justify-center mb-8">
            <img 
              src={heroSketch} 
              alt="Hand-drawn illustration of habit tracking" 
              className="max-w-md w-full h-auto opacity-80 rounded-lg"
            />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Transform your daily routines into powerful habits with gamification, 
            AI insights, and progress tracking that keeps you motivated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Get Started
            </Button>
            <Button 
              onClick={() => setLocation("/demo")}
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              Try Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Note: This demo uses mock authentication for development purposes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <img 
                src={goalSketch} 
                alt="Goal tracking illustration" 
                className="w-20 h-20 mx-auto mb-4 opacity-80"
              />
              <CardTitle>Goal Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Set meaningful habits and track your progress with visual indicators and streaks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <img 
                src={trophySketch} 
                alt="Gamification illustration" 
                className="w-20 h-20 mx-auto mb-4 opacity-80"
              />
              <CardTitle>Gamification</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Level up your habits, earn badges, and unlock achievements as you progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <img 
                src={aiSketch} 
                alt="AI insights illustration" 
                className="w-20 h-20 mx-auto mb-4 opacity-80"
              />
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get personalized suggestions and weekly insights powered by AI analysis.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <img 
                src={dashboardSketch} 
                alt="Personal dashboard illustration" 
                className="w-20 h-20 mx-auto mb-4 opacity-80"
              />
              <CardTitle>Personal Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Monitor your habit health, completion rates, and long-term trends.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="text-center md:text-left order-2 md:order-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of users who have built lasting habits with our platform. Every small step leads to meaningful progress.
            </p>
            <Button 
              onClick={handleLogin}
              size="lg" 
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg"
            >
              Start Your Journey
            </Button>
          </div>
          <div className="flex justify-center order-1 md:order-2">
            <img 
              src={journeySketch} 
              alt="Hand-drawn illustration of progress journey" 
              className="max-w-sm w-full h-auto opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}