import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Trophy, TrendingUp, Users, Eye, LogIn, Brain, BarChart3, Shield, Sparkles, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { SiNike, SiAirbnb, SiDropbox, SiUber, SiShopify, SiFigma } from "react-icons/si";

export function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeScrollFeature, setActiveScrollFeature] = useState(0);
  const scrollSectionRef = useRef<HTMLDivElement>(null);

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
      quote: "PushFoward transformed how I approach my daily habits. The gamification keeps me engaged and the AI insights are spot-on.",
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

  const scrollFeatures = [
    {
      title: "Guided habit journeys",
      description: "Swipe through curated pathways that adapt as you complete check-ins, streaks, and unlock achievements.",
      icon: Sparkles,
      accent: "from-blue-500/20 via-cyan-400/10 to-indigo-500/20",
    },
    {
      title: "Crystal clear analytics",
      description: "Watch momentum bars fill as completion rates rise, with AI surfacing the exact levers to improve.",
      icon: BarChart3,
      accent: "from-emerald-400/15 via-teal-300/10 to-sky-400/15",
    },
    {
      title: "Motivation with receipts",
      description: "Earn shimmering badges, level up tiers, and collect proof of progress you can actually feel proud of.",
      icon: Trophy,
      accent: "from-amber-400/20 via-orange-300/10 to-pink-400/15",
    },
    {
      title: "Privacy-first by design",
      description: "Session security, encrypted records, and private-by-default sharing keep your growth yours alone.",
      icon: Shield,
      accent: "from-purple-500/15 via-fuchsia-400/10 to-slate-500/15",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const section = scrollSectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const startOffset = rect.top - viewportHeight * 0.35;
      const progress = Math.min(Math.max((window.scrollY + viewportHeight - (section.offsetTop + startOffset)) / rect.height, 0), 1);
      const nextIndex = Math.min(
        scrollFeatures.length - 1,
        Math.max(0, Math.floor(progress * scrollFeatures.length))
      );
      setActiveScrollFeature(nextIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollFeatures.length]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f6f9ff] via-white to-[#eef2ff]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-10 top-32 h-80 w-80 rounded-full bg-purple-200/35 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute inset-0 opacity-40 glow-orb" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between rounded-full border border-white/60 bg-white/70 backdrop-blur-2xl shadow-lg shadow-blue-100/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-['Lexend_Giga'] text-xl font-semibold text-gray-900">PushFoward</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#stats" className="text-gray-700 hover:text-gray-900 transition-colors">
              Stats
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-gray-900 transition-colors">
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
            <div className="inline-flex items-center gap-3 bg-white/70 border border-white/60 backdrop-blur-xl rounded-full px-4 py-2 mb-6 shadow-sm shadow-blue-100/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">500+ users building better habits daily</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              A glossy new PushFoward to
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                make your habits shine.
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-2xl mb-10">
              Track 23 habits, unlock 50+ achievements, and get AI-powered insights with a luminous workspace designed to keep you moving forward.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white hover:scale-[1.01] transition-transform px-8 py-6 text-lg font-medium shadow-lg shadow-gray-400/40"
              >
                Start for free
              </Button>
              <Button
                onClick={() => setLocation("/demo")}
                variant="outline"
                size="lg"
                className="border-gray-200 bg-white/70 backdrop-blur-xl text-gray-900 hover:border-gray-300 px-8 py-6 text-lg font-medium group shadow-sm"
              >
                See how it works
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {[
                { label: "Avg. streak", value: "26 days" },
                { label: "Achievements unlocked", value: "52" },
                { label: "AI nudges", value: "14 / week" }
              ].map((item) => (
                <div key={item.label} className="glass-surface glossy-border rounded-2xl p-4">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -left-6 rounded-[32px] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-purple-500/15 blur-3xl" />
            <div className="relative glass-surface glossy-border rounded-[32px] p-6 overflow-hidden">
              <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-white/60 blur-3xl" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Live overview</p>
                    <p className="text-lg font-semibold text-gray-900">PushFoward workspace</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  Live preview
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/70 border border-white/60 backdrop-blur-xl p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Today</p>
                  <div className="space-y-3">
                    {["Morning routine", "Deep work", "Movement"].map((item, idx) => (
                      <div key={item} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${idx === 0 ? 'from-blue-500/90 to-indigo-500/90' : idx === 1 ? 'from-emerald-400/80 to-teal-400/80' : 'from-amber-400/90 to-orange-400/90'} flex items-center justify-center text-white shadow`}> 
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-gray-900">{item}</span>
                        </div>
                        <span className="text-xs text-gray-500">+1 streak</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white/60 backdrop-blur-xl p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Momentum</p>
                    <div className="space-y-3">
                      {[80, 65, 92].map((value, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{['Consistency', 'Focus', 'Energy'][idx]}</span>
                            <span>{value}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${idx === 0 ? 'from-blue-500 to-indigo-500' : idx === 1 ? 'from-emerald-400 to-teal-400' : 'from-amber-400 to-orange-400'}`} style={{ width: `${value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      AI coach online
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
                      Boost me
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl">
          <p className="text-sm text-gray-500 text-center mt-12">Trusted by teams at</p>
          <div className="flex items-center justify-center gap-12 mt-6 opacity-60 grayscale">
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
      <section id="stats" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              A growing platform for
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">habit builders</span>
            </h2>
            <p className="text-lg text-gray-600">Signals that PushFoward keeps your momentum glowing.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[ 
              { label: "Active Users", value: "500+", accent: "from-blue-500 to-indigo-500" },
              { label: "Habits Tracked", value: "12,000+", accent: "from-emerald-400 to-teal-400" },
              { label: "Success Rate", value: "95%", accent: "from-amber-400 to-orange-400" },
              { label: "User Rating", value: "4.9/5", accent: "from-purple-500 to-pink-500" }
            ].map((item) => (
              <div key={item.label} className="glass-surface glossy-border rounded-2xl p-6 text-center">
                <div className={`mx-auto mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br ${item.accent} text-white font-semibold flex items-center justify-center shadow-md`}>{item.value}</div>
                <div className="text-gray-600">{item.label}</div>
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
                <CardTitle className="text-xl">Smart Goal Setting</CardTitle>
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
                <CardTitle className="text-xl">Achievement System</CardTitle>
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
                <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
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
                <CardTitle className="text-xl">Advanced Analytics</CardTitle>
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
                <CardTitle className="text-xl">Progress Tracking</CardTitle>
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

      {/* Scroll Story */}
      <section ref={scrollSectionRef} className="relative py-24 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2 sticky top-28 self-start space-y-4">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500 bg-white/70 border border-white/60 backdrop-blur-xl rounded-full px-4 py-2 w-fit">
              <Sparkles className="h-4 w-4 text-blue-600" /> Live scroll story
            </p>
            <h3 className="text-4xl font-bold text-gray-900">See PushFoward react as you scroll.</h3>
            <p className="text-lg text-gray-600">
              Each panel lights up to show the guided journey from day one to unstoppable consistency.
            </p>
            <div className="w-full h-2 rounded-full bg-white/70 border border-white/60 backdrop-blur-xl overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${((activeScrollFeature + 1) / scrollFeatures.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {scrollFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === activeScrollFeature;
              return (
                <div
                  key={feature.title}
                  className={`relative rounded-3xl border border-white/60 bg-white/70 backdrop-blur-2xl p-6 lg:p-8 shadow-lg transition-all duration-500 ${
                    isActive ? 'shadow-blue-200/70 scale-[1.01]' : 'opacity-80'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.accent} opacity-40 pointer-events-none`} />
                  <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/80 border border-white/60 backdrop-blur-xl flex items-center justify-center shadow-md">
                      <Icon className="h-6 w-6 text-gray-900" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">Step {index + 1}</span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${isActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-500'}`}>
                          {isActive ? 'Now viewing' : 'Upcoming'}
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-lg">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-10 right-20 h-48 w-48 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What our users are saying.
            </h2>
            <p className="text-lg text-gray-600">Glossy feedback from teams already moving faster.</p>
          </div>

          <div className="relative">
            <Card className="glass-surface glossy-border p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>
              <blockquote className="text-lg text-gray-700 italic">
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
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Start building better habits today.
            </h2>
            <p className="text-xl text-gray-600 mb-8">
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
                className="px-8 py-6 text-lg font-medium group border border-gray-200 bg-white/80 backdrop-blur-xl text-gray-900 hover:border-gray-300"
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-['Lexend_Giga'] text-xl font-semibold">PushFoward</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2025 PushFoward. Building better habits, one day at a time.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}