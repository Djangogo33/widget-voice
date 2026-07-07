import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, ThumbsUp, Bug, Sparkles, BarChart3, HelpCircle, Star, ArrowRight } from "lucide-react";

const TITLE = "Website feedback examples: 8 patterns that actually work";
const DESCRIPTION = "A practical guide to website feedback examples — feature request boards, bug report forms, NPS surveys, in-app widgets and more, with best practices and inspiration.";
const URL = "https://widget-voice.lovable.app/examples";
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6e02ff50-d22c-4697-8f84-4fde261b13f5";

export const Route = createFileRoute("/examples")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: TITLE,
        description: DESCRIPTION,
        author: { "@type": "Organization", name: "WidgetVoice" },
        publisher: { "@type": "Organization", name: "WidgetVoice" },
      }),
    }],
  }),
  component: ExamplesPage,
});

const EXAMPLES = [
  {
    icon: ThumbsUp,
    title: "Feature request board",
    text: "A public list of ideas users can upvote. Great for prioritizing your roadmap based on real demand instead of loudest-voice feedback. Show status (planned, in-progress, shipped) and let users subscribe to updates.",
    when: "Use when you have an engaged user base and want transparent prioritization.",
  },
  {
    icon: Bug,
    title: "Bug report form",
    text: "A short form that captures the URL, browser, and a screenshot automatically. Removes friction — users don't have to describe the environment or fumble with screenshot tools.",
    when: "Use on every page where bugs might occur, especially in-app.",
  },
  {
    icon: BarChart3,
    title: "NPS survey",
    text: '"How likely are you to recommend us?" on a 0–10 scale with an optional follow-up. Simple, benchmark-friendly, and surfaces both promoters and detractors.',
    when: "Trigger after a key milestone (30 days active, first payment).",
  },
  {
    icon: HelpCircle,
    title: "CSAT after support",
    text: "A one-tap thumbs-up/down after a support conversation. High response rates, immediate signal on your team's quality.",
    when: "Send right after a ticket closes, before context fades.",
  },
  {
    icon: Star,
    title: "5-star rating widget",
    text: "Lightweight on-page rating with optional comment. Best for standalone pages: articles, docs, tutorials, product pages.",
    when: "Use to identify weak content that needs a rewrite.",
  },
  {
    icon: MessageSquare,
    title: "In-app feedback widget",
    text: "A floating button that opens a small form for ideas, bugs, or questions — with automatic page URL, browser info, and screenshot. This is what WidgetVoice ships out of the box.",
    when: "Use as your always-on catch-all feedback channel.",
  },
  {
    icon: Sparkles,
    title: "Empty-state prompt",
    text: 'When a user hits an empty list or missing feature, show a "Tell us what you\'re looking for" input. Catches unmet needs at the exact moment they surface.',
    when: "Use inside your app on empty states and 404 pages.",
  },
  {
    icon: BarChart3,
    title: "Exit-intent survey",
    text: "A short pop-up when the mouse moves toward the tab close button, asking why the visitor is leaving. One question, three options, no more.",
    when: "Use sparingly on pricing or signup pages.",
  },
];

const BEST_PRACTICES = [
  "Ask one question at a time. Long forms kill response rates.",
  "Capture context automatically (URL, browser, screenshot) — don't make users describe it.",
  "Close the loop: reply to every submission, even briefly. Users who feel heard come back.",
  "Show what shipped. A public changelog turns feedback into a virtuous cycle.",
  "Never gate feedback behind a login. Friction destroys signal.",
];

function ExamplesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">WidgetVoice</span>
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground sm:text-sm"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Guide
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">
          Website feedback examples: 8 patterns that actually work
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Great products aren't built in a vacuum. Below are eight proven patterns for collecting website feedback, when to use each, and best practices that keep response rates high.
        </p>

        <section className="mt-14 space-y-8">
          {EXAMPLES.map((e) => (
            <div key={e.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <e.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{e.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.text}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-primary">
                    {e.when}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">Best practices</h2>
          <ul className="mt-5 space-y-3">
            {BEST_PRACTICES.map((b) => (
              <li key={b} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-foreground/90">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-primary/40 bg-primary-soft p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Ship a widget in two minutes</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            WidgetVoice bundles every pattern above — feature board, bug form with auto-screenshot, in-app widget, public changelog — behind one snippet.
          </p>
          <Link
            to="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </article>
    </div>
  );
}
