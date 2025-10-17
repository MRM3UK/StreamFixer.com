import type { Channel } from "@shared/schema";
import { TELEGRAM_CHANNEL, LOGO_BASE_URL } from "@shared/schema";

/**
 * Parse M3U file content into Channel array
 */
export function parseM3U(text: string): Channel[] {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines[0] !== '#EXTM3U') {
    throw new Error('Invalid M3U file format. Must start with #EXTM3U.');
  }

  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('#EXTINF')) {
      currentChannel = {};
      const attributesString = line.substring(line.indexOf(' ')).split(',')[0].trim();
      const attributes = attributesString.match(/([^=]+)="([^"]*)"/g) || [];
      
      attributes.forEach(attr => {
        const [key, value] = attr.split('=').map(s => s.replace(/"/g, ''));
        const lowerKey = key.toLowerCase();
        
        if (lowerKey === 'tvg-name' || lowerKey === 'channel-name') {
          currentChannel.name = value;
        }
        if (lowerKey === 'tvg-logo' || lowerKey === 'logo') {
          currentChannel.logo = value;
        }
        if (lowerKey === 'group-title') {
          currentChannel.group = value;
        }
      });

      const channelTitle = line.substring(line.lastIndexOf(',') + 1).trim();
      currentChannel.name = (currentChannel.name && currentChannel.name !== '') ? currentChannel.name : channelTitle;
      currentChannel.logo = currentChannel.logo || '';
      currentChannel.group = currentChannel.group || 'General';

    } else if (line.startsWith('http')) {
      currentChannel.url = line;
      if (currentChannel.name && currentChannel.url) {
        channels.push(currentChannel as Channel);
      }
      currentChannel = {};
    }
  }

  return channels;
}

/**
 * Generate M3U file content from Channel array
 * Automatically includes Telegram referral channel
 */
export function generateM3U(channels: Channel[]): string {
  let content = '#EXTM3U\n';
  
  // Add Telegram channel first
  content += `#EXTINF:-1 tvg-logo="${TELEGRAM_CHANNEL.logo}" group-title="${TELEGRAM_CHANNEL.group}",${TELEGRAM_CHANNEL.name}\n`;
  content += `${TELEGRAM_CHANNEL.url}\n`;
  
  // Add user channels
  channels.forEach(channel => {
    if (!channel.name || !channel.url) return;
    
    content += '#EXTINF:-1';
    if (channel.logo && channel.logo.trim()) {
      content += ` tvg-logo="${channel.logo}"`;
    }
    if (channel.group && channel.group.trim()) {
      content += ` group-title="${channel.group}"`;
    }
    content += `,${channel.name}\n`;
    content += `${channel.url}\n`;
  });
  
  return content;
}

/**
 * Slugify channel name for logo URL matching
 */
export function slugifyChannelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generate logo URL from channel name using tv-logos repository
 */
export function generateLogoUrl(channelName: string): string {
  const baseUrl = LOGO_BASE_URL.replace(/\/+$/, '');
  const slug = slugifyChannelName(channelName);
  return `${baseUrl}/${slug}.png`;
}

/**
 * Apply auto-generated logos to channels missing logos
 * @param channels - Array of channels
 * @param targetIndices - Optional array of indices to apply logos to. If not provided, applies to all channels.
 */
export function applyAutoLogos(channels: Channel[], targetIndices?: number[]): Channel[] {
  const shouldApply = (index: number) => !targetIndices || targetIndices.includes(index);
  
  return channels.map((channel, index) => {
    if (shouldApply(index) && (!channel.logo || channel.logo.trim() === '')) {
      return {
        ...channel,
        logo: generateLogoUrl(channel.name)
      };
    }
    return channel;
  });
}

/**
 * Download content as file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
