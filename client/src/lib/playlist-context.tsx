import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Channel, Playlist, PlayerMode } from '@shared/schema';
import { DEFAULT_PLAYLIST_URL } from '@shared/schema';
import { parseM3U } from './m3u-utils';

interface PlaylistContextType {
  playlists: Record<string, Playlist>;
  currentPlaylist: Playlist | null;
  currentPlaylistId: string | null;
  channels: Channel[];
  searchQuery: string;
  filteredChannels: Channel[];
  isLoading: boolean;
  error: string | null;
  playerMode: PlayerMode;
  currentChannel: Channel | null;
  
  loadPlaylist: (id: string) => void;
  createPlaylist: (name: string, channels: Channel[]) => void;
  updatePlaylist: (id: string, playlist: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addChannel: (channel: Channel) => void;
  updateChannel: (index: number, channel: Partial<Channel>) => void;
  deleteChannel: (index: number) => void;
  setChannels: (channels: Channel[]) => void;
  setSearchQuery: (query: string) => void;
  setPlayerMode: (mode: PlayerMode) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  saveCurrentPlaylist: (name?: string) => void;
  loadDefaultPlaylist: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

const STORAGE_KEY = 'm3u_playlists';
const LAST_LOADED_KEY = 'm3u_last_loaded';

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Record<string, Playlist>>({});
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [channels, setChannelsState] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<PlayerMode>(1);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  const currentPlaylist = currentPlaylistId ? playlists[currentPlaylistId] : null;

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load playlists from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPlaylists(parsed);
        
        const lastLoaded = localStorage.getItem(LAST_LOADED_KEY);
        if (lastLoaded && parsed[lastLoaded]) {
          const playlist = parsed[lastLoaded];
          setCurrentPlaylistId(lastLoaded);
          setChannelsState(playlist.channels);
        }
      } catch (e) {
        console.error('Failed to parse stored playlists:', e);
      }
    }
  }, []);

  const saveToStorage = (updatedPlaylists: Record<string, Playlist>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      setError('Failed to save playlist. Storage may be full.');
    }
  };

  const loadPlaylist = (id: string) => {
    const playlist = playlists[id];
    if (playlist) {
      setCurrentPlaylistId(id);
      setChannelsState(playlist.channels);
      localStorage.setItem(LAST_LOADED_KEY, id);
    }
  };

  const createPlaylist = (name: string, newChannels: Channel[]) => {
    const id = `playlist_${Date.now()}`;
    const playlist: Playlist = {
      id,
      name,
      channels: newChannels,
      timestamp: Date.now(),
      isDefault: false,
    };
    
    const updated = { ...playlists, [id]: playlist };
    saveToStorage(updated);
    setCurrentPlaylistId(id);
    setChannelsState(newChannels);
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    const playlist = playlists[id];
    if (playlist) {
      const updated = {
        ...playlists,
        [id]: { ...playlist, ...updates, timestamp: Date.now() }
      };
      saveToStorage(updated);
      
      if (id === currentPlaylistId) {
        setChannelsState(updated[id].channels);
      }
    }
  };

  const deletePlaylist = (id: string) => {
    const updated = { ...playlists };
    delete updated[id];
    saveToStorage(updated);
    
    if (id === currentPlaylistId) {
      setCurrentPlaylistId(null);
      setChannelsState([]);
    }
    
    if (localStorage.getItem(LAST_LOADED_KEY) === id) {
      localStorage.removeItem(LAST_LOADED_KEY);
    }
  };

  const addChannel = (channel: Channel) => {
    const updated = [...channels, channel];
    setChannelsState(updated);
    
    if (currentPlaylistId && currentPlaylist) {
      updatePlaylist(currentPlaylistId, { channels: updated });
    }
  };

  const updateChannel = (index: number, updates: Partial<Channel>) => {
    const updated = [...channels];
    updated[index] = { ...updated[index], ...updates };
    setChannelsState(updated);
    
    if (currentPlaylistId && currentPlaylist) {
      updatePlaylist(currentPlaylistId, { channels: updated });
    }
  };

  const deleteChannel = (index: number) => {
    const updated = channels.filter((_, i) => i !== index);
    setChannelsState(updated);
    
    if (currentPlaylistId && currentPlaylist) {
      updatePlaylist(currentPlaylistId, { channels: updated });
    }
  };

  const setChannels = (newChannels: Channel[]) => {
    setChannelsState(newChannels);
    
    if (currentPlaylistId && currentPlaylist) {
      updatePlaylist(currentPlaylistId, { channels: newChannels });
    }
  };

  const saveCurrentPlaylist = useCallback((name?: string) => {
    if (channels.length === 0) return;
    
    if (currentPlaylistId && currentPlaylist && !currentPlaylist.isDefault) {
      const playlistName = name || currentPlaylist.name;
      updatePlaylist(currentPlaylistId, { name: playlistName, channels });
    } else {
      const playlistName = name || `Playlist ${new Date().toLocaleString()}`;
      createPlaylist(playlistName, channels);
    }
  }, [channels, currentPlaylistId, currentPlaylist, updatePlaylist, createPlaylist]);

  const loadDefaultPlaylist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(DEFAULT_PLAYLIST_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load default playlist`);
      }
      
      const text = await response.text();
      const parsed = parseM3U(text);
      
      const id = 'default_playlist';
      const playlist: Playlist = {
        id,
        name: 'Default Playlist',
        channels: parsed,
        timestamp: Date.now(),
        isDefault: true,
      };
      
      setCurrentPlaylistId(id);
      setChannelsState(parsed);
      setPlaylists(prev => ({ ...prev, [id]: playlist }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load default playlist';
      setError(message);
      console.error('Default playlist load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: PlaylistContextType = {
    playlists,
    currentPlaylist,
    currentPlaylistId,
    channels,
    searchQuery,
    filteredChannels,
    isLoading,
    error,
    playerMode,
    currentChannel,
    
    loadPlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addChannel,
    updateChannel,
    deleteChannel,
    setChannels,
    setSearchQuery,
    setPlayerMode,
    setCurrentChannel,
    setIsLoading,
    setError,
    
    saveCurrentPlaylist,
    loadDefaultPlaylist,
  };

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within PlaylistProvider');
  }
  return context;
}
