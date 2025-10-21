import { useState, useEffect } from "react";
import { Search, Plus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { searchChannels } from "@/lib/youtube";
import { YouTubeChannel } from "@/types/youtube";
import { toast } from "sonner";

interface ChannelSearchProps {
  onAddChannel: (channel: YouTubeChannel) => void;
  selectedChannelIds: string[];
}

export function ChannelSearch({ onAddChannel, selectedChannelIds }: ChannelSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YouTubeChannel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsSearching(true);
        setError(null);
        try {
          const channels = await searchChannels(query);
          setResults(channels);
        } catch (err) {
          console.error('Search error:', err);
          setError(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else if (query.trim().length === 0) {
        setResults([]);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search YouTube creators..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((channel) => {
            const isSelected = selectedChannelIds.includes(channel.id);
            
            return (
              <Card key={channel.id} className="overflow-hidden transition-all hover:shadow-md">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={channel.thumbnail}
                      alt={channel.title}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight">{channel.title}</h3>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!isSelected) {
                              onAddChannel(channel);
                              toast.success(`Added ${channel.title}`);
                            }
                          }}
                          disabled={isSelected}
                          variant={isSelected ? "secondary" : "default"}
                          className="flex-shrink-0"
                        >
                          {isSelected ? "Added" : <Plus className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{channel.subscriberCount} subscribers</span>
                      </div>
                      {channel.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {channel.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive font-medium">
            {error.includes('quota') ? 'API Quota Exceeded' : 'Error'}
          </p>
          <p className="text-xs text-destructive/80 mt-1">{error}</p>
          {error.includes('quota') && (
            <p className="text-xs text-muted-foreground mt-2">
              The YouTube API has daily usage limits. Please try again later.
            </p>
          )}
        </div>
      )}

      {query.trim().length > 0 && query.trim().length <= 2 && !error && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  );
}
