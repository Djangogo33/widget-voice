import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PublicShell({
  children, projectName, slug, active,
}: {
  children: React.ReactNode;
  projectName?: string;
  slug?: string;
  active?: "changelog" | "roadmap";
}) {
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold">{projectName ?? "WidgetVoice"}</span>
          </div>
          {slug && (
            <nav className="flex gap-1 text-xs">
              <Link to="/p/$slug/changelog" params={{ slug }}
                className={`rounded-md px-3 py-1.5 font-medium ${active === "changelog" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {fr ? "Nouveautés" : "Changelog"}
              </Link>
              <Link to="/p/$slug/roadmap" params={{ slug }}
                className={`rounded-md px-3 py-1.5 font-medium ${active === "roadmap" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {fr ? "Feuille de route" : "Roadmap"}
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>
      <footer className="mx-auto max-w-3xl px-6 pb-10 text-center text-xs text-muted-foreground">
        {fr ? "Propulsé par " : "Powered by "}
        <Link to="/" className="font-medium text-foreground hover:underline">WidgetVoice</Link>
      </footer>
    </div>
  );
}
