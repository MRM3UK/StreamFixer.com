# StreamFixer - M3U Playlist Editor

## Overview

StreamFixer is a client-side web application for managing and editing M3U streaming playlists. It provides a comprehensive interface for importing, organizing, editing, and exporting IPTV channel lists with integrated video player capabilities. The application is built as a Single Page Application (SPA) with all data persisted locally in the browser's localStorage, requiring no backend server for playlist management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight React Router alternative)
- **TanStack Query (React Query)** for data fetching and state management
- **React Hook Form** with Zod validation for form handling

**Design System**
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling with custom dark theme configuration
- **Class Variance Authority (CVA)** for component variant management
- Custom design system following Netflix/Spotify-inspired dark-first interface
- Color palette optimized for media-centric workflows with HSL-based theming

**State Management**
- **PlaylistContext** - Custom React Context providing centralized playlist and channel state
- **localStorage** - Primary persistence layer for all user data (playlists, channels, preferences)
- No server-side state or database - fully client-side application
- Player state managed separately for HLS.js and Clappr/Shaka playback modes

### Application Structure

**Page Routes**
- `/` - Dashboard with statistics and quick actions
- `/playlists` - Playlist library management
- `/editor` - Channel editing interface with bulk operations
- `/player` - Integrated video player with HLS/DASH support
- `/export` - M3U file export and sharing functionality

**Key Features**
- M3U file parsing and generation
- Multi-mode video player (HLS.js, Clappr with Shaka for DASH)
- Channel logo auto-fetching from iptv-org/tv-logos repository
- Bulk channel operations (edit, delete, logo updates)
- Playlist versioning via localStorage snapshots
- Mobile-responsive design with bottom navigation

### Data Models

**Channel Schema** (Zod validated)
```typescript
{
  name: string (required)
  logo: string (URL, optional)
  group: string (default: "General")
  url: string (URL, required)
}
```

**Playlist Schema**
```typescript
{
  id: string (auto-generated)
  name: string (required)
  channels: Channel[]
  timestamp: number (creation time)
  isDefault: boolean (default: false)
}
```

**Player Modes**
- Mode 1: HLS.js for .m3u8 streams
- Mode 2: Clappr with Shaka plugin for DASH/MPD streams

### M3U Processing

**Parser Implementation**
- Custom M3U parser in `lib/m3u-utils.ts`
- Extracts EXTINF metadata (tvg-name, tvg-logo, group-title)
- Validates stream URLs and channel structure
- Handles malformed entries gracefully

**Generator**
- Automatically injects Telegram referral channel
- Maintains M3U8 format compliance
- Supports export as .m3u or .txt formats

### Video Player Integration

**CDN-Loaded Libraries**
- HLS.js v1 - HTTP Live Streaming support
- Clappr v0.4 - Extensible media player framework
- Mux.js v5.6.7 - Media transmuxing
- Shaka Player v2.5.10 - DASH streaming
- dash-shaka-playback - Clappr plugin for DASH

**Player Strategy**
- Auto-detection of stream format (.m3u8 vs .mpd)
- Fallback mechanisms between player modes
- Error handling with user-friendly messages
- Player cleanup on component unmount

## External Dependencies

### UI Component Libraries
- **Radix UI** - Headless component primitives (30+ components)
  - Dialog, Dropdown, Select, Toast, Tooltip, etc.
  - Fully accessible ARIA-compliant components
  
- **shadcn/ui** - Pre-styled Radix components
  - Configured for dark theme via `components.json`
  - Custom color system in Tailwind config

### Styling & Utilities
- **Tailwind CSS** - Utility-first CSS framework
- **clsx & tailwind-merge** - Conditional class name handling
- **class-variance-authority** - Type-safe variant API

### Form & Validation
- **React Hook Form** - Performance-optimized forms
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod resolver for React Hook Form

### Media Streaming (CDN)
- **HLS.js** - MSE-based HLS player
- **Clappr** - HTML5 video player framework
- **Shaka Player** - DASH/HLS adaptive streaming
- **Mux.js** - MPEG2-TS to MP4 transmuxing

### Data Persistence
- **localStorage API** - All playlist and channel data
- No database or backend required
- Data structure: JSON-serialized Playlist objects keyed by ID

### Development Tools
- **Vite** - Fast build tool with HMR
- **TypeScript** - Static typing across codebase
- **ESBuild** - Production bundling
- **Replit plugins** - Error overlay, cartographer, dev banner

### Third-Party Services
- **iptv-org/tv-logos** (GitHub) - Channel logo repository
- **Pixeldrain API** - Fallback logo hosting
- Default playlist URL: GitHub raw content for initial data
- Telegram channel integration for referral attribution

### Font Stack
- **Google Fonts API**
  - Inter (400-900) - Primary UI font
  - JetBrains Mono (400-700) - Monospace for code display