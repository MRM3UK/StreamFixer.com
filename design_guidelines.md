# StreamFixer Multi-Page Application Design Guidelines

## Design Approach

**Selected Framework**: Design System Approach with Custom Dark Theme
- **Rationale**: Utility-focused streaming application requiring consistent, efficient UI patterns across multiple pages
- **Inspiration**: Netflix's content management + Spotify's playlist UI + Material Design's information density
- **Core Principle**: Dark-first, media-centric interface optimizing for playlist management workflows

## Color System

### Dark Mode Foundation (Primary Theme)
- **Background Primary**: 26 13% 18% (Deep navy-black #1a1a2e)
- **Background Secondary**: 250 22% 21% (Elevated surfaces #2c2c44)  
- **Card Background**: 250 19% 21% (Channel cards #2a2a3e)
- **Text Primary**: 220 13% 95% (High contrast #f3f4f6)
- **Text Secondary**: 220 9% 70% (Subdued content)

### Action & Accent Colors
- **Primary Action**: 244 58% 58% (Indigo #4f46e5) - Main CTAs, active states
- **Secondary Action**: 258 90% 66% (Purple #8b5cf6) - Secondary buttons, highlights
- **Success**: 142 76% 36% (Green #22c55e) - Add actions, confirmations
- **Warning**: 38 92% 50% (Yellow #eab308) - Bulk operations
- **Danger**: 0 84% 60% (Red #ef4444) - Delete actions
- **Info**: 217 91% 60% (Blue #3b82f6) - Logo fetch, player controls

### Semantic Colors
- **Border**: 220 13% 40% (Subtle dividers)
- **Input Background**: 222 47% 11% (Form fields #1e1b2e)
- **Hover Overlay**: 250 100% 100% @ 5% opacity
- **Focus Ring**: 258 90% 66% @ 50% opacity

## Typography

### Font System
- **Primary**: 'Inter', -apple-system, system-ui, sans-serif
- **Monospace**: 'JetBrains Mono', 'Fira Code', monospace (for M3U code display)

### Type Scale
- **H1 (Page Titles)**: text-3xl (30px) / font-extrabold / tracking-tight
- **H2 (Section Headers)**: text-2xl (24px) / font-bold / tracking-tight  
- **H3 (Card Titles)**: text-lg (18px) / font-bold
- **H4 (Modal Titles)**: text-xl (20px) / font-semibold
- **Body**: text-base (16px) / font-normal / leading-relaxed
- **Small**: text-sm (14px) / font-medium
- **Micro**: text-xs (12px) / font-medium (channel numbers, metadata)

## Layout System

### Spacing Primitives
- **Core Units**: Tailwind scale of 2, 3, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- **Card Padding**: p-4 to p-6 depending on content density
- **Section Spacing**: py-8 to py-12 between major sections
- **Grid Gaps**: gap-4 (16px) for card grids, gap-3 (12px) for compact lists

### Grid Structure
- **Mobile (< 640px)**: Single column, full-width cards
- **Tablet (640-1024px)**: 2-column grid for channels, full-width for forms
- **Desktop (1024-1536px)**: 3-column grid for channels, 2-column for detailed views
- **Wide (> 1536px)**: 4-column grid maximum for optimal readability

### Container Strategy
- **Max Width**: max-w-7xl (1280px) for main content
- **Full Bleed**: Navigation, modals, and player use full viewport
- **Centered**: mx-auto for all page content

## Component Library

### Navigation
- **Sidebar Navigation** (Desktop): Fixed left sidebar, 240px width, dark background with purple accent for active page
- **Bottom Nav** (Mobile): Fixed bottom bar with icons, 5 primary pages (Dashboard, Playlists, Editor, Player, Export)
- **Breadcrumb**: Secondary navigation showing current page context

### Cards & Lists
- **Channel Card**: 
  - Elevated card (bg-card-bg) with border-gray-700/50
  - Logo container: 48x48px, rounded-md, background fallback
  - 3D Channel Number: Gradient badge (indigo→violet), extrabold text, subtle shadow
  - Inline editable fields: Name (text-lg/bold) and Group (text-xs/purple-400)
  - Action buttons row: Play (purple-600) + Edit (gray-700)

- **Playlist Card**: Summary view with channel count, timestamp, thumbnail grid preview
- **Stat Cards**: Dashboard metrics with icon, number, and trend indicator

### Forms & Inputs
- **Text Inputs**: Dark bg (gray-800), border-gray-600, focus ring purple-500, rounded-lg
- **Search Bar**: Sticky position, full-width on mobile, max-w-xs on desktop, purple focus state
- **Select Dropdowns**: Match input styling, chevron indicator
- **File Upload**: Purple button with icon, hidden native input
- **Toggle Switches**: For player mode, settings

### Modals & Overlays
- **Modal Container**: max-w-lg to max-w-2xl depending on content, rounded-xl, p-6
- **Backdrop**: rgba(0,0,0,0.75) with blur(5px)
- **Header**: Sticky, flex justify-between, border-bottom-gray-700
- **Scrollable Content**: max-h-[90vh] with overflow-y-auto
- **Video Player Modal**: Wider modal (max-w-4xl) for aspect-ratio preservation

### Buttons
- **Primary**: bg-purple-600, hover:bg-purple-700, rounded-lg, px-4 py-2, font-semibold
- **Secondary**: bg-gray-700, hover:bg-gray-600
- **Success**: bg-green-600, hover:bg-green-700 (Add Channel)
- **Warning**: bg-yellow-600, hover:bg-yellow-700 (Bulk Operations)
- **Danger**: bg-red-600, hover:bg-red-700 (Delete)
- **Icon Buttons**: p-2, rounded-lg, with hover state

### Player Components
- **Video Container**: aspect-video, bg-black, rounded-lg
- **Controls Overlay**: Gradient overlay, custom controls with purple accents
- **Player Switcher**: Pill toggle between HLS.js and Clappr/Shaka
- **Status Indicator**: Text badge showing player state (Loading/Playing/Error)

## Page-Specific Layouts

### Dashboard
- **Hero Stats**: 3-4 stat cards showing total channels, playlists, recent activity
- **Quick Actions**: Large button grid for Import, Create New, Recent Playlists
- **Recent Activity**: Timeline/list of last edited playlists

### Playlist Manager  
- **List View**: Sortable table/card grid of saved playlists with actions
- **Filters**: By date, channel count, group
- **Bulk Actions**: Select multiple, delete, merge

### Channel Editor
- **Toolbar**: Sticky top with Search, Add, Bulk Edit, Auto Logos buttons
- **Channel Grid**: Responsive card grid as primary view
- **Inline Editing**: Click-to-edit with visual feedback (focus rings)

### Player Page
- **Full-Width Player**: Centered video with max-w-5xl
- **Playlist Queue**: Sidebar/bottom sheet showing upcoming channels
- **Channel Info**: Below player with logo, name, group badge

### Export/Settings
- **Code Display**: Full-height textarea with monospace font, syntax highlighting via color
- **Export Options**: Button grid for Download M3U, TXT, Copy, Share Link
- **Settings Sections**: Collapsed accordions for Player Preferences, Storage, Theme

## Visual Enhancements

### Microinteractions
- **Skeleton Loading**: Pulse animation for channel cards during load
- **Hover States**: Scale(1.02) + shadow-xl on cards
- **Focus States**: 2px purple ring with slight shadow
- **Button Transitions**: all 0.2s ease for background colors
- **Minimal Animations**: Fade-in for modals, slide-up for mobile nav

### Depth & Elevation
- **Level 0**: Base page (bg-primary)
- **Level 1**: Cards (bg-card-bg + border)
- **Level 2**: Modals (bg-secondary + shadow-2xl)
- **Level 3**: Dropdowns, tooltips (bg-gray-800 + shadow-xl)

### Special Elements
- **3D Channel Number**: Linear gradient badge with inset highlight, text-shadow, transform translateY(-2px)
- **Logo Fallback**: Consistent default logo (pixeldrain), smooth error handling
- **Telegram Badge**: Fixed bottom-right, rounded-full, bg-gray-800/80, backdrop-blur
- **Status Messages**: Color-coded (green-400 success, red-400 error, yellow-400 warning)

## Accessibility

- **Focus Indicators**: Visible purple rings on all interactive elements
- **Color Contrast**: Minimum 7:1 for text on dark backgrounds
- **Keyboard Navigation**: Full arrow-key support in channel grid, Enter to edit
- **ARIA Labels**: Descriptive labels for icon-only buttons
- **Screen Reader**: Announce modal opens, player state changes

## Responsive Behavior

- **Breakpoint Strategy**: Mobile-first with progressive enhancement
- **Navigation**: Bottom bar (mobile) → Sidebar (desktop)
- **Grids**: 1 col → 2 col → 3 col → 4 col at defined breakpoints
- **Modals**: Full-screen on mobile, centered overlay on desktop
- **Player**: Full-viewport on mobile, contained on desktop

This design system ensures consistency across all pages while maintaining the dark, media-centric aesthetic optimized for streaming playlist management workflows.