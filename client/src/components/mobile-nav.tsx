import { Home, List, Edit3, Play, Share2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Playlists", url: "/playlists", icon: List },
  { title: "Editor", url: "/editor", icon: Edit3 },
  { title: "Player", url: "/player", icon: Play },
  { title: "Export", url: "/export", icon: Share2 },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
          const Icon = item.icon;
          return (
            <Link key={item.url} href={item.url}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover-elevate"
                )}
                data-testid={`mobile-nav-${item.title.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.title}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
