import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Trophy, TrendingUp, Eye, Brain, BarChart3, Shield, Sparkles, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { SiNike, SiAirbnb, SiDropbox, SiUber, SiShopify, SiFigma } from "react-icons/si";

import logoUrl from "@assets/Logos and identity/pushfowardlogo.png";

export function Landing() {
  const { isAuthenticated } = useAuth();
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
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-teal-light selection:text-teal-dark">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="PushForward logo" className="h-8 w-8" />
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">PushForward</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-teal-dark transition-colors">
              Features
            </a>
            <a href="#stats" className="text-muted-foreground hover:text-teal-dark transition-colors">
              Stats
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-teal-dark transition-colors">
              Reviews
            </a>
            <Button
              onClick={handleLogin}
              variant="default"
              className="bg-teal text-white hover:bg-teal-dark rounded-full px-6 shadow-none transition-all"
            >
              Log in
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Private Beta Access</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-medium text-foreground mb-8 leading-[1.1] tracking-tight">
            Cultivate habits that <br className="hidden md:block"/>
            <span className="text-teal italic">actually stick.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Track your daily progress, unlock meaningful achievements, and receive AI-curated insights to maintain your momentum.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Button
              onClick={handleLogin}
              size="lg"
              className="bg-teal hover:bg-teal-dark text-white rounded-full px-8 py-6 text-lg shadow-sm transition-all hover:shadow-md"
            >
              Start building free
            </Button>
            <Button
              onClick={() => setLocation("/demo")}
              variant="outline"
              size="lg"
              className="border-border text-muted-foreground hover:border-gray-400 hover:bg-muted/50 rounded-full px-8 py-6 text-lg bg-transparent"
            >
              See how it works
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-teal/5 blur-3xl rounded-full transform scale-90"></div>
            <div className="relative bg-card rounded-xl border border-border shadow-xl overflow-hidden p-2">
              <div className="bg-muted/50 rounded-lg border border-border p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: Daily View */}
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-foreground">Today's Focus</h3>
                      <p className="text-xs text-muted-foreground">Wednesday, October 24</p>
                    </div>
                    <Sparkles className="h-5 w-5 text-teal" />
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "Deep Work Session", streak: 12, done: true },
                      { name: "Morning Run (5k)", streak: 5, done: true },
                      { name: "Read 30 Pages", streak: 26, done: false }
                    ].map((habit, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${habit.done ? 'bg-teal border-teal text-white' : 'border-border'}`}>
                            {habit.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                          <span className={`text-sm ${habit.done ? 'text-foreground' : 'text-muted-foreground'}`}>{habit.name}</span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">Streak: {habit.streak}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Insights */}
                <div className="space-y-6 text-left border-l border-border pl-8 hidden md:block">
                   <h3 className="font-serif text-lg font-medium text-foreground">Weekly Insight</h3>
                   <div className="p-4 bg-teal-light/30 rounded-lg border border-teal-light">
                      <p className="text-sm text-teal-dark leading-relaxed">
                        "You're most consistent with <strong>Deep Work</strong> when you start before 9 AM. Try scheduling your block earlier to maintain this 12-day streak."
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-teal font-medium">
                        <Brain className="h-3 w-3" />
                        AI Analysis
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Completion Rate</span>
                        <span>87%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-teal w-[87%] rounded-full"></div>
                      </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl mt-24 border-t border-border pt-12">
          <p className="text-xs font-medium text-muted-foreground text-center uppercase tracking-widest mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-40 grayscale transition-all hover:opacity-60 hover:grayscale-0">
            <SiUber className="h-6 w-auto" />
            <SiAirbnb className="h-6 w-auto" />
            <SiDropbox className="h-8 w-auto" />
            <SiShopify className="h-6 w-auto" />
            <SiFigma className="h-6 w-auto" />
            <SiNike className="h-6 w-auto" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 px-6 bg-card border-y border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[ 
              { label: "Active Users", value: "500+", desc: "Growing community" },
              { label: "Habits Tracked", value: "12k+", desc: "Daily commitments" },
              { label: "Success Rate", value: "95%", desc: "Goal completion" },
              { label: "User Rating", value: "4.9", desc: "Average score" }
            ].map((item) => (
              <div key={item.label} className="text-center md:text-left p-6 border-r last:border-r-0 border-border">
                <div className="text-4xl font-serif font-medium text-teal mb-2">{item.value}</div>
                <div className="text-sm font-bold text-foreground uppercase tracking-wide">{item.label}</div>
                <div className="text-sm text-muted-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif text-foreground mb-6">
              Everything you need to <br/> maintain momentum.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete toolkit designed to help you understand your behavior and achieve your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Smart Goal Setting",
                desc: "Set up to 23 habits with custom difficulty levels and track your daily progress with visual streaks."
              },
              {
                icon: Trophy,
                title: "Achievement System",
                desc: "Unlock 50+ achievements, level up through 10 tiers, and earn mastery points for consistency."
              },
              {
                icon: Brain,
                title: "AI-Powered Insights",
                desc: "Get personalized weekly insights and habit suggestions powered by advanced AI analysis."
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "Track completion rates, habit health scores, and long-term trends with beautiful visualizations."
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                desc: "Monitor daily, weekly, and monthly progress with streak counters and completion badges."
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your data is encrypted and secure. We never share your personal information with third parties."
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-2xl bg-card border border-border hover:border-teal/30 hover:shadow-lg hover:shadow-teal/5 transition-all duration-300">
                <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center mb-6 group-hover:bg-teal group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-serif font-medium text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-teal-light/20 border-y border-teal/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-serif text-foreground mb-16">
            Reflections from our community.
          </h2>

          <div className="relative bg-card p-10 md:p-14 rounded-2xl shadow-sm border border-border">
            <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-teal text-white w-12 h-12 flex items-center justify-center rounded-full text-2xl font-serif">"</div>

            <blockquote className="text-2xl font-serif text-foreground leading-relaxed mb-8">
              {testimonials[currentTestimonial].quote}
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm">
                {testimonials[currentTestimonial].avatar}
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground text-sm">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  {testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-10">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial
                      ? 'bg-teal w-6'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
            Start building better habits today.
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light">
            Join the community of mindful achievers who are transforming their lives one habit at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleLogin}
              size="lg"
              className="bg-teal hover:bg-teal-dark text-white rounded-full px-10 py-7 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get started for free
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-card">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="PushForward logo" className="h-6 w-6 grayscale opacity-80" />
            <span className="font-serif text-lg font-bold text-foreground">PushForward</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            © 2025 PushForward. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-teal transition-colors">Privacy</a>
            <a href="#" className="hover:text-teal transition-colors">Terms</a>
            <a href="#" className="hover:text-teal transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
