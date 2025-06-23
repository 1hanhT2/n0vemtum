import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Trophy, TrendingUp, Users } from "lucide-react";

export function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to n0ventum
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Transform your daily routines into powerful habits with gamification, 
            AI insights, and progress tracking that keeps you motivated.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Get Started
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Note: This demo uses mock authentication for development purposes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Goal Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Set meaningful habits and track your progress with visual indicators and streaks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
              <CardTitle>Gamification</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Level up your habits, earn badges, and unlock achievements as you progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get personalized suggestions and weekly insights powered by AI analysis.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Personal Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Monitor your habit health, completion rates, and long-term trends.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users who have built lasting habits with our platform.
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
      </div>
    </div>
  );
}