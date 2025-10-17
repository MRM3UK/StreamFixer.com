import { useEffect } from "react";
import { Link } from "wouter";
import { List, Upload, Link as LinkIcon, Play, TrendingUp } from "lucide-react";
import { usePlaylist } from "@/lib/playlist-context";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { playlists, channels, loadDefaultPlaylist } = usePlaylist();

  useEffect(() => {
    const playlistsArray = Object.values(playlists);
    if (playlistsArray.length === 0 && channels.length === 0) {
      loadDefaultPlaylist();
    }
  }, [playlists, channels, loadDefaultPlaylist]);

  const playlistsArray = Object.values(playlists);
  const totalChannels = playlistsArray.reduce((sum, p) => sum + p.channels.length, 0);
  const currentChannelCount = channels.length;
  const recentPlaylists = playlistsArray
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your M3U playlists and streaming channels
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Channels"
          value={totalChannels}
          icon={Play}
          description="Across all playlists"
        />
        <StatCard
          title="Saved Playlists"
          value={playlistsArray.length}
          icon={List}
          description="In local storage"
        />
        <StatCard
          title="Current Playlist"
          value={currentChannelCount}
          icon={TrendingUp}
          description="Channels loaded"
        />
        <StatCard
          title="Groups"
          value={new Set(channels.map(c => c.group)).size}
          icon={LinkIcon}
          description="Unique categories"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/editor">
              <Button className="w-full justify-start" size="lg" data-testid="button-goto-editor">
                <Upload className="w-5 h-5 mr-3" />
                Import New Playlist
              </Button>
            </Link>
            <Link href="/playlists">
              <Button className="w-full justify-start" size="lg" variant="secondary" data-testid="button-goto-playlists">
                <List className="w-5 h-5 mr-3" />
                Manage Playlists
              </Button>
            </Link>
            <Link href="/player">
              <Button className="w-full justify-start" size="lg" variant="secondary" data-testid="button-goto-player">
                <Play className="w-5 h-5 mr-3" />
                Watch Channels
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPlaylists.length > 0 ? (
              <div className="space-y-3">
                {recentPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover-elevate transition-all cursor-pointer"
                    data-testid={`recent-playlist-${playlist.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{playlist.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {playlist.channels.length} channels
                      </p>
                    </div>
                    <Link href="/playlists">
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No playlists yet. Import one to get started!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
