import { corsHeaders } from '../_shared/cors.ts';

interface OEmbedResponse {
  embeddable: boolean;
  html?: string;
  thumbnail?: string;
  title?: string;
  author_name?: string;
  original_url: string;
}

// Simple in-memory cache with expiration
const cache = new Map<string, { data: OEmbedResponse; expires: number }>();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid Instagram URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Instagram URL
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\/[a-zA-Z0-9_-]+\/?/;
    if (!instagramRegex.test(url)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Instagram URL. Must be a post or reel.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache
    const cached = cache.get(url);
    if (cached && cached.expires > Date.now()) {
      console.log('Returning cached response for:', url);
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('INSTAGRAM_OEMBED_TOKEN');
    if (!accessToken) {
      console.error('Instagram access token not configured');
      return new Response(
        JSON.stringify({ error: 'Instagram access token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Instagram oEmbed API
    const oembedUrl = `https://graph.facebook.com/v16.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${accessToken}`;
    
    const response = await fetch(oembedUrl);

    if (response.status === 429) {
      console.error('Rate limit exceeded');
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Instagram API error:', response.status, errorText);
      
      // Return non-embeddable response
      const fallbackResponse: OEmbedResponse = {
        embeddable: false,
        original_url: url,
        title: 'Instagram Post',
      };

      return new Response(
        JSON.stringify(fallbackResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    const normalizedResponse: OEmbedResponse = {
      embeddable: true,
      html: data.html,
      thumbnail: data.thumbnail_url,
      title: data.title,
      author_name: data.author_name,
      original_url: url,
    };

    // Cache for 24 hours
    cache.set(url, {
      data: normalizedResponse,
      expires: Date.now() + 24 * 60 * 60 * 1000,
    });

    return new Response(
      JSON.stringify(normalizedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in instagram-oembed:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
