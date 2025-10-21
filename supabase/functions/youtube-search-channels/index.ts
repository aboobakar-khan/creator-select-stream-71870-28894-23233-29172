import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
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

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=10&key=${apiKey}`;
    console.log('Search URL (without key):', searchUrl.replace(/key=[^&]*/, 'key=***'));
    
    const searchResponse = await fetch(searchUrl);
    console.log('Search response status:', searchResponse.status);
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('YouTube API error:', searchResponse.status, searchResponse.statusText, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to search channels', details: errorText }),
        { status: searchResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get channel IDs to fetch details
    const channelIds = searchData.items.map((item: any) => item.snippet.channelId).join(',');
    
    // Fetch channel details including subscriber count
    const detailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      console.error('YouTube API error fetching details:', detailsResponse.status);
      // Fallback to basic info without subscriber count
      const channels = searchData.items.map((item: any) => ({
        id: item.snippet.channelId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        subscriberCount: 'N/A',
        description: item.snippet.description || '',
      }));
      
      return new Response(
        JSON.stringify(channels),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const detailsData = await detailsResponse.json();
    
    // Format subscriber count
    const formatSubscribers = (count: string) => {
      const num = parseInt(count);
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };
    
    const channels = detailsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      subscriberCount: formatSubscribers(item.statistics.subscriberCount || '0'),
      description: item.snippet.description || '',
    }));

    return new Response(
      JSON.stringify(channels),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in youtube-search-channels:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
