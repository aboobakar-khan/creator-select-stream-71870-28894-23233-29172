import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import DOMPurify from "dompurify";

interface EmbedResult {
  embeddable: boolean;
  html?: string;
  thumbnail?: string;
  title?: string;
  author_name?: string;
  original_url: string;
}

export function InstagramEmbed() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EmbedResult | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) {
      toast.error("Please enter an Instagram URL");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('instagram-oembed', {
        body: { url: url.trim() }
      });

      if (error) {
        console.error('Error fetching Instagram embed:', error);
        toast.error(error.message || "Failed to fetch Instagram content");
        return;
      }

      setResult(data);

      if (data.embeddable) {
        toast.success("Instagram content loaded!");
        // Load Instagram embed script
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
          const script = document.createElement('script');
          script.src = "//www.instagram.com/embed.js";
          script.async = true;
          document.body.appendChild(script);
        } else {
          // If script already loaded, process embeds
          if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
        }
      } else {
        toast.info("This post cannot be embedded, showing fallback");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred while fetching the content");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Process Instagram embeds when result changes
    if (result?.embeddable && (window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    }
  }, [result]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Instagram Post Embed</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Paste an Instagram post or Reel URL to embed it here
        </p>
        
        <div className="flex gap-2">
          <Input
            placeholder="https://instagram.com/p/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleFetch()}
          />
          <Button onClick={handleFetch} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Fetch"
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          {result.embeddable && result.html ? (
            <div className="max-w-lg mx-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(result.html, {
                    ADD_TAGS: ['blockquote', 'script'],
                    ADD_ATTR: ['class', 'data-instgrm-permalink', 'data-instgrm-version'],
                  }),
                }}
              />
            </div>
          ) : (
            <div className="text-center space-y-4">
              {result.thumbnail && (
                <img
                  src={result.thumbnail}
                  alt={result.title || "Instagram post"}
                  className="max-w-sm mx-auto rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{result.title || "Instagram Post"}</h3>
                {result.author_name && (
                  <p className="text-sm text-muted-foreground">by {result.author_name}</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                This post cannot be embedded directly
              </p>
              <Button
                variant="outline"
                onClick={() => window.open(result.original_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open on Instagram
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
