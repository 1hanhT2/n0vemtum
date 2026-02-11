import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, CheckCircle2, Moon, Sun, Target, Trophy, TrendingUp, Shield, BarChart3, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { applyTheme, getStoredDarkMode, getStoredTheme } from "@/lib/theme";

type Habit = {
  name: string;
  streak: number;
  done: boolean;
  insight: string;
  compliance: number;
};

function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
          const duration = 1200;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * numericValue);

            if (value.includes("k")) {
              setDisplayed(current >= 1000 ? `${(current / 1000).toFixed(0)}k` : String(current));
            } else if (value.includes(".")) {
              setDisplayed((eased * numericValue).toFixed(1));
            } else {
              setDisplayed(String(current));
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayed(value);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="font-mono text-4xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
      {displayed}{suffix}
    </div>
  );
}

export function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([
    {
      name: "Deep Work",
      streak: 12,
      done: true,
      compliance: 87,
      insight: "You perform best with Deep Work before 9 AM. Keep the first 90 minutes interruption-free to maintain streak efficiency."
    },
    {
      name: "Exercise",
      streak: 5,
      done: true,
      compliance: 73,
      insight: "Recovery windows are improving. Schedule exercise after your longest meeting block to preserve consistency."
    },
    {
      name: "Reading",
      streak: 26,
      done: false,
      compliance: 64,
      insight: "Reading focus dips after 9 PM. Try moving this to early afternoon to improve retention."
    }
  ]);
  const [activeHabitIndex, setActiveHabitIndex] = useState(0);

  useEffect(() => {
    const darkMode = getStoredDarkMode();
    setIsDarkMode(darkMode);
    applyTheme(getStoredTheme(), darkMode);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    applyTheme(getStoredTheme(), newMode);
  };

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
      name: "Priya K.",
      role: "Product Manager",
      company: "Tech Startup",
      quote: "The System changed how I structure my mornings. The gamification keeps me showing up, and the AI insights actually surface patterns I missed.",
      initials: "PK"
    },
    {
      name: "Marcus T.",
      role: "Software Engineer",
      company: "Enterprise Co",
      quote: "Finally, a habit tracker that respects the data. The achievement system makes consistency feel rewarding instead of tedious.",
      initials: "MT"
    },
    {
      name: "Elena R.",
      role: "Designer",
      company: "Creative Agency",
      quote: "The weekly analysis alone is worth it. I can see exactly where my habits slip and what to adjust. Clean, focused, no fluff.",
      initials: "ER"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleHabitSelect = (index: number) => {
    setActiveHabitIndex(index);
  };

  const handleHabitToggle = (index: number) => {
    setHabits((prev) =>
      prev.map((habit, i) =>
        i === index ? { ...habit, done: !habit.done } : habit
      )
    );
  };

  const handleComplianceChange = (value: number) => {
    setHabits((prev) =>
      prev.map((habit, i) =>
        i === activeHabitIndex ? { ...habit, compliance: value } : habit
      )
    );
  };

  const handleKeySelect = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleHabitSelect(index);
    }
  };

  const activeHabit = habits[activeHabitIndex];

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-500/20 transition-colors duration-300">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-md bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">System</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 flex-wrap text-sm font-medium">
            <a href="#features" data-testid="link-nav-features" className="text-gray-600 dark:text-white/60 hover-elevate px-3 py-1.5 rounded-md transition-colors">
              Features
            </a>
            <a href="#stats" data-testid="link-nav-metrics" className="text-gray-600 dark:text-white/60 hover-elevate px-3 py-1.5 rounded-md transition-colors">
              Metrics
            </a>
            <a href="#testimonials" data-testid="link-nav-reviews" className="text-gray-600 dark:text-white/60 hover-elevate px-3 py-1.5 rounded-md transition-colors">
              Reviews
            </a>
            <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-2"></div>
            <Button
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              size="icon"
              variant="ghost"
              className="text-gray-500 dark:text-white/50"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleLogin}
              data-testid="button-login-header"
              size="sm"
              className="bg-blue-600 text-white dark:bg-blue-500 ml-2"
            >
              Log in
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1 mb-8 bg-gray-50 dark:bg-white/5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono font-medium text-gray-500 dark:text-white/50 tracking-wide uppercase">v2.0 Online</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
            Build the System. Master your discipline.
          </h1>

          <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Log daily metrics. Analyze performance data. Elevate your baseline through structured gamification.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
            <Button
              onClick={handleLogin}
              data-testid="button-begin-initialization"
              className="bg-blue-600 text-white dark:bg-blue-500"
            >
              Initialize System
            </Button>
            <Button
              onClick={() => setLocation("/demo")}
              data-testid="button-view-demo"
              variant="outline"
              className="border-gray-200 dark:border-white/15 text-gray-700 dark:text-white/70"
            >
              View Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-3xl mx-auto">
            <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-[#111111]">
              {/* Dashboard Header Bar */}
              <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-mono text-gray-400 dark:text-white/40 uppercase tracking-wider">Active Habits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                  <span className="text-xs font-mono text-gray-400 dark:text-white/40">Today: Wed, Oct 24</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Habit List */}
                <div className="p-5 space-y-2">
                  {habits.map((habit, i) => {
                    const isActive = i === activeHabitIndex;
                    return (
                      <div
                        key={habit.name}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleHabitSelect(i)}
                        onKeyDown={(event) => handleKeySelect(event, i)}
                        data-testid={`card-habit-${i}`}
                        className={`flex items-center justify-between gap-2 p-3 rounded-md border cursor-pointer transition-all hover-elevate ${isActive ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/5 dark:border-blue-500/30' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-transparent'}`}
                        aria-pressed={isActive}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <div
                            role="checkbox"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHabitToggle(i);
                            }}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); handleHabitToggle(i); } }}
                            data-testid={`button-habit-toggle-${i}`}
                            className={`w-5 h-5 rounded flex items-center justify-center border cursor-pointer transition-colors ${habit.done ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white' : 'border-gray-300 dark:border-white/20'}`}
                            aria-checked={habit.done}
                            aria-label={`Mark ${habit.name} as ${habit.done ? "not done" : "done"}`}
                          >
                            {habit.done && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-medium ${habit.done ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/70'}`}>{habit.name}</span>
                            <span className="text-[11px] font-mono text-gray-400 dark:text-white/30 uppercase tracking-wider">Streak: {habit.streak}d</span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right: Analysis Panel */}
                <div className="p-5 space-y-4 border-l border-gray-100 dark:border-white/5 hidden md:block">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-gray-400 dark:text-white/40 uppercase tracking-wider">System Analysis</span>
                    <Brain className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="p-3 rounded-md border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                    <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">
                      &ldquo;{activeHabit.insight}&rdquo;
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      <Brain className="h-3 w-3" />
                      AI Insight
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between gap-2 text-xs font-mono text-gray-400 dark:text-white/30">
                      <span>Compliance Rate</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{activeHabit.compliance}%</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                        style={{ width: `${activeHabit.compliance}%` }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={activeHabit.compliance}
                      onChange={(event) => handleComplianceChange(Number(event.target.value))}
                      data-testid="input-compliance-slider"
                      className="mt-2 w-full accent-blue-600 dark:accent-blue-500 cursor-pointer h-1"
                      aria-label="Adjust compliance rate"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Users", value: "500", suffix: "+" },
              { label: "Habits Tracked", value: "12000", suffix: "+" },
              { label: "Success Rate", value: "95", suffix: "%" },
              { label: "System Rating", value: "4.9", suffix: "" }
            ].map((item) => (
              <div key={item.label} className="text-center">
                <AnimatedNumber value={item.value === "12000" ? "12k" : item.value} suffix={item.suffix} />
                <div className="text-xs font-mono text-gray-400 dark:text-white/40 uppercase tracking-wider mt-2" data-testid={`text-stat-${item.label.toLowerCase().replace(/\s/g, '-')}`}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-[#0A0A0A]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3 block">System Modules</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything to maintain momentum.
            </h2>
            <p className="text-gray-500 dark:text-white/50 max-w-lg mx-auto">
              A complete toolkit to analyze behavior and optimize output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Target,
                module: "01",
                title: "Habit Tracking",
                desc: "Define up to 23 habits with custom difficulty levels and track daily completions."
              },
              {
                icon: Trophy,
                module: "02",
                title: "Achievements",
                desc: "Unlock 50+ badges, progress through 10 tiers, and build lasting consistency."
              },
              {
                icon: Brain,
                module: "03",
                title: "AI Insights",
                desc: "Get personalized weekly analysis powered by pattern recognition."
              },
              {
                icon: BarChart3,
                module: "04",
                title: "Advanced Analytics",
                desc: "Monitor completion rates, habit health scores, and long-term trends."
              },
              {
                icon: TrendingUp,
                module: "05",
                title: "Progress Tracking",
                desc: "Monitor daily, weekly, and monthly progress with streak counters."
              },
              {
                icon: Shield,
                module: "06",
                title: "Secure Data",
                desc: "Your data is encrypted and private. No sharing with third parties."
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                data-testid={`card-feature-${idx}`}
                className="group p-6 rounded-lg border border-gray-200 dark:border-white/8 hover-elevate transition-all bg-white dark:bg-transparent"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-gray-400 dark:text-white/30 uppercase tracking-wider">M{feature.module}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-[#111111] dark:bg-[#080808] relative overflow-hidden">
        <div className="container mx-auto max-w-2xl text-center relative z-10">
          <span className="text-xs font-mono text-blue-400 uppercase tracking-[0.2em] mb-3 block">User Feedback</span>
          <h2 className="text-2xl font-bold text-white mb-16">
            Trusted by builders and high-performers.
          </h2>

          <div className="relative border border-white/10 rounded-lg p-8 md:p-12 bg-white/[0.02]">
            <blockquote className="text-lg md:text-xl font-light text-white/80 leading-relaxed mb-8">
              "{testimonials[currentTestimonial].quote}"
            </blockquote>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-blue-400 font-mono font-bold text-sm">
                  {testimonials[currentTestimonial].initials}
                </span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white text-sm">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-xs font-mono text-white/30 uppercase tracking-wider">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-10">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  data-testid={`button-testimonial-${index}`}
                  className={`w-8 h-1 rounded-full transition-all ${index === currentTestimonial ? 'bg-blue-500' : 'bg-white/10'}`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white dark:bg-[#0A0A0A] border-t border-gray-100 dark:border-white/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Start building better habits.
          </h2>
          <p className="text-gray-500 dark:text-white/50 mb-8 max-w-md mx-auto">
            Join the builders who track, measure, and grow — one habit at a time.
          </p>
          <Button
            onClick={handleLogin}
            data-testid="button-cta-initialize"
            className="bg-blue-600 text-white dark:bg-blue-500"
          >
            Get Started Free
          </Button>
          <p className="mt-4 text-xs font-mono text-gray-400 dark:text-white/30 uppercase tracking-wider">
            No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0A0A0A]">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-5 h-5 rounded bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">System</span>
          </div>
          <div className="text-xs font-mono text-gray-400 dark:text-white/30 tracking-wider">
            2025 The System. All rights reserved.
          </div>
          <div className="flex gap-6 flex-wrap text-xs font-mono text-gray-400 dark:text-white/30">
            <a href="#" data-testid="link-privacy" className="hover-elevate px-2 py-1 rounded-md transition-colors">Privacy</a>
            <a href="#" data-testid="link-terms" className="hover-elevate px-2 py-1 rounded-md transition-colors">Terms</a>
            <a href="#" data-testid="link-contact" className="hover-elevate px-2 py-1 rounded-md transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
