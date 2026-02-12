import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePrefersReducedMotion } from "@/hooks/use-gsap";
import { applyTheme, getStoredDarkMode, getStoredTheme } from "@/lib/theme";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Compass,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type Feature = {
  icon: LucideIcon;
  title: string;
  detail: string;
};

type Step = {
  id: string;
  title: string;
  detail: string;
};

type DashboardRow = {
  name: string;
  streak: number;
  completion: number;
  note: string;
};

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

const HERO_STATS = [
  { label: "Avg weekly consistency", value: "91%" },
  { label: "Active habit loops", value: "23" },
  { label: "Saved focus sessions", value: "1.8k" },
] as const;

const DASHBOARD_ROWS: DashboardRow[] = [
  {
    name: "Deep Work",
    streak: 14,
    completion: 92,
    note: "Best block: 8:00-9:30 AM",
  },
  {
    name: "Training",
    streak: 7,
    completion: 76,
    note: "Pairs well with late meetings",
  },
  {
    name: "Reading",
    streak: 18,
    completion: 84,
    note: "Retention rises before lunch",
  },
];

const FEATURES: Feature[] = [
  {
    icon: Target,
    title: "Adaptive habit tracking",
    detail: "Set routines once and tune difficulty as your consistency curve changes.",
  },
  {
    icon: Trophy,
    title: "Momentum-based progression",
    detail: "Streak quality and difficulty both contribute to rank and achievement unlocks.",
  },
  {
    icon: Brain,
    title: "Insight engine",
    detail: "Weekly analysis highlights where your schedule supports or sabotages execution.",
  },
  {
    icon: BarChart3,
    title: "Signal-rich analytics",
    detail: "Track completion, relapse risk, and trend velocity across daily and weekly horizons.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    detail: "Your personal behavior data stays tied to your account with strict access control.",
  },
  {
    icon: Compass,
    title: "Clear next actions",
    detail: "Every review ends with concrete adjustments instead of generic motivation.",
  },
];

const PLAYBOOK: Step[] = [
  {
    id: "01",
    title: "Design your system",
    detail: "Create habits with smart difficulty and tags that reflect the skills you want to build.",
  },
  {
    id: "02",
    title: "Run daily check-ins",
    detail: "Log completions in seconds while keeping a clear view of streak strength and consistency.",
  },
  {
    id: "03",
    title: "Refine from feedback",
    detail: "Use AI insights and trends to tighten timing, reduce friction, and stay in motion.",
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ari Chen",
    role: "Product Lead",
    quote:
      "PushForward finally gave me structure without friction. I can see exactly what keeps my execution stable each week.",
  },
  {
    name: "Maya Ortiz",
    role: "Software Engineer",
    quote:
      "The feedback loop is the difference. Instead of random habit tracking, I get practical adjustments that actually stick.",
  },
  {
    name: "Jordan Price",
    role: "Creative Director",
    quote:
      "The design feels intentional and the analytics are clear. It helps me protect routines when my schedule gets chaotic.",
  },
];

