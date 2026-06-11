import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Check, Code2, MessageSquare, Sparkles,
  ThumbsUp, Megaphone, Zap, ChevronDown,
} from "lucide-react";
import { useI18n, LangSwitcher } from "@/lib/i18n";

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
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition">{t("nav.features")}</a>
          <a href="#pricing" className="hover:text-foreground transition">{t("nav.pricing")}</a>
          <a href="#changelog" className="hover:text-foreground transition">{t("nav.changelog")}</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LangSwitcher />
          <Link
            to="/signup"
            className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 sm:px-4 sm:text-sm"
          >
            {t("nav.cta")}
          </Link>
        </div>
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
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary-soft blur-3xl opacity-60" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("hero.badge")}
          </div>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            {t("hero.title1")} <span className="text-primary">{t("hero.title2")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              {t("hero.cta1")} <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              {t("hero.cta2")}
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{t("hero.caption")}</p>
        </div>

        <WidgetMockup />
      </div>
    </section>
  );
}

function WidgetMockup() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary-soft via-transparent to-primary-soft blur-2xl" />
      <div className="rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="ml-3 text-xs text-muted-foreground">{t("widget.label")}</span>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h3 className="text-base font-semibold">{t("widget.title")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t("widget.sub")}</p>
          </div>
          <div className="space-y-2">
            <IdeaRow title={t("widget.idea1")} votes={128} active />
            <IdeaRow title={t("widget.idea2")} votes={84} />
            <IdeaRow title={t("widget.idea3")} votes={52} />
          </div>
          <button className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            {t("widget.suggest")}
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
  const { t } = useI18n();
  const steps = [
    { icon: Code2, title: t("how.s1.t"), desc: t("how.s1.d") },
    { icon: MessageSquare, title: t("how.s2.t"), desc: t("how.s2.d") },
    { icon: Zap, title: t("how.s3.t"), desc: t("how.s3.d") },
  ];
  return (
    <section className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">{t("how.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("how.sub")}</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-7">
              <div className="absolute -top-3 left-7 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                {t("how.step")} {i + 1}
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
  const { t } = useI18n();
  const navLabels = [
    t("feat.nav.inbox"), t("feat.nav.roadmap"), t("feat.nav.changelog"),
    t("feat.nav.widgets"), t("feat.nav.settings"),
  ];
  return (
    <section id="features" className="border-t border-border/60 bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">{t("feat.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("feat.sub")}</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <FeatureCard icon={Megaphone} title={t("feat.changelog.t")} desc={t("feat.changelog.d")} />
          <FeatureCard icon={ThumbsUp} title={t("feat.vote.t")} desc={t("feat.vote.d")} />
          <FeatureCard icon={MessageSquare} title={t("feat.context.t")} desc={t("feat.context.d")} />
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
                {navLabels.map((l, i) => (
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
                <h4 className="text-lg font-semibold">{t("feat.roadmap")}</h4>
                <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-medium text-primary">{t("feat.inprogress")}</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { t: t("feat.col.planned"), n: 18, c: "bg-muted" },
                  { t: t("feat.col.inprogress"), n: 12, c: "bg-primary-soft" },
                  { t: t("feat.col.shipped"), n: 47, c: "bg-muted" },
                ].map((col) => (
                  <div key={col.t} className={`rounded-xl border border-border p-4 ${col.c}`}>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                      <span>{col.t}</span>
                      <span className="text-muted-foreground">{col.n}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
                          <div className="font-medium">{t("feat.idea")} {i}</div>
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
  const { t } = useI18n();
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      name: t("pricing.free.name"),
      price: 0,
      desc: t("pricing.free.desc"),
      features: [t("pricing.free.f1"), t("pricing.free.f2"), t("pricing.free.f3")],
      cta: t("pricing.free.cta"),
      highlight: false,
    },
    {
      name: t("pricing.solo.name"),
      price: 9,
      desc: t("pricing.solo.desc"),
      features: [t("pricing.solo.f1"), t("pricing.solo.f2"), t("pricing.solo.f3"), t("pricing.solo.f4")],
      cta: t("pricing.solo.cta"),
      highlight: true,
    },
    {
      name: t("pricing.studio.name"),
      price: 29,
      desc: t("pricing.studio.desc"),
      features: [t("pricing.studio.f1"), t("pricing.studio.f2"), t("pricing.studio.f3"), t("pricing.studio.f4")],
      cta: t("pricing.studio.cta"),
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">{t("pricing.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("pricing.sub")}</p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 text-sm font-medium">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 transition ${!yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {t("pricing.monthly")}
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-1.5 transition ${yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {t("pricing.yearly")} <span className="ml-1 text-xs opacity-80">-20%</span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const price = yearly ? Math.round(p.price * 12 * 0.8) : p.price;
            const suffix = p.price === 0 ? "" : yearly ? t("pricing.suffix.year") : t("pricing.suffix.month");
            return (
              <div
                key={p.name}
                className={`relative rounded-2xl border bg-card p-7 ${
                  p.highlight ? "border-primary shadow-xl shadow-primary/10" : "border-border"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    {t("pricing.popular")}
                  </div>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">{price}€</span>
                  {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
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
  const { t } = useI18n();
  const items = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];
  return (
    <section className="border-t border-border/60 bg-muted/30 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight">{t("faq.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("faq.sub")}</p>
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
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/60 py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          <div className="grid grid-cols-3 gap-10 text-sm">
            <FooterCol
              title={t("footer.product")}
              links={[t("nav.features"), t("nav.pricing"), t("nav.changelog")]}
            />
            <FooterCol
              title={t("footer.company")}
              links={[t("footer.about"), t("footer.blog"), t("footer.contact")]}
            />
            <FooterCol
              title={t("footer.legal")}
              links={[t("footer.privacy"), t("footer.terms"), t("footer.gdpr")]}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} WidgetVoice. {t("footer.rights")}</span>
          <span>{t("footer.made")}</span>
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
