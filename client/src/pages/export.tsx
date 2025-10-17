import { useState } from "react";
import { usePlaylist } from "@/lib/playlist-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Check } from "lucide-react";
import { TELEGRAM_CHANNEL } from "@shared/schema";
import { generateM3U, downloadFile } from "@/lib/m3u-utils";

export default function Export() {
  const { channels, currentPlaylist } = usePlaylist();
  const [copied, setCopied] = useState(false);

  const m3uContent = generateM3U(channels);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(m3uContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (format: 'm3u' | 'txt') => {
    const filename = currentPlaylist?.name || 'playlist';
    const sanitizedFilename = `${filename.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
    const mimeType = format === 'm3u' ? 'audio/x-mpegurl' : 'text/plain';
    downloadFile(m3uContent, sanitizedFilename, mimeType);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Export & Share</h1>
        <p className="text-muted-foreground">
          Export your playlist as M3U file or plain text
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>M3U Playlist Code</CardTitle>
              <CardDescription>
                This playlist includes {channels.length} channels plus the Telegram referral channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={m3uContent}
                className="font-mono text-sm min-h-[400px] bg-muted"
                data-testid="textarea-m3u-code"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleCopy}
                className="w-full justify-start"
                variant={copied ? "secondary" : "default"}
                data-testid="button-copy"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleDownload('m3u')}
                className="w-full justify-start"
                variant="secondary"
                data-testid="button-download-m3u"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as .m3u
              </Button>

              <Button
                onClick={() => handleDownload('txt')}
                className="w-full justify-start"
                variant="secondary"
                data-testid="button-download-txt"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as .txt
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Channels:</span>
                <span className="font-semibold">{channels.length + 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unique Groups:</span>
                <span className="font-semibold">
                  {new Set([...channels.map(c => c.group), TELEGRAM_CHANNEL.group]).size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-semibold">M3U8</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">About Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                The exported playlist automatically includes a reference to t.me/MR_X_069 as the first channel.
                You can import this playlist into any IPTV player application.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
