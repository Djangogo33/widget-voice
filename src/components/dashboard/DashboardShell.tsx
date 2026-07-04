import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, createContext, useContext, useCallback } from "react";
import {
  MessageSquare, LayoutGrid, Inbox, Megaphone, Lightbulb, Users, Settings,
  LogOut, ChevronDown, Plus, Check, Webhook, Home,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;
type Profile = { email: string | null; plan: string };

type Ctx = {
  projects: Project[];
  current: Project | null;
  setCurrentId: (id: string) => void;
  refreshProjects: () => Promise<void>;
  profile: Profile | null;
};

const DashboardCtx = createContext<Ctx | null>(null);
export const useDashboard = () => {
  const v = useContext(DashboardCtx);
  if (!v) throw new Error("useDashboard outside provider");
  return v;
};

const NAV = [
  { to: "/dashboard", label: "Vue d'ensemble", icon: Home, exact: true },
  { to: "/dashboard/projects", label: "Projects", icon: LayoutGrid },
  { to: "/dashboard/feedbacks", label: "Feedbacks", icon: Inbox },
  { to: "/dashboard/changelog", label: "Changelog", icon: Megaphone },
  { to: "/dashboard/feature-requests", label: "Feature Requests", icon: Lightbulb },
  { to: "/dashboard/referrals", label: "Referrals", icon: Users },
  { to: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;


export function DashboardShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const refreshProjects = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    const list = (data ?? []) as Project[];
    setProjects(list);
    setCurrentId((prev) => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("wv_project") : null;
      if (prev && list.some((p) => p.id === prev)) return prev;
      if (stored && list.some((p) => p.id === stored)) return stored;
      return list[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("email, plan")
        .eq("id", user.id)
        .maybeSingle();
      if (p) setProfile(p as Profile);
      await refreshProjects();
    })();
  }, [refreshProjects]);

  useEffect(() => {
    if (currentId) localStorage.setItem("wv_project", currentId);
  }, [currentId]);

  const current = projects.find((p) => p.id === currentId) ?? null;

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const initial = (profile?.email ?? "?").charAt(0).toUpperCase();

  return (
    <DashboardCtx.Provider value={{ projects, current, setCurrentId, refreshProjects, profile }}>
      <div className="flex min-h-screen bg-muted/30">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
          <Link to="/dashboard" className="flex h-16 items-center gap-2 border-b border-border px-5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight">WidgetVoice</span>
          </Link>
          <nav className="flex-1 space-y-0.5 px-3 py-4">
            {NAV.map((item) => {
              const active =
                "exact" in item && item.exact
                  ? pathname === item.to || pathname === item.to + "/"
                  : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{profile?.email ?? "—"}</div>
                <div className="mt-0.5 inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {profile?.plan ?? "free"}
                </div>
              </div>
              <button
                onClick={signOut}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
            <div className="relative">
              <button
                onClick={() => setSwitcherOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                {current?.name ?? "No project"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {switcherOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSwitcherOpen(false)} />
                  <div className="absolute left-0 top-full z-20 mt-1.5 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                    <div className="max-h-64 overflow-y-auto py-1">
                      {projects.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No projects yet</div>
                      )}
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { setCurrentId(p.id); setSwitcherOpen(false); }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.domain}</div>
                          </div>
                          {p.id === currentId && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                    <Link
                      to="/dashboard/projects"
                      onClick={() => setSwitcherOpen(false)}
                      className="flex items-center gap-2 border-t border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" /> Manage projects
                    </Link>
                  </div>
                </>
              )}
            </div>
            <div className="md:hidden">
              <button onClick={signOut} className="text-sm text-muted-foreground">Sign out</button>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardCtx.Provider>
  );
}
