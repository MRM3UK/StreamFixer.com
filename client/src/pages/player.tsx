import { useState, useEffect, useRef } from "react";
import { usePlaylist } from "@/lib/playlist-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, SkipForward, SkipBack } from "lucide-react";
import type { Channel } from "@shared/schema";
import { DEFAULT_FALLBACK_LOGO } from "@shared/schema";

export default function Player() {
  const { channels, currentChannel, setCurrentChannel, playerMode, setPlayerMode } = usePlaylist();
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerStatus, setPlayerStatus] = useState("Ready");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const currentIndex = currentChannel ? channels.findIndex(c => c.url === currentChannel.url) : -1;

  const loadChannel = (channel: Channel, mode: 1 | 2) => {
    setCurrentChannel(channel);
    setPlayerMode(mode);
    setPlayerError(null);
    setPlayerStatus("Loading...");
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      loadChannel(channels[currentIndex - 1], playerMode);
    }
  };

  const handleNext = () => {
    if (currentIndex < channels.length - 1) {
      loadChannel(channels[currentIndex + 1], playerMode);
    }
  };

  useEffect(() => {
    if (!currentChannel) return;

    setPlayerError(null);
    setPlayerStatus("Loading...");
    const url = currentChannel.url;
    const isHLS = url.toLowerCase().includes('.m3u8');
    const isDASH = url.toLowerCase().includes('.mpd') || url.toLowerCase().includes('.dash');

    // Clean up previous instances
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (playerMode === 1) {
      // HLS.js / Native Player
      const video = videoRef.current;
      if (!video) return;

      if (isHLS && (window as any).Hls?.isSupported()) {
        const Hls = (window as any).Hls;
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setPlayerStatus("Playing (HLS.js)");
        });

        hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
          if (data.fatal) {
            setPlayerError(`HLS Error: ${data.details}`);
            setPlayerStatus("Error");
          }
        });
      } else {
        // Native playback
        video.src = url;
        video.play()
          .then(() => setPlayerStatus("Playing (Native)"))
          .catch((err) => {
            setPlayerError(`Playback Error: ${err.message}`);
            setPlayerStatus("Error");
          });
      }
    } else {
      // Clappr/Shaka Player (Mode 2)
      if (!(window as any).Clappr) {
        setPlayerError("Clappr player not loaded");
        setPlayerStatus("Error");
        return;
      }

      const playerContainer = document.getElementById('clappr-container');
      if (!playerContainer) return;

      const Clappr = (window as any).Clappr;
      const DashShakaPlayback = (window as any).DashShakaPlayback;

      try {
        // Register DashShakaPlayback plugin for DASH support
        if (DashShakaPlayback && Clappr.Player.registerPlayback) {
          Clappr.Player.registerPlayback(DashShakaPlayback);
        }

        const playerConfig: any = {
          source: url,
          parentId: '#clappr-container',
          width: '100%',
          height: '100%',
          autoPlay: true,
          poster: currentChannel.logo || DEFAULT_FALLBACK_LOGO,
          playback: {
            preload: 'auto',
            playbackNotSupportedMessage: 'Your browser does not support this stream format.',
          },
        };

        // Add Shaka configuration for DASH streams
        if (isDASH) {
          playerConfig.shakaConfiguration = {
            streaming: {
              rebufferingGoal: 2,
              bufferingGoal: 30,
            },
          };
        }

        const player = new Clappr.Player(playerConfig);

        hlsRef.current = player;

        player.on(Clappr.Events.PLAYER_READY, () => {
          setPlayerStatus("Playing (Clappr)");
        });

        player.on(Clappr.Events.PLAYER_ERROR, (error: any) => {
          setPlayerError(`Clappr Error: ${error}`);
          setPlayerStatus("Error");
        });
      } catch (err) {
        setPlayerError(`Failed to initialize Clappr: ${err}`);
        setPlayerStatus("Error");
      }
    }

    return () => {
      if (hlsRef.current) {
        if (typeof hlsRef.current.destroy === 'function') {
          hlsRef.current.destroy();
        } else if (typeof hlsRef.current.stop === 'function') {
          hlsRef.current.stop();
        }
        hlsRef.current = null;
      }
    };
  }, [currentChannel, playerMode]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 sm:mb-2">Player</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Watch your streaming channels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {currentChannel ? (
            <>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {playerMode === 1 ? (
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="w-full h-full"
                    poster={currentChannel.logo || DEFAULT_FALLBACK_LOGO}
                    data-testid="video-player"
                  />
                ) : (
                  <div
                    id="clappr-container"
                    className="w-full h-full"
                    data-testid="clappr-player"
                  />
                )}
              </div>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <img
                      src={currentChannel.logo || DEFAULT_FALLBACK_LOGO}
                      alt={currentChannel.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-contain bg-muted p-1"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_FALLBACK_LOGO;
                      }}
                      data-testid="img-current-logo"
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold mb-1" data-testid="text-current-name">
                        {currentChannel.name}
                      </h2>
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {currentChannel.group}
                      </Badge>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Status: <span className={playerError ? "text-destructive" : "text-success"}>{playerStatus}</span>
                      </p>
                      {playerError && (
                        <p className="text-xs sm:text-sm text-destructive mt-1">{playerError}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentIndex <= 0}
                      variant="secondary"
                      data-testid="button-previous"
                    >
                      <SkipBack className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={currentIndex >= channels.length - 1}
                      variant="secondary"
                      data-testid="button-next"
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Next
                    </Button>
                    <Button
                      onClick={() => setPlayerMode(playerMode === 1 ? 2 : 1)}
                      variant="outline"
                      className="ml-auto"
                      data-testid="button-switch-player"
                    >
                      Player Mode: {playerMode}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-16 text-center">
                <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No channel selected</p>
                <p className="text-sm text-muted-foreground">
                  Select a channel from the list to start playing
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Playlist Queue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {channels.length > 0 ? (
                  <div className="space-y-1 p-4">
                    {channels.map((channel, index) => (
                      <button
                        key={index}
                        onClick={() => loadChannel(channel, playerMode)}
                        className={`w-full text-left p-3 rounded-lg transition-colors hover-elevate ${
                          currentChannel?.url === channel.url
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                        data-testid={`queue-item-${index}`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={channel.logo || DEFAULT_FALLBACK_LOGO}
                            alt=""
                            className="w-10 h-10 rounded object-contain bg-background p-0.5"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_FALLBACK_LOGO;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-sm">{channel.name}</p>
                            <p className={`text-xs truncate ${
                              currentChannel?.url === channel.url
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}>
                              {channel.group}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground p-8">
                    No channels in playlist
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
