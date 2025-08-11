import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Trophy, TrendingUp, Users, Eye, LogIn, Brain, Calendar, BarChart3, Zap, CheckCircle, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

import heroImage from "@assets/generated_images/habit_tracking_morning_routine_c8f727d7.png";
import dashboardImage from "@assets/generated_images/progress_tracking_dashboard_interface_526ccd8d.png";
import gamificationImage from "@assets/generated_images/gamification_achievement_badges_c94b9c98.png";

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
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="text-left">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Build <span className="text-blue-600">lasting habits</span> with <span className="font-['Lexend_Giga'] font-normal">n0ventum</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Transform your daily routines into powerful habits with our comprehensive platform featuring gamification, 
              AI-powered insights, streak tracking, and detailed analytics that keep you motivated every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Start Building Habits
              </Button>
              <Button 
                onClick={() => setLocation("/demo")}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-2"
              >
                <Eye className="h-5 w-5 mr-2" />
                Try Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Free to start • No credit card required • Works on all devices
            </p>
          </div>
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Person building habits with daily checklist" 
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">7-day streak!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Everything you need to succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Our platform combines proven behavior science with modern technology to help you build habits that stick.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <Target className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-xl">Smart Habit Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base leading-relaxed">
                Set up personalized habits with difficulty ratings, track daily completions, and visualize your progress with intuitive dashboards and completion rates.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <Trophy className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
              <CardTitle className="text-xl">Gamification System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base leading-relaxed">
                Level up your habits, earn experience points, unlock achievements, and progress through bronze to diamond tiers as you build consistency.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <Brain className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base leading-relaxed">
                Get personalized difficulty analysis, weekly insights, motivational messages, and data-driven suggestions to optimize your habit-building journey.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <BarChart3 className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <CardTitle className="text-xl">Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base leading-relaxed">
                Monitor completion rates, streak patterns, habit health scores, and long-term trends with comprehensive analytics and progress visualization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <Calendar className="w-16 h-16 mx-auto text-orange-600 mb-4" />
              <CardTitle className="text-xl">Weekly Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base leading-relaxed">
                Reflect on your progress with structured weekly reviews, set goals for the upcoming week, and track your personal growth over time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <Zap className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <CardTitle className="text-xl">Streak Motivation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base leading-relaxed">
                Build momentum with streak tracking, consistency rewards, and motivational features that help you maintain your habits day after day.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 mb-20 shadow-xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How n0ventum works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our science-backed approach makes habit building simple, engaging, and sustainable.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create Your Habits</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Set up personalized habits with custom names, difficulty levels, and emojis. Our AI analyzes each habit to provide tailored difficulty ratings and suggestions.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Track Daily Progress</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Check off completed habits, earn experience points, and build streaks. Rate your punctuality and adherence to understand your patterns better.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Level Up & Improve</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Unlock achievements, advance through tiers, and receive AI-powered insights. Use weekly reviews to reflect and plan for continuous improvement.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Comprehensive Progress Tracking
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Monitor your habits with detailed analytics including completion rates, streak patterns, and habit health scores. 
              Visualize your progress with charts, graphs, and intuitive dashboards that show your growth over time.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Real-time completion tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Streak visualization and statistics</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Habit health and performance metrics</span>
              </div>
            </div>
          </div>
          <div className="order-first lg:order-last">
            <img 
              src={dashboardImage} 
              alt="Progress tracking dashboard" 
              className="rounded-2xl shadow-xl w-full"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <img 
              src={gamificationImage} 
              alt="Gamification and achievement system" 
              className="rounded-2xl shadow-xl w-full"
            />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Engaging Gamification System
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Stay motivated with our comprehensive gamification system featuring experience points, levels, badges, and tier progression. 
              Earn achievements for consistency, milestones, and special accomplishments as you build lasting habits.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">23 unique achievements to unlock</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Bronze to Diamond tier progression</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Experience points and mastery tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center mb-20">
          <h2 className="text-4xl font-bold mb-6">
            Why choose n0ventum?
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Built by habit-building enthusiasts, for people serious about personal growth and lasting change.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-2">Science-Based</h3>
              <p className="opacity-90">Built on proven behavioral psychology and habit formation research</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Cross-Platform</h3>
              <p className="opacity-90">Works seamlessly on desktop, tablet, and mobile devices</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="opacity-90">Your personal data stays secure with enterprise-grade protection</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to build habits that stick?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their lives with n0ventum. Start your habit-building journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Start Your Journey
            </Button>
            <Button 
              onClick={() => setLocation("/demo")}
              variant="outline"
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-12 py-4 text-lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              Try Demo First
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Note: Demo uses mock authentication for development purposes
          </p>
        </div>
      </div>
    </div>
  );
}