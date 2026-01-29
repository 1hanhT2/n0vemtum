import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, CheckCircle2, Moon, Sun, Target, Trophy, TrendingUp, Shield, BarChart3, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState, KeyboardEvent } from "react";
import { SiNike, SiAirbnb, SiDropbox, SiUber, SiShopify, SiFigma } from "react-icons/si";
import { SystemLogo } from "@/components/SystemLogo";
import { applyTheme, getStoredDarkMode, getStoredTheme } from "@/lib/theme";

type Habit = {
  name: string;
  streak: number;
  done: boolean;
  insight: string;
  compliance: number;
};

export function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([
    {
      name: "Deep Work Protocol",
      streak: 12,
      done: true,
      compliance: 87,
      insight: "Subject performs best with Deep Work when initiated before 0900. Keep the first 90 minutes interruption-free to maintain streak efficiency."
    },
    {
      name: "Physical Conditioning",
      streak: 5,
      done: true,
      compliance: 73,
      insight: "Recovery windows are improving. Slot conditioning after your longest meeting block to preserve consistency."
    },
    {
      name: "Knowledge Acquisition",
      streak: 26,
      done: false,
      compliance: 64,
      insight: "Reading velocity dips after 21:00. Move this block to early afternoon to retain recall quality."
    }
  ]);
  const [activeHabitIndex, setActiveHabitIndex] = useState(0);

  useEffect(() => {
    // Initialize theme
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
      name: "Subject 8921",
      role: "Product Manager",
      company: "Tech Startup",
      quote: "The System transformed how I approach my daily protocols. The gamification keeps me compliant and the AI insights are optimal.",
      avatar: "S8"
    },
    {
      name: "Subject 4412",
      role: "Software Engineer",
      company: "Enterprise Co",
      quote: "Finally, a tracking module that understands motivation. The achievement matrix makes building habits feel like a simulation I want to dominate.",
      avatar: "S4"
    },
    {
      name: "Subject 1102",
      role: "Designer",
      company: "Creative Agency",
      quote: "The weekly analysis has been critical. I appreciate how The System analyzes my patterns and mandates improvements.",
      avatar: "S1"
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
    <div className="relative min-h-screen overflow-hidden bg-cream dark:bg-[#0b0d12] text-gray-900 dark:text-white font-sans selection:bg-teal-light selection:text-teal-dark dark:selection:bg-primary/20 dark:selection:text-primary transition-colors duration-300">
      {/* Background Gradients for Dark Mode */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500"
        aria-hidden
      >
         <div className="absolute inset-0 bg-gradient-to-b from-[#0d1118] via-[#0b0d12] to-[#080b11]"></div>
         <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_15%,rgba(137,247,216,0.08),transparent_55%)]"></div>
         <div className="absolute top-[-10%] right-[-5%] w-[520px] h-[520px] bg-primary/14 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-12%] left-[-8%] w-[520px] h-[520px] bg-blue-600/12 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-cream/90 dark:bg-[#0b0d12]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <SystemLogo variant="wordmark" className="scale-90 origin-left" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" data-testid="link-nav-modules" className="text-gray-600 dark:text-white/60 hover-elevate px-2 py-1 rounded transition-colors">
              Modules
            </a>
            <a href="#stats" data-testid="link-nav-metrics" className="text-gray-600 dark:text-white/60 hover-elevate px-2 py-1 rounded transition-colors">
              Metrics
            </a>
            <a href="#testimonials" data-testid="link-nav-logs" className="text-gray-600 dark:text-white/60 hover-elevate px-2 py-1 rounded transition-colors">
              Logs
            </a>
            <button
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              className="p-2 rounded-full text-gray-600 dark:text-white/60 hover-elevate transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button
              onClick={handleLogin}
              data-testid="button-login-header"
              variant="default"
              className="bg-teal text-white dark:bg-primary dark:text-[#0b0d12] rounded-full px-6 shadow-none"
            >
              Initialize Log in
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-4 py-1.5 mb-8 shadow-sm backdrop-blur-sm">
            <div className="w-1.5 h-1.5 bg-teal dark:bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-primary tracking-wide uppercase">System v2.0 Online</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-medium dark:font-extrabold text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
            Optimize your existence <br className="hidden md:block"/>
            <span className="text-teal dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-teal-400 dark:to-blue-500 italic dark:not-italic">within The System.</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light dark:font-normal">
            Submit your daily metrics. Analyze your performance. Transcend your limits through our advanced gamification protocols.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Button
              onClick={handleLogin}
              data-testid="button-begin-initialization"
              size="lg"
              className="bg-teal text-white dark:bg-primary dark:text-[#0b0d12] rounded-full px-8 py-6 text-lg shadow-sm dark:shadow-[0_0_20px_rgba(137,247,216,0.3)]"
            >
              Begin Initialization
            </Button>
            <Button
              onClick={() => setLocation("/demo")}
              data-testid="button-observe-simulation"
              variant="outline"
              size="lg"
              className="border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-full px-8 py-6 text-lg bg-transparent"
            >
              Observe Simulation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-teal/5 dark:bg-primary/5 blur-3xl rounded-full transform scale-90"></div>
            <div className="relative bg-white dark:bg-[#0b0d12]/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden p-2">
              <div className="bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: Daily View */}
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-serif dark:font-mono text-lg font-medium text-gray-900 dark:text-white">Current Focus</h3>
                      <p className="text-xs text-gray-500 dark:text-white/40">Cycle: Wednesday, Oct 24</p>
                    </div>
                    <Sparkles className="h-5 w-5 text-teal dark:text-primary" />
                  </div>

                  <div className="space-y-3">
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
                          className={`flex items-center justify-between p-3 rounded-lg border shadow-sm cursor-pointer transition-all hover-elevate ${isActive ? 'border-primary/60 ring-2 ring-primary/30 dark:border-primary/60 bg-white/70 dark:bg-white/10' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-white/5'}`}
                          aria-pressed={isActive}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHabitToggle(i);
                              }}
                              data-testid={`button-habit-toggle-${i}`}
                              className={`w-7 h-7 rounded-full flex items-center justify-center border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${habit.done ? 'bg-teal dark:bg-primary border-teal dark:border-primary text-white dark:text-[#0b0d12]' : 'border-gray-300 dark:border-white/30 text-gray-400 dark:text-white/50'}`}
                              aria-pressed={habit.done}
                              aria-label={`Mark ${habit.name} as ${habit.done ? "not done" : "done"}`}
                            >
                              {habit.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                              {!habit.done && <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-white/40" />}
                            </button>
                            <div className="flex flex-col">
                              <span className={`text-sm ${habit.done ? 'text-gray-900 dark:text-white/90' : 'text-gray-700 dark:text-white/80'}`}>{habit.name}</span>
                              <span className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-white/40">Streak: {habit.streak}</span>
                            </div>
                          </div>
                          {isActive && (
                            <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">Selected</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Insights */}
                <div className="space-y-6 text-left border-l border-gray-200 dark:border-white/10 pl-8 hidden md:block">
                   <h3 className="font-serif dark:font-mono text-lg font-medium text-gray-900 dark:text-white">System Analysis</h3>
                   <div className="p-4 bg-teal-light/30 dark:bg-primary/10 rounded-lg border border-teal-light dark:border-primary/20">
                      <p className="text-sm text-gray-800 dark:text-foreground leading-relaxed">
                        &ldquo;{activeHabit.insight}&rdquo;
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-teal dark:text-primary font-medium uppercase tracking-wider">
                        <Brain className="h-3 w-3" />
                        AI Oversight
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-white/40">
                        <span>Compliance Rate</span>
                        <span>{activeHabit.compliance}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(137,247,216,0.5)] transition-all"
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
                        className="mt-3 w-full accent-primary cursor-pointer compliance-slider"
                        aria-label="Adjust compliance rate"
                      />
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl mt-24 border-t border-gray-200 dark:border-white/10 pt-12">
          <p className="text-xs font-medium text-gray-400 dark:text-white/70 text-center uppercase tracking-widest mb-8">Utilized by operatives at</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-40 grayscale dark:opacity-100 dark:grayscale-0 transition-all dark:invert">
            <SiUber className="h-6 w-auto" />
            <SiAirbnb className="h-6 w-auto" />
            <SiDropbox className="h-8 w-auto" />
            <SiShopify className="h-6 w-auto" />
            <SiFigma className="h-6 w-auto" />
            <SiNike className="h-6 w-auto" />
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Stats Section */}
      <section id="stats" className="py-24 px-6 bg-[#f7f5f0] dark:bg-[#0f1115]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[ 
              { label: "Active Subjects", value: "500+", desc: "Expanding database" },
              { label: "Protocols Tracked", value: "12k+", desc: "Daily commitments" },
              { label: "Success Rate", value: "95%", desc: "Goal completion" },
              { label: "System Rating", value: "4.9", desc: "Average score" }
            ].map((item, idx) => (
              <div key={item.label} className={`text-center md:text-left p-6 ${idx < 3 ? 'border-r border-teal/10 dark:border-primary/10' : ''}`}>
                <div className="text-4xl font-serif dark:font-mono font-medium text-teal dark:text-primary mb-2">{item.value}</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">{item.label}</div>
                <div className="text-xs text-gray-500 dark:text-white/50 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative overflow-hidden noise-texture bg-[#f7f5f0] dark:bg-[#0f1115]">
        {/* Dot grid pattern overlay */}
        <div className="absolute inset-0 dot-grid-pattern pointer-events-none"></div>
        {/* Scan lines overlay */}
        <div className="absolute inset-0 scan-lines pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <p className="text-xs font-mono text-teal dark:text-primary uppercase tracking-[0.2em] mb-4">System Modules</p>
            <h2 className="text-4xl font-serif dark:font-bold text-gray-900 dark:text-white mb-6">
              Everything required to <br/> maintain momentum.
            </h2>
            <p className="text-base text-gray-600 dark:text-white/60 max-w-2xl mx-auto">
              A complete toolkit designed to help you analyze your behavior and optimize your output.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="bento-grid">
            {[
              {
                icon: Target,
                module: "01",
                title: "Protocol Definition",
                desc: "Establish up to 23 habits with custom difficulty levels and track your daily adherence with visual feedback.",
                tall: true
              },
              {
                icon: Trophy,
                module: "02",
                title: "Achievement Matrix",
                desc: "Unlock 50+ badges, ascend through 10 tiers, and build lasting consistency."
              },
              {
                icon: Brain,
                module: "03",
                title: "AI Analysis",
                desc: "Receive personalized weekly intelligence and habit adjustments powered by advanced algorithms.",
                tall: true
              },
              {
                icon: BarChart3,
                module: "04",
                title: "Advanced Analytics",
                desc: "Monitor completion rates, habit health scores, and long-term trends with precision visualization."
              },
              {
                icon: TrendingUp,
                module: "05",
                title: "Progress Tracking",
                desc: "Monitor daily, weekly, and monthly progress with streak counters and status indicators."
              },
              {
                icon: Shield,
                module: "06",
                title: "Secure Database",
                desc: "Your data is encrypted and secure. We never share your personal information with external entities."
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                data-testid={`card-feature-${idx}`}
                className={`group p-8 rounded-xl frosted-card hover-elevate transition-all duration-300 ${feature.tall ? 'bento-tall flex flex-col justify-between' : ''}`}
              >
                <div>
                  <p className="text-[10px] font-mono text-teal dark:text-primary uppercase tracking-[0.15em] mb-4">Module {feature.module}</p>
                  <div className="hex-icon mb-6">
                    <feature.icon className="h-6 w-6 text-teal dark:text-primary relative z-10" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-serif dark:font-mono font-medium text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-white/50 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
                {feature.tall && (
                  <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 font-mono">
                      <div className="w-2 h-2 rounded-full bg-teal dark:bg-primary animate-pulse"></div>
                      <span>Active</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Testimonials */}
      <section id="testimonials" className="py-36 px-6 bg-[#1a1a1a] relative overflow-hidden">
        {/* Teal radial accent lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(800px_600px_at_50%_40%,rgba(45,212,191,0.08),transparent_60%)] pointer-events-none"></div>
        
        {/* Large decorative quote mark on the side */}
        <div className="absolute left-4 md:left-[10%] top-1/2 -translate-y-1/2 text-[20rem] font-serif text-teal/5 dark:text-primary/10 leading-none pointer-events-none select-none hidden lg:block">"</div>
        
        <div className="container mx-auto max-w-[720px] text-center relative z-10">
          <p className="text-xs font-mono text-teal dark:text-primary uppercase tracking-[0.2em] mb-4">Community Logs</p>
          <h2 className="text-3xl font-serif text-white mb-20">
            Logs from the community.
          </h2>

          {/* Dark glass panel */}
          <div className="relative dark-glass p-10 md:p-14 rounded-2xl">
            <blockquote className="text-xl md:text-2xl font-serif font-light text-white/90 leading-relaxed mb-10">
              "{testimonials[currentTestimonial].quote}"
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              {/* Geometric avatar with status ring */}
              <div className="status-ring">
                <div className="geo-avatar">
                  <span className="text-teal dark:text-primary font-mono font-bold text-sm relative z-10">
                    {testimonials[currentTestimonial].avatar}
                  </span>
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-sm">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-xs text-white/40 uppercase tracking-wide">
                  {testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}
                </div>
              </div>
            </div>

            {/* Progress bar pagination indicators */}
            <div className="flex justify-center gap-3 mt-12">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  data-testid={`button-testimonial-${index}`}
                  className={`progress-indicator ${index === currentTestimonial ? 'active' : ''}`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-white dark:bg-[#0b0d12]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-serif dark:font-bold text-gray-900 dark:text-white mb-6">
            Start building better habits today.
          </h2>
          <p className="text-xl text-gray-600 dark:text-white/60 mb-10 max-w-2xl mx-auto font-light">
            Join the operatives who are optimizing their existence one habit at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleLogin}
              data-testid="button-cta-initialize"
              size="lg"
              className="bg-teal text-white dark:bg-primary dark:text-black rounded-full px-10 py-7 text-lg shadow-lg dark:shadow-[0_0_20px_rgba(137,247,216,0.2)]"
            >
              Initialize Free Account
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500 dark:text-white/30">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0d12]">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <SystemLogo variant="wordmark" className="scale-75 origin-left opacity-80" />
          </div>
          <div className="text-sm text-gray-500 dark:text-white/40 font-medium">
            © 2025 The System. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-white/40">
            <a href="#" data-testid="link-privacy" className="hover-elevate px-2 py-1 rounded transition-colors">Privacy</a>
            <a href="#" data-testid="link-terms" className="hover-elevate px-2 py-1 rounded transition-colors">Terms</a>
            <a href="#" data-testid="link-contact" className="hover-elevate px-2 py-1 rounded transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
