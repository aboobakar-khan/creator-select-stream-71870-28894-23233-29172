import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelIds, pageTokens = {} } = await req.json();
    
    if (!channelIds || !Array.isArray(channelIds) || channelIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Channel IDs array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    console.log('API Key exists:', !!apiKey, 'Length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.error('YouTube API key not configured');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch videos for each channel with pagination
    const results: any = {};
    const newPageTokens: any = {};
    
    const videoPromises = channelIds.map(async (channelId: string) => {
      const pageToken = pageTokens[channelId] || '';
      const pageParam = pageToken ? `&pageToken=${pageToken}` : '';
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=10&key=${apiKey}${pageParam}`;
      
      const response = await fetch(url);
      console.log(`Channel ${channelId} response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`YouTube API error for channel ${channelId}:`, response.status, errorText);
        return { channelId, videos: [], nextPageToken: null };
      }
      
      const data = await response.json();
      
      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description,
      }));
      
      return {
        channelId,
        videos,
        nextPageToken: data.nextPageToken || null
      };
    });

    const channelResults = await Promise.all(videoPromises);
    const allVideos: any[] = [];
    
    channelResults.forEach(result => {
      allVideos.push(...result.videos);
      if (result.nextPageToken) {
        newPageTokens[result.channelId] = result.nextPageToken;
      }
    });
    
    // Check which videos are embeddable
    if (allVideos.length > 0) {
      const videoIds = allVideos.map(v => v.id).join(',');
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoIds}&key=${apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        const embeddableMap: Record<string, boolean> = {};
        
        detailsData.items.forEach((item: any) => {
          embeddableMap[item.id] = item.status.embeddable;
        });
        
        // Filter out non-embeddable videos
        const embeddableVideos = allVideos.filter(video => embeddableMap[video.id] === true);
        
        // Sort by date
        embeddableVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        
        return new Response(
          JSON.stringify({ 
            videos: embeddableVideos,
            pageTokens: newPageTokens,
            hasMore: Object.keys(newPageTokens).length > 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Fallback if embeddable check fails - return all videos
    allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return new Response(
      JSON.stringify({ 
        videos: allVideos,
        pageTokens: newPageTokens,
        hasMore: Object.keys(newPageTokens).length > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in youtube-get-videos:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
