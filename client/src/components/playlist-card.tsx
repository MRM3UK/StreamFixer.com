import { Clock, Trash2, FolderOpen } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Playlist } from "@shared/schema";
import { DEFAULT_FALLBACK_LOGO } from "@shared/schema";

interface PlaylistCardProps {
  playlist: Playlist;
  onLoad: () => void;
  onDelete: () => void;
}

export function PlaylistCard({ playlist, onLoad, onDelete }: PlaylistCardProps) {
  const channelCount = playlist.channels.length;
  const date = new Date(playlist.timestamp).toLocaleString();
  
  const previewChannels = playlist.channels.slice(0, 4);

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-playlist-${playlist.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate mb-1" data-testid={`text-playlist-name-${playlist.id}`}>
              {playlist.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{date}</span>
            </div>
          </div>
          {playlist.isDefault && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
              Default
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1 mb-3">
          {previewChannels.map((channel, idx) => (
            <div key={idx} className="aspect-square bg-muted rounded overflow-hidden">
              <img
                src={channel.logo || DEFAULT_FALLBACK_LOGO}
                alt=""
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_FALLBACK_LOGO;
                }}
              />
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground" data-testid={`text-channel-count-${playlist.id}`}>
          {channelCount} {channelCount === 1 ? 'channel' : 'channels'}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={onLoad}
          className="flex-1"
          data-testid={`button-load-${playlist.id}`}
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Load
        </Button>
        {!playlist.isDefault && (
          <Button
            onClick={onDelete}
            variant="destructive"
            size="icon"
            data-testid={`button-delete-${playlist.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
