import { YouTubeChannel, YouTubeVideo } from "@/types/youtube";
import { supabase } from "@/integrations/supabase/client";

export async function searchChannels(query: string): Promise<YouTubeChannel[]> {
  try {
    const { data, error } = await supabase.functions.invoke('youtube-search-channels', {
      body: { query }
    });
    
    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`API Error: ${error.message || 'Unknown error'}`);
    }
    
    if (data?.error) {
      console.error("YouTube API error:", data.error, data.details);
      throw new Error(`YouTube API Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
    }
    
    return data || [];
  } catch (error) {
    console.error("Error searching channels:", error);
    throw error;
  }
}

export async function getMultipleChannelsVideos(
  channelIds: string[], 
  pageTokens?: Record<string, string>
): Promise<{ videos: YouTubeVideo[]; pageTokens: Record<string, string>; hasMore: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('youtube-get-videos', {
      body: { channelIds, pageTokens: pageTokens || {} }
    });
    
    if (error) throw error;
    
    return data || { videos: [], pageTokens: {}, hasMore: false };
  } catch (error) {
    console.error("Error fetching videos:", error);
    return { videos: [], pageTokens: {}, hasMore: false };
  }
}
