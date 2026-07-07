import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — WidgetVoice" },
      { name: "description", content: "Manage your WidgetVoice projects and track user feedback, feature requests and changelog." },
      { property: "og:title", content: "Dashboard — WidgetVoice" },
      { property: "og:description", content: "Manage your WidgetVoice projects and track user feedback, feature requests and changelog." },
      { property: "og:url", content: "https://widget-voice.lovable.app/dashboard" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://widget-voice.lovable.app/dashboard" }],
  }),
  component: DashboardShell,
});
