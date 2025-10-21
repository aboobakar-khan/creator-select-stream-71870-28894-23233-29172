export interface YouTubeChannel {
  id: string;
  title: string;
  thumbnail: string;
  subscriberCount: string;
  description: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
}