export function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const darkMode = getStoredDarkMode();
    setIsDarkMode(darkMode);
    applyTheme(getStoredTheme(), darkMode);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/app");
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-stagger]")
    );

    if (prefersReducedMotion) {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealTargets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ticker = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % TESTIMONIALS.length);
    }, 5800);

    return () => window.clearInterval(ticker);
  }, [prefersReducedMotion]);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem("darkMode", String(nextMode));
    applyTheme(getStoredTheme(), nextMode);
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const currentQuote = TESTIMONIALS[activeTestimonial];

  return (
    <div className={`landing-shell ${isReady ? "landing-ready" : ""}`}>
      <div aria-hidden="true" className="landing-orb landing-orb-one" />
      <div aria-hidden="true" className="landing-orb landing-orb-two" />
      <div aria-hidden="true" className="landing-grid" />

      <header className="sticky top-0 z-50 border-b border-[var(--landing-line)] bg-[var(--landing-panel)]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a className="flex items-center gap-3" href="/" data-testid="link-logo-home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#ff6a3d,#ffa347)] text-white shadow-[0_10px_20px_rgba(255,106,61,0.35)]">
              <Zap className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="landing-logo-wordmark text-xl font-extrabold tracking-[-0.03em]">PushForward</span>
          </a>

          <nav className="hidden items-center gap-2 text-sm md:flex">
            <a className="landing-nav-link" href="#features" data-testid="link-nav-features">
              Features
            </a>
            <a className="landing-nav-link" href="#playbook" data-testid="link-nav-playbook">
              Playbook
            </a>
            <a className="landing-nav-link" href="#results" data-testid="link-nav-reviews">
              Results
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setLocation("/demo")}
              variant="ghost"
              size="sm"
              className="hidden rounded-full border border-[var(--landing-line)] px-4 text-[var(--landing-ink)] hover:bg-[var(--landing-panel-strong)] sm:inline-flex"
            >
              Demo
            </Button>
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              data-testid="button-theme-toggle"
              className="rounded-full border border-[var(--landing-line)] text-[var(--landing-ink)] hover:bg-[var(--landing-panel-strong)]"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleLogin}
              data-testid="button-login-header"
              className="landing-primary-btn hidden h-9 rounded-full px-5 text-sm font-semibold sm:inline-flex"
            >
              Start free
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-24">
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="landing-chip landing-fade-up" style={{ animationDelay: "80ms" }}>
                <Sparkles className="h-3.5 w-3.5" />
                Personal operating system for consistency
              </p>

              <h1
                className="landing-hero-playful landing-fade-up mt-6 text-4xl tracking-[-0.04em] text-[var(--landing-ink)] sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "170ms" }}
              >
                Build momentum like it&apos;s a product.
              </h1>

              <p
                className="landing-fade-up mt-6 max-w-xl text-base leading-relaxed text-[var(--landing-muted)] sm:text-lg"
                style={{ animationDelay: "250ms" }}
              >
                PushForward turns your habits into a measurable feedback loop with guided difficulty,
                progression, and weekly intelligence.
              </p>

              <div className="landing-fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "340ms" }}>
                <Button
                  onClick={handleLogin}
                  data-testid="button-begin-initialization"
                  className="landing-primary-btn h-11 rounded-full px-6 text-sm font-semibold"
                >
                  Launch your system
                </Button>
                <Button
                  onClick={() => setLocation("/demo")}
                  data-testid="button-view-demo"
                  variant="outline"
                  className="landing-secondary-btn h-11 rounded-full border px-6 text-sm font-semibold"
                >
                  Explore demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div
                className="landing-fade-up mt-8 grid gap-3 sm:grid-cols-3"
                style={{ animationDelay: "430ms" }}
              >
                {HERO_STATS.map((item) => (
                  <div key={item.label} className="landing-stat-card">
                    <div className="landing-display text-2xl font-extrabold tracking-[-0.03em]">{item.value}</div>
                    <p className="mt-1 text-xs text-[var(--landing-muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside
              className="landing-panel landing-fade-up rounded-3xl p-4 shadow-[0_24px_60px_rgba(19,34,58,0.16)] sm:p-6"
              style={{ animationDelay: "250ms" }}
              aria-label="Dashboard preview"
            >
              <div className="flex items-center justify-between gap-4 border-b border-[var(--landing-line)] pb-4">
                <div>
                  <p className="landing-mono text-[11px] text-[var(--landing-muted)]">Today&apos;s Console</p>
                  <p className="landing-display mt-1 text-lg font-bold tracking-[-0.02em]">Momentum Overview</p>
                </div>
                <span className="rounded-full bg-[var(--landing-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--landing-accent)]">
                  +12% this week
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {DASHBOARD_ROWS.map((habit) => (
                  <div key={habit.name} className="rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-panel)] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--landing-ink)]">{habit.name}</p>
                        <p className="mt-1 text-xs text-[var(--landing-muted)]">{habit.note}</p>
                      </div>
                      <span className="landing-mono text-[10px] text-[var(--landing-muted)]">{habit.streak}d streak</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-black/10 dark:bg-white/15">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#ff6a3d,#11a6bd)]"
                        style={{ width: `${habit.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-cool-soft)] p-3">
                  <p className="landing-mono text-[11px] text-[var(--landing-muted)]">Focus Signal</p>
                  <p className="mt-2 text-sm text-[var(--landing-ink)]">Deep work is strongest before 10:00 AM.</p>
                </div>
                <div className="rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-accent-soft)] p-3">
                  <p className="landing-mono text-[11px] text-[var(--landing-muted)]">Risk Alert</p>
                  <p className="mt-2 text-sm text-[var(--landing-ink)]">Exercise misses rise after travel-heavy days.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="features" className="px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="landing-mono text-[11px] text-[var(--landing-muted)]">Core Modules</p>
              <h2 className="landing-display mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                Built for real execution, not streak theater.
              </h2>
              <p className="mt-4 text-[var(--landing-muted)]">
                Each component exists to keep your routine measurable, adaptable, and durable over time.
              </p>
            </div>

            <div
              data-reveal-stagger
              className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="landing-panel group rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <span className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--landing-cool-soft)] text-[var(--landing-cool)]">
                      <feature.icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="landing-display text-lg font-bold tracking-[-0.02em]">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--landing-muted)]">{feature.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="playbook" className="px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="landing-mono text-[11px] text-[var(--landing-muted)]">Three-Step Loop</p>
              <h2 className="landing-display mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                A workflow that compounds every week.
              </h2>
            </div>

            <ol data-reveal-stagger className="mt-10 grid gap-4 md:grid-cols-3">
              {PLAYBOOK.map((step) => (
                <li key={step.id} className="landing-panel rounded-3xl p-6">
                  <p className="landing-mono text-[11px] text-[var(--landing-muted)]">Step {step.id}</p>
                  <h3 className="landing-display mt-3 text-xl font-bold tracking-[-0.02em]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--landing-muted)]">{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="results" className="px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div data-reveal className="landing-panel rounded-[2rem] p-6 sm:p-10">
              <p className="landing-mono text-[11px] text-[var(--landing-muted)]">What Users Notice First</p>

              <blockquote
                key={`${currentQuote.name}-${activeTestimonial}`}
                className="landing-quote-enter mt-5 landing-display text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl"
              >
                &ldquo;{currentQuote.quote}&rdquo;
              </blockquote>

              <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-[var(--landing-ink)]">{currentQuote.name}</p>
                  <p className="text-xs text-[var(--landing-muted)]">{currentQuote.role}</p>
                </div>

                <div className="flex items-center gap-2">
                  {TESTIMONIALS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      data-testid={`button-testimonial-${index}`}
                      className={`h-2.5 rounded-full transition-all ${
                        activeTestimonial === index
                          ? "w-8 bg-[var(--landing-accent)]"
                          : "w-3 bg-[var(--landing-line)]"
                      }`}
                      aria-label={`Show testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 pt-8 sm:px-6 lg:pb-24">
          <div
            data-reveal
            className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 rounded-[2rem] border border-[var(--landing-line)] bg-[linear-gradient(135deg,rgba(255,106,61,0.12),rgba(17,166,189,0.14))] p-7 sm:p-10 lg:flex-row lg:items-center"
          >
            <div className="max-w-xl">
              <p className="landing-mono text-[11px] text-[var(--landing-muted)]">Ready to Start</p>
              <h2 className="landing-display mt-4 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                Turn intention into a repeatable system.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--landing-muted)] sm:text-base">
                Start with a few key habits, measure what matters, and refine your routine with better feedback.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                onClick={handleLogin}
                data-testid="button-cta-initialize"
                className="landing-primary-btn h-11 rounded-full px-6 text-sm font-semibold"
              >
                Create account
              </Button>
              <Button
                onClick={() => setLocation("/demo")}
                variant="outline"
                className="landing-secondary-btn h-11 rounded-full border px-6 text-sm font-semibold"
              >
                Open demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--landing-line)] px-4 py-8 text-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-[var(--landing-muted)] sm:flex-row">
          <p>{new Date().getFullYear()} PushForward. Built for disciplined growth.</p>
          <div className="flex items-center gap-4">
            <a href="#" data-testid="link-privacy" className="landing-nav-link !px-0 !py-0 text-xs">
              Privacy
            </a>
            <a href="#" data-testid="link-terms" className="landing-nav-link !px-0 !py-0 text-xs">
              Terms
            </a>
            <a href="#" data-testid="link-contact" className="landing-nav-link !px-0 !py-0 text-xs">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
