import { useState } from "react";
import { usePlaylist } from "@/lib/playlist-context";
import { PlaylistCard } from "@/components/playlist-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PlaylistManager() {
  const { playlists, loadPlaylist, deletePlaylist, createPlaylist } = usePlaylist();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const playlistsArray = Object.values(playlists);
  const filteredPlaylists = playlistsArray.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim(), []);
      setNewPlaylistName("");
      setShowCreateDialog(false);
    }
  };

  const handleDeletePlaylist = (id: string) => {
    const playlist = playlists[id];
    if (confirm(`Delete "${playlist.name}"? This cannot be undone.`)) {
      deletePlaylist(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Playlists</h1>
          <p className="text-muted-foreground">
            Manage your saved M3U playlists
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-playlist">
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search playlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-playlists"
        />
      </div>

      {filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onLoad={() => loadPlaylist(playlist.id)}
              onDelete={() => handleDeletePlaylist(playlist.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "No playlists match your search" : "No playlists saved yet"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Playlist
            </Button>
          )}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Give your new playlist a name. You can add channels later.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Playlist name..."
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
            data-testid="input-new-playlist-name"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()} data-testid="button-confirm-create">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
