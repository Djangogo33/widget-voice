import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Check, Code2, MessageSquare, Sparkles,
  ThumbsUp, Megaphone, Zap, ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

/* ---------------- Navbar ---------------- */
function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          <a href="#changelog" className="hover:text-foreground transition">Changelog</a>
        </nav>
        <Link
          to="/signup"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          Get Started Free
        </Link>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <MessageSquare className="h-4 w-4" strokeWidth={2.5} />
      </div>
      <span className="text-lg font-bold tracking-tight">WidgetVoice</span>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary-soft blur-3xl opacity-60" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            New: public changelog & roadmap
          </div>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            The feedback widget your users <span className="text-primary">will actually use</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Drop one snippet into your app and start collecting feedback, feature requests, and votes — all in a widget that feels native to your product.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              View Demo
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required · Free forever plan</p>
        </div>

        <WidgetMockup />
      </div>
    </section>
  );
}

function WidgetMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary-soft via-transparent to-primary-soft blur-2xl" />
      <div className="rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="ml-3 text-xs text-muted-foreground">Feedback</span>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h3 className="text-base font-semibold">What should we build next?</h3>
            <p className="mt-1 text-xs text-muted-foreground">Vote on ideas or share your own</p>
          </div>
          <div className="space-y-2">
            <IdeaRow title="Dark mode for the dashboard" votes={128} active />
            <IdeaRow title="Slack notifications" votes={84} />
            <IdeaRow title="Export to CSV" votes={52} />
          </div>
          <button className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            Suggest an idea
          </button>
        </div>
      </div>
    </div>
  );
}

function IdeaRow({ title, votes, active }: { title: string; votes: number; active?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
      <span className="text-sm font-medium">{title}</span>
      <div
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
          active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        <ThumbsUp className="h-3 w-3" /> {votes}
      </div>
    </div>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  const steps = [
    { icon: Code2, title: "Paste the snippet", desc: "Add one line of code to your app. Setup takes under 2 minutes." },
    { icon: MessageSquare, title: "Users interact", desc: "They submit ideas, vote, and discuss right inside your product." },
    { icon: Zap, title: "You act on feedback", desc: "Prioritize what matters. Ship faster. Close the loop with a changelog." },
  ];
  return (
    <section className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted-foreground">Three steps from install to insight.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-7">
              <div className="absolute -top-3 left-7 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                Step {i + 1}
              </div>
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Features ---------------- */
function Features() {
  return (
    <section id="features" className="border-t border-border/60 bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Everything you need to listen better</h2>
          <p className="mt-4 text-muted-foreground">A complete feedback toolkit, designed to feel like part of your product.</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={Megaphone}
            title="Changelog"
            desc="Publish updates on a beautiful public page. Notify users right inside the widget when you ship."
          />
          <FeatureCard
            icon={ThumbsUp}
            title="Feature Voting"
            desc="Let users vote and comment on what matters most. Stop guessing what to build."
          />
          <FeatureCard
            icon={MessageSquare}
            title="Contextual Feedback"
            desc="Capture page URL, browser, and user info automatically with every submission."
          />
        </div>

        {/* Screenshot block */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-primary/5">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="ml-3 text-xs text-muted-foreground">app.widgetvoice.com/dashboard</span>
          </div>
          <div className="grid gap-0 md:grid-cols-[220px_1fr]">
            <aside className="hidden border-r border-border bg-background p-5 md:block">
              <div className="space-y-1 text-sm">
                {["Inbox", "Roadmap", "Changelog", "Widgets", "Settings"].map((l, i) => (
                  <div
                    key={l}
                    className={`rounded-md px-3 py-2 ${i === 1 ? "bg-primary-soft font-semibold text-primary" : "text-muted-foreground"}`}
                  >
                    {l}
                  </div>
                ))}
              </div>
            </aside>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Roadmap</h4>
                <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-medium text-primary">12 in progress</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { t: "Planned", n: 18, c: "bg-muted" },
                  { t: "In Progress", n: 12, c: "bg-primary-soft" },
                  { t: "Shipped", n: 47, c: "bg-muted" },
                ].map((col) => (
                  <div key={col.t} className={`rounded-xl border border-border p-4 ${col.c}`}>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                      <span>{col.t}</span>
                      <span className="text-muted-foreground">{col.n}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
                          <div className="font-medium">Idea title {i}</div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" /> {40 - i * 7}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon, title, desc,
}: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-7 transition hover:shadow-md hover:shadow-primary/5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

/* ---------------- Pricing ---------------- */
function Pricing() {
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      price: 0,
      desc: "For side projects getting started.",
      features: ["1 project", "Unlimited feedback", "WidgetVoice badge"],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Solo",
      price: 9,
      desc: "For makers shipping serious products.",
      features: ["3 projects", "No WidgetVoice badge", "Public changelog", "Email support"],
      cta: "Start free trial",
      highlight: true,
    },
    {
      name: "Studio",
      price: 29,
      desc: "For teams and agencies.",
      features: ["Unlimited projects", "Custom domain", "API access", "Priority support"],
      cta: "Start free trial",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Simple, fair pricing</h2>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade when you outgrow it.</p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 text-sm font-medium">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 transition ${!yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-1.5 transition ${yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Yearly <span className="ml-1 text-xs opacity-80">-20%</span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const price = yearly ? Math.round(p.price * 12 * 0.8) : p.price;
            const suffix = p.price === 0 ? "" : yearly ? "€/year" : "€/month";
            return (
              <div
                key={p.name}
                className={`relative rounded-2xl border bg-card p-7 ${
                  p.highlight ? "border-primary shadow-xl shadow-primary/10" : "border-border"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">{price}€</span>
                  {suffix && <span className="text-sm text-muted-foreground">{suffix.replace("€", "")}</span>}
                </div>
                <Link
                  to="/signup"
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    p.highlight
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {p.cta}
                </Link>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const items = [
    { q: "How long does setup take?", a: "Under two minutes. Copy a single snippet, paste it into your app, and the widget is live." },
    { q: "Can I customize the widget look?", a: "Yes — colors, position, copy, and triggers are fully configurable. Studio plans support a custom domain too." },
    { q: "Do you offer a free plan?", a: "Yes, the Free plan supports 1 project and shows a small WidgetVoice badge. Solo removes the badge." },
    { q: "Can I cancel anytime?", a: "Of course. There are no contracts — cancel from your dashboard in one click." },
    { q: "Is my data secure?", a: "Data is encrypted in transit and at rest. We're GDPR-compliant and hosted in the EU." },
  ];
  return (
    <section className="border-t border-border/60 bg-muted/30 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight">Frequently asked questions</h2>
          <p className="mt-4 text-muted-foreground">Still have a question? Reach out anytime.</p>
        </div>
        <div className="mt-12 space-y-3">
          {items.map((it, i) => <FAQItem key={i} {...it} />)}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold">{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</div>}
    </div>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="border-t border-border/60 py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">The feedback widget your users will actually use.</p>
          </div>
          <div className="grid grid-cols-3 gap-10 text-sm">
            <FooterCol title="Product" links={["Features", "Pricing", "Changelog"]} />
            <FooterCol title="Company" links={["About", "Blog", "Contact"]} />
            <FooterCol title="Legal" links={["Privacy", "Terms", "GDPR"]} />
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} WidgetVoice. All rights reserved.</span>
          <span>Made in France 🇫🇷</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">{title}</div>
      <ul className="space-y-2 text-muted-foreground">
        {links.map((l) => (
          <li key={l}><a href="#" className="hover:text-foreground transition">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}
