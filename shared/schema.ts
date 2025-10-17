import { z } from "zod";

// Channel Schema
export const channelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  logo: z.string().url().optional().or(z.literal("")),
  group: z.string().default("General"),
  url: z.string().url("Valid stream URL is required"),
});

export const insertChannelSchema = channelSchema;
export type Channel = z.infer<typeof channelSchema>;
export type InsertChannel = z.infer<typeof insertChannelSchema>;

// Playlist Schema
export const playlistSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Playlist name is required"),
  channels: z.array(channelSchema),
  timestamp: z.number(),
  isDefault: z.boolean().default(false),
});

export const insertPlaylistSchema = playlistSchema.omit({ id: true, timestamp: true });
export type Playlist = z.infer<typeof playlistSchema>;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

// Player State
export type PlayerMode = 1 | 2; // 1: HLS.js, 2: Clappr/Shaka

export interface PlayerState {
  mode: PlayerMode;
  currentChannel: Channel | null;
  isPlaying: boolean;
  error: string | null;
}

// Constants
export const DEFAULT_PLAYLIST_URL = 'https://raw.githubusercontent.com/MRM3UK/New-try/refs/heads/main/playlist4.m3u';
export const DEFAULT_FALLBACK_LOGO = 'https://pixeldrain.com/api/file/khPX4Kf4/thumbnail';
export const LOGO_BASE_URL = 'https://raw.githubusercontent.com/iptv-org/tv-logos/master/logos/';
export const TELEGRAM_CHANNEL_URL = 'https://t.me/MR_X_069';

// Telegram Default Channel
export const TELEGRAM_CHANNEL: Channel = {
  name: 't.me/MR_X_069',
  logo: DEFAULT_FALLBACK_LOGO,
  group: 't.me/MR_X_069',
  url: 'https://pixeldrain.com/api/file/khPX4Kf4'
};
