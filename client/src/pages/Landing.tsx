import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, CheckCircle2, Moon, Sun, Target, Trophy, TrendingUp, Shield, BarChart3, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { SiNike, SiAirbnb, SiDropbox, SiUber, SiShopify, SiFigma } from "react-icons/si";
import { SystemLogo } from "@/components/SystemLogo";
import { applyTheme, getStoredDarkMode, getStoredTheme } from "@/lib/theme";

export function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-cream dark:bg-[#0b0d12] text-gray-900 dark:text-white/90 font-sans selection:bg-teal-light selection:text-teal-dark dark:selection:bg-primary/20 dark:selection:text-primary transition-colors duration-300">
      {/* Background Gradients for Dark Mode */}
      <div className="fixed inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0b0d12] to-[#0b0d12]"></div>
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-cream/90 dark:bg-[#0b0d12]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <SystemLogo variant="wordmark" className="scale-90 origin-left" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-gray-600 dark:text-white/60 hover:text-teal-dark dark:hover:text-primary transition-colors">
              Modules
            </a>
            <a href="#stats" className="text-gray-600 dark:text-white/60 hover:text-teal-dark dark:hover:text-primary transition-colors">
              Metrics
            </a>
            <a href="#testimonials" className="text-gray-600 dark:text-white/60 hover:text-teal-dark dark:hover:text-primary transition-colors">
              Logs
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button
              onClick={handleLogin}
              variant="default"
              className="bg-teal text-white hover:bg-teal-dark dark:bg-primary dark:text-[#0b0d12] dark:hover:bg-primary/90 rounded-full px-6 shadow-none transition-all"
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
              size="lg"
              className="bg-teal hover:bg-teal-dark dark:bg-primary dark:text-[#0b0d12] dark:hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg shadow-sm transition-all hover:shadow-md dark:shadow-[0_0_20px_rgba(137,247,216,0.3)]"
            >
              Begin Initialization
            </Button>
            <Button
              onClick={() => setLocation("/demo")}
              variant="outline"
              size="lg"
              className="border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:border-gray-400 dark:hover:bg-white/5 hover:bg-gray-50 rounded-full px-8 py-6 text-lg bg-transparent"
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
                    {[
                      { name: "Deep Work Protocol", streak: 12, done: true },
                      { name: "Physical Conditioning", streak: 5, done: true },
                      { name: "Knowledge Acquisition", streak: 26, done: false }
                    ].map((habit, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${habit.done ? 'bg-teal dark:bg-primary border-teal dark:border-primary text-white dark:text-[#0b0d12]' : 'border-gray-300 dark:border-white/20'}`}>
                            {habit.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                          <span className={`text-sm ${habit.done ? 'text-gray-900 dark:text-white/90' : 'text-gray-600 dark:text-white/60'}`}>{habit.name}</span>
                        </div>
                        <span className="text-xs font-mono text-gray-400 dark:text-primary/70">Streak: {habit.streak}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Insights */}
                <div className="space-y-6 text-left border-l border-gray-200 dark:border-white/10 pl-8 hidden md:block">
                   <h3 className="font-serif dark:font-mono text-lg font-medium text-gray-900 dark:text-white">System Analysis</h3>
                   <div className="p-4 bg-teal-light/30 dark:bg-primary/10 rounded-lg border border-teal-light dark:border-primary/20">
                      <p className="text-sm text-teal-dark dark:text-primary leading-relaxed">
                        "Subject performs best with <strong>Deep Work</strong> when initiated before 0900. Schedule adjustment recommended to maintain streak efficiency."
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-teal dark:text-primary font-medium uppercase tracking-wider">
                        <Brain className="h-3 w-3" />
                        AI Oversight
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-white/40">
                        <span>Compliance Rate</span>
                        <span>87%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-teal dark:bg-primary w-[87%] rounded-full shadow-[0_0_10px_rgba(137,247,216,0.5)]"></div>
                      </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl mt-24 border-t border-gray-200 dark:border-white/10 pt-12">
          <p className="text-xs font-medium text-gray-400 dark:text-white/70 text-center uppercase tracking-widest mb-8">Utilized by operatives at</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-40 grayscale dark:opacity-100 dark:grayscale-0 transition-all hover:opacity-60 hover:grayscale-0 dark:invert">
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
      <section id="stats" className="py-24 px-6 bg-white dark:bg-white/5 border-y border-gray-100 dark:border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[ 
              { label: "Active Subjects", value: "500+", desc: "Expanding database" },
              { label: "Protocols Tracked", value: "12k+", desc: "Daily commitments" },
              { label: "Success Rate", value: "95%", desc: "Goal completion" },
              { label: "System Rating", value: "4.9", desc: "Average score" }
            ].map((item) => (
              <div key={item.label} className="text-center md:text-left p-6 border-r last:border-r-0 border-gray-100 dark:border-white/10">
                <div className="text-4xl font-serif dark:font-mono font-medium text-teal dark:text-primary mb-2">{item.value}</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">{item.label}</div>
                <div className="text-sm text-gray-500 dark:text-white/70 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif dark:font-bold text-gray-900 dark:text-white mb-6">
              Everything required to <br/> maintain momentum.
            </h2>
            <p className="text-lg text-gray-600 dark:text-white/60 max-w-2xl mx-auto">
              A complete toolkit designed to help you analyze your behavior and optimize your output.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Protocol Definition",
                desc: "Establish up to 23 habits with custom difficulty levels and track your daily adherence with visual feedback."
              },
              {
                icon: Trophy,
                title: "Achievement Matrix",
                desc: "Unlock 50+ badges, ascend through 10 tiers, and earn mastery points for unwavering consistency."
              },
              {
                icon: Brain,
                title: "AI Analysis",
                desc: "Receive personalized weekly intelligence and habit adjustments powered by advanced algorithms."
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "Monitor completion rates, habit health scores, and long-term trends with precision visualization."
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                desc: "Monitor daily, weekly, and monthly progress with streak counters and status indicators."
              },
              {
                icon: Shield,
                title: "Secure Database",
                desc: "Your data is encrypted and secure. We never share your personal information with external entities."
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-teal/30 dark:hover:border-primary/50 hover:shadow-lg hover:shadow-teal/5 dark:hover:shadow-primary/10 transition-all duration-300 backdrop-blur-sm">
                <div className="w-12 h-12 bg-cream dark:bg-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-teal dark:group-hover:bg-primary group-hover:text-white dark:group-hover:text-black transition-colors">
                  <feature.icon className="h-6 w-6 text-gray-700 dark:text-white/80 group-hover:text-white dark:group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-xl font-serif dark:font-mono font-medium text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-white/50 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-teal-light/20 dark:bg-[#0b0d12] border-y border-teal/10 dark:border-white/10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-3xl font-serif dark:font-mono text-gray-900 dark:text-white mb-16">
            Logs from the community.
          </h2>

          <div className="relative bg-white dark:bg-white/5 p-10 md:p-14 rounded-2xl shadow-sm dark:shadow-2xl border border-gray-100 dark:border-white/10 backdrop-blur-md">
            <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-teal dark:bg-primary text-white dark:text-black w-12 h-12 flex items-center justify-center rounded-full text-2xl font-serif">"</div>

            <blockquote className="text-2xl font-serif dark:font-sans dark:font-light text-gray-800 dark:text-white leading-relaxed mb-8">
              {testimonials[currentTestimonial].quote}
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center text-gray-600 dark:text-white font-bold text-sm">
                {testimonials[currentTestimonial].avatar}
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900 dark:text-white text-sm">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wide">
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
                      ? 'bg-teal dark:bg-primary w-6'
                      : 'bg-gray-300 dark:bg-white/20'
                  }`}
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
              size="lg"
              className="bg-teal hover:bg-teal-dark dark:bg-primary dark:text-black dark:hover:bg-primary/90 text-white rounded-full px-10 py-7 text-lg shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(137,247,216,0.2)] transition-all"
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
            <a href="#" className="hover:text-teal dark:hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-teal dark:hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-teal dark:hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
