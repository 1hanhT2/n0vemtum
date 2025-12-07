import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Trophy, TrendingUp, Eye, Brain, BarChart3, Shield, Sparkles, ArrowRight, CheckCircle2, Star } from "lucide-react";
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
      quote: "PushForward transformed how I approach my daily habits. The gamification keeps me engaged and the AI insights are spot-on.",
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f6f9ff] via-white to-[#eef2ff] dark:bg-gradient-to-b dark:from-[#0b1021] dark:via-[#0f172a] dark:to-[#0b1021] text-gray-900 dark:text-gray-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/30" />
        <div className="absolute right-10 top-32 h-80 w-80 rounded-full bg-purple-200/35 blur-3xl dark:bg-purple-900/30" />
        <div className="absolute left-1/3 bottom-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl dark:bg-indigo-900/25" />
        <div className="absolute inset-0 opacity-40 glow-orb dark:opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between rounded-full border border-white/60 bg-white/70 backdrop-blur-2xl shadow-lg shadow-blue-100/40 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/30">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="PushForward logo" className="h-10 w-10" />
            <span className="font-['Lexend_Giga'] text-xl font-semibold text-gray-900 dark:text-white">PushForward</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white">
              Features
            </a>
            <a href="#stats" className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white">
              Stats
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white">
              Reviews
            </a>
            <Button onClick={handleLogin} variant="default" className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md shadow-gray-500/30">
              Log in
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-4">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="inline-flex items-center gap-3 bg-white/70 border border-white/60 backdrop-blur-xl rounded-full px-4 py-2 mb-2 shadow-sm shadow-blue-100/50 dark:bg-slate-900/70 dark:border-slate-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">500+ users building better habits daily</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">We’re still growing—these numbers are aspirational while in beta.</p>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              PushForward helps you
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                build habits that stick.
              </span>
            </h1>

            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mb-10">
              Track up to 23 habits, unlock achievements, and get AI-powered insights to keep your momentum going.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white hover:scale-[1.01] transition-transform px-8 py-6 text-lg font-medium shadow-lg shadow-gray-400/40 dark:from-white dark:via-gray-200 dark:to-gray-100 dark:text-gray-900 dark:shadow-black/30"
              >
                Start for free
              </Button>
              <Button
                onClick={() => setLocation("/demo")}
                variant="outline"
                size="lg"
                className="border-gray-200 bg-white/70 backdrop-blur-xl text-gray-900 hover:border-gray-300 px-8 py-6 text-lg font-medium group shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-gray-100 dark:hover:border-slate-600"
              >
                See how it works
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
            {[
              { label: "Avg. streak", value: "26 days" },
              { label: "Achievements unlocked", value: "52" },
              { label: "AI nudges", value: "14 / week" }
            ].map((item) => (
                <div key={item.label} className="glass-surface glossy-border rounded-2xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -left-6 rounded-[32px] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-purple-500/15 blur-3xl" />
            <div className="relative glass-surface glossy-border rounded-[32px] p-6 overflow-hidden">
              <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-white/60 blur-3xl dark:bg-slate-800/60" />
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Live overview</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">PushForward workspace</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  Live preview
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/70 border border-white/60 backdrop-blur-xl p-4 dark:bg-slate-900/70 dark:border-slate-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Today</p>
                  <div className="space-y-3">
                    {["Morning routine", "Deep work", "Movement"].map((item, idx) => (
                      <div key={item} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${idx === 0 ? 'from-blue-500/90 to-indigo-500/90' : idx === 1 ? 'from-emerald-400/80 to-teal-400/80' : 'from-amber-400/90 to-orange-400/90'} flex items-center justify-center text-white shadow`}>
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{item}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">+1 streak</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white/60 backdrop-blur-xl p-4 flex flex-col justify-between dark:bg-slate-900/70 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Momentum</p>
                    <div className="space-y-3">
                      {[80, 65, 92].map((value, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>{['Consistency', 'Focus', 'Energy'][idx]}</span>
                            <span>{value}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden dark:bg-slate-800">
                            <div className={`h-full rounded-full bg-gradient-to-r ${idx === 0 ? 'from-blue-500 to-indigo-500' : idx === 1 ? 'from-emerald-400 to-teal-400' : 'from-amber-400 to-orange-400'}`} style={{ width: `${value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      AI coach online
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 shadow-sm shadow-blue-500/30 dark:from-blue-500 dark:to-purple-500">
                      Boost me
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-12">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-12 mt-6 opacity-70 grayscale">
            <SiUber className="h-8 w-auto" />
            <SiAirbnb className="h-8 w-auto" />
            <SiDropbox className="h-10 w-auto" />
            <SiShopify className="h-8 w-auto" />
            <SiFigma className="h-8 w-auto" />
            <SiNike className="h-8 w-auto" />
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">These logos are just vibes for now—we’re not actually partnered (yet).</p>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              A growing platform for
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">habit builders</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Signals that PushForward keeps your momentum glowing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[ 
              { label: "Active Users", value: "500+", accent: "from-blue-500 to-indigo-500", footnote: "Reality: friends & early adopters." },
              { label: "Habits Tracked", value: "12,000+", accent: "from-emerald-400 to-teal-400", footnote: "We’re not there yet—working on it." },
              { label: "Success Rate", value: "95%", accent: "from-amber-400 to-orange-400", footnote: "A goal, not a guarantee." },
              { label: "User Rating", value: "4.9/5", accent: "from-purple-500 to-pink-500", footnote: "Aspirational score, still in beta." }
            ].map((item) => (
              <div key={item.label} className="glass-surface glossy-border rounded-2xl p-6 text-center space-y-1">
                <div className={`mx-auto mb-2 h-12 w-12 rounded-2xl bg-gradient-to-br ${item.accent} text-white font-semibold flex items-center justify-center shadow-md`}>{item.value}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{item.label}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic text-pretty leading-snug">{item.footnote}</p>
              </div>
            ))}
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
            <Card className="glass-surface glossy-border hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Smart Goal Setting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Set up to 23 habits with custom difficulty levels and track your daily progress with visual streaks.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-surface glossy-border hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Achievement System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Unlock 50+ achievements, level up through 10 tiers, and earn mastery points for consistency.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-surface glossy-border hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Get personalized weekly insights and habit suggestions powered by advanced AI analysis.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-surface glossy-border hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Track completion rates, habit health scores, and long-term trends with beautiful visualizations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-surface glossy-border hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Monitor daily, weekly, and monthly progress with streak counters and completion badges.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-surface glossy-border hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Secure & Private</CardTitle>
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
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What our users are saying.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Glossy feedback from teams already moving faster.</p>
          </div>

          <div className="relative">
            <Card className="glass-surface glossy-border p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>
              <blockquote className="text-lg text-gray-700 dark:text-gray-200 italic">
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
                      ? 'bg-gray-900 w-8'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-surface glossy-border rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Start building better habits today.
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join 500+ users who are transforming their lives one habit at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:scale-[1.01] transition-transform px-8 py-6 text-lg font-medium shadow-lg shadow-blue-200/70"
              >
                Get started free
              </Button>
              <Button
                onClick={() => setLocation("/demo")}
                variant="ghost"
                size="lg"
                className="px-8 py-6 text-lg font-medium group border border-gray-200 bg-white/80 backdrop-blur-xl text-gray-900 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-gray-100 dark:hover:border-slate-600"
              >
                View demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 text-sm text-gray-600">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="glass-surface glossy-border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="PushForward logo" className="h-8 w-8" />
              <span className="font-['Lexend_Giga'] text-xl font-semibold text-gray-900 dark:text-white">PushForward</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              © 2025 PushForward. Building better habits, one day at a time.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
