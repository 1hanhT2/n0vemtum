import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Trophy, TrendingUp, Users, Eye, LogIn, Brain, BarChart3, Shield, Sparkles, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { SiNike, SiAirbnb, SiDropbox, SiUber, SiShopify, SiFigma } from "react-icons/si";

export function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/app");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "Tech Startup",
      quote: "n0ventum transformed how I approach my daily habits. The gamification keeps me engaged and the AI insights are spot-on.",
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Software Engineer",
      company: "Enterprise Co",
      quote: "Finally, a habit tracker that understands motivation. The achievement system makes building habits feel like a game I want to win.",
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Designer",
      company: "Creative Agency",
      quote: "The weekly insights have been game-changing. I love how the AI analyzes my patterns and suggests improvements.",
      avatar: "ER"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-['Lexend_Giga'] text-xl font-semibold">n0ventum</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#stats" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Stats
            </a>
            <a href="#testimonials" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Reviews
            </a>
            <Button onClick={handleLogin} variant="default" className="bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
              Log in
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">500+ users building better habits daily</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Build habits that
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                actually stick.
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
              Track 23 habits, unlock 50+ achievements, and get AI-powered insights — 
              New features weekly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-8 py-6 text-lg font-medium"
              >
                Start for free
              </Button>
              <Button 
                onClick={() => setLocation("/demo")}
                variant="outline"
                size="lg"
                className="border-gray-300 dark:border-gray-700 px-8 py-6 text-lg font-medium group"
              >
                See how it works
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-600">
              Trusted by teams at
            </p>
          </div>

          {/* Company Logos */}
          <div className="flex items-center justify-center gap-12 mt-8 opacity-50 grayscale">
            <SiUber className="h-8 w-auto" />
            <SiAirbnb className="h-8 w-auto" />
            <SiDropbox className="h-10 w-auto" />
            <SiShopify className="h-8 w-auto" />
            <SiFigma className="h-8 w-auto" />
            <SiNike className="h-8 w-auto" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              A growing platform for
              <br />
              <span className="text-blue-600 dark:text-blue-400">habit builders</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">12,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Habits Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">95%</div>
              <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">4.9/5</div>
              <div className="text-gray-600 dark:text-gray-400">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Track habits in seconds.
            </h2>
            <div className="flex justify-center gap-4 mt-8">
              <button className="px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-full text-sm font-medium">
                Habits
              </button>
              <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                Achievements
              </button>
              <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                Analytics
              </button>
              <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                AI Insights
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Smart Goal Setting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Set up to 23 habits with custom difficulty levels and track your daily progress with visual streaks.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">Achievement System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Unlock 50+ achievements, level up through 10 tiers, and earn mastery points for consistency.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Get personalized weekly insights and habit suggestions powered by advanced AI analysis.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl">Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Track completion rates, habit health scores, and long-term trends with beautiful visualizations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Monitor daily, weekly, and monthly progress with streak counters and completion badges.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Your data is encrypted and secure. We never share your personal information with third parties.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What our users are saying.
            </h2>
          </div>

          <div className="relative">
            <Card className="border-gray-200 dark:border-gray-800 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>
              <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic">
                "{testimonials[currentTestimonial].quote}"
              </blockquote>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </Card>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial 
                      ? 'bg-gray-900 dark:bg-white w-8' 
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Start building better habits today.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join 500+ users who are transforming their lives one habit at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-8 py-6 text-lg font-medium"
            >
              Get started free
            </Button>
            <Button 
              onClick={() => setLocation("/demo")}
              variant="ghost"
              size="lg"
              className="px-8 py-6 text-lg font-medium group"
            >
              View demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-['Lexend_Giga'] text-xl font-semibold">n0ventum</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 n0ventum. Building better habits, one day at a time.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}