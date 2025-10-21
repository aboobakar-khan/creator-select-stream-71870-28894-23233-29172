export type PlatformType = 'instagram' | 'pinterest' | 'tiktok' | 'twitter' | 'youtube' | 'vimeo' | 'unknown';

export interface ParsedUrl {
  platform: PlatformType;
  embedUrl: string;
  originalUrl: string;
}

export const detectPlatform = (url: string): PlatformType => {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('pinterest.com')) return 'pinterest';
  if (urlLower.includes('tiktok.com')) return 'tiktok';
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
  if (urlLower.includes('vimeo.com')) return 'vimeo';
  
  return 'unknown';
};

export const parseUrlForEmbed = (url: string): ParsedUrl => {
  const platform = detectPlatform(url);
  let embedUrl = '';
  
  switch (platform) {
    case 'instagram':
      embedUrl = `${url}embed/`;
      break;
    case 'pinterest':
      embedUrl = url;
      break;
    case 'tiktok':
      embedUrl = url;
      break;
    case 'twitter':
      embedUrl = url;
      break;
    case 'youtube': {
      const videoId = extractYoutubeId(url);
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      break;
    }
    case 'vimeo': {
      const videoId = url.split('/').pop();
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
      break;
    }
    default:
      embedUrl = url;
  }
  
  return {
    platform,
    embedUrl,
    originalUrl: url,
  };
};

const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};
