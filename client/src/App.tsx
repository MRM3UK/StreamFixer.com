import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { PlaylistProvider } from "@/lib/playlist-context";
import Dashboard from "@/pages/dashboard";
import PlaylistManager from "@/pages/playlist-manager";
import ChannelEditor from "@/pages/channel-editor";
import Player from "@/pages/player";
import Export from "@/pages/export";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/playlists" component={PlaylistManager} />
      <Route path="/editor" component={ChannelEditor} />
      <Route path="/player" component={Player} />
      <Route path="/export" component={Export} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlaylistProvider>
          <SidebarProvider style={sidebarStyle} defaultOpen={false}>
            <div className="flex h-screen w-full">
              <div className="hidden md:block">
                <AppSidebar />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-6">
                  <Router />
                </main>
              </div>
            </div>
            <MobileNav />
          </SidebarProvider>
          <Toaster />
        </PlaylistProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
