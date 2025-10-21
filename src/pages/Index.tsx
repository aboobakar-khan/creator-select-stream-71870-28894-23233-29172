import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelSearch } from "@/components/ChannelSearch";
import { SelectedChannels } from "@/components/SelectedChannels";
import { VideoGrid } from "@/components/VideoGrid";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EmbedUrlForm } from "@/components/EmbedUrlForm";
import { EmbedContent } from "@/components/EmbedContent";
import { NicheSelector } from "@/components/NicheSelector";
import { MobileNav } from "@/components/MobileNav";
import { DesktopNav } from "@/components/DesktopNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getMultipleChannelsVideos } from "@/lib/youtube";
import { YouTubeChannel, YouTubeVideo } from "@/types/youtube";
import { parseUrlForEmbed, ParsedUrl } from "@/lib/embedUtils";
import { toast } from "sonner";
import { Youtube, Link2, Sparkles, Search as SearchIcon, X } from "lucide-react";

const Index = () => {
  const [activeView, setActiveView] = useState<"feed" | "search" | "saved" | "profile">("feed");
  const [activeTab, setActiveTab] = useState<"youtube" | "embed">("youtube");
  const [selectedChannels, setSelectedChannels] = useLocalStorage<YouTubeChannel[]>("selectedChannels", []);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageTokens, setPageTokens] = useState<Record<string, string>>({});
  const [hasMore, setHasMore] = useState(false);
  const [embeddedContent, setEmbeddedContent] = useLocalStorage<ParsedUrl[]>("embeddedContent", []);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter videos based on search query
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    
    const query = searchQuery.toLowerCase();
    return videos.filter(video => 
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.channelTitle.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  const loadVideos = async (reset = true) => {
    if (selectedChannels.length === 0) {
      setVideos([]);
      setPageTokens({});
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    try {
      const channelIds = selectedChannels.map(c => c.id);
      const tokensToUse = reset ? {} : pageTokens;
      const result = await getMultipleChannelsVideos(channelIds, tokensToUse);
      
      if (reset) {
        setVideos(result.videos);
      } else {
        // Deduplicate videos by ID
        setVideos(prev => {
          const existingIds = new Set(prev.map(v => v.id));
          const newVideos = result.videos.filter(v => !existingIds.has(v.id));
          return [...prev, ...newVideos];
        });
      }
      
      setPageTokens(result.pageTokens);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreVideos = useCallback(() => {
    if (!isLoading && hasMore && selectedChannels.length > 0) {
      loadVideos(false);
    }
  }, [isLoading, hasMore, selectedChannels, pageTokens]);

  useEffect(() => {
    loadVideos(true);
  }, [selectedChannels]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreVideos();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Start loading before reaching the bottom
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget && hasMore && !isLoading) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMoreVideos]);

  const handleAddChannel = (channel: YouTubeChannel) => {
    if (!selectedChannels.find(c => c.id === channel.id)) {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleSelectNiche = (channels: YouTubeChannel[]) => {
    const newChannels = channels.filter(
      channel => !selectedChannels.find(c => c.id === channel.id)
    );
    if (newChannels.length > 0) {
      setSelectedChannels([...selectedChannels, ...newChannels]);
      toast.success(`Added ${newChannels.length} channels from this niche`);
    } else {
      toast.info("All channels from this niche are already added");
    }
  };

  const handleRemoveChannel = (channelId: string) => {
    setSelectedChannels(selectedChannels.filter(c => c.id !== channelId));
  };

  const handleAddUrl = (url: string) => {
    const parsed = parseUrlForEmbed(url);
    setEmbeddedContent([parsed, ...embeddedContent]);
  };

  const handleRemoveEmbed = (index: number) => {
    setEmbeddedContent(embeddedContent.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <DesktopNav 
        activeView={activeView}
        onViewChange={setActiveView}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      
      <MobileNav 
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manage Your Feed</SheetTitle>
          </SheetHeader>
          
          <Tabs defaultValue="search" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search Creators</TabsTrigger>
              <TabsTrigger value="selected">
                Following ({selectedChannels.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="mt-4">
              <ChannelSearch
                onAddChannel={handleAddChannel}
                selectedChannelIds={selectedChannels.map(c => c.id)}
              />
            </TabsContent>
            
            <TabsContent value="selected" className="mt-4">
              <SelectedChannels
                channels={selectedChannels}
                onRemoveChannel={handleRemoveChannel}
              />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {activeView === "feed" && (
          <>
            {selectedChannels.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                    <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Welcome to Creator Feed</h2>
                    <p className="text-muted-foreground mb-6">
                      Start by exploring popular niches or search for your favorite creators
                    </p>
                  </div>
                  <NicheSelector onSelectNiche={handleSelectNiche} />
                </div>
              </div>
            ) : (
              <>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "youtube" | "embed")} className="mb-6">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                    <TabsTrigger value="youtube" className="gap-2">
                      <Youtube className="h-4 w-4" />
                      Videos
                    </TabsTrigger>
                    <TabsTrigger value="embed" className="gap-2">
                      <Link2 className="h-4 w-4" />
                      Embeds
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {activeTab === "youtube" ? (
                  <>
                    {videos.length > 0 && (
                      <div className="mb-6">
                        <div className="relative max-w-xl mx-auto">
                          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Search videos by title, description, or creator..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        {searchQuery && (
                          <p className="text-sm text-muted-foreground text-center mt-2">
                            Found {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}

                    {videos.length === 0 && isLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Loading your feed...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {selectedVideo && (
                          <div className="mb-8">
                            <VideoPlayer 
                              video={selectedVideo} 
                              onClose={() => setSelectedVideo(null)}
                            />
                          </div>
                        )}
                        
                        {filteredVideos.length > 0 ? (
                          <>
                            <VideoGrid 
                              videos={filteredVideos} 
                              onVideoClick={setSelectedVideo}
                            />
                            
                            {!searchQuery && hasMore && (
                              <div ref={observerTarget} className="flex items-center justify-center py-8 min-h-[100px]">
                                {isLoading ? (
                                  <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                                    <p className="text-sm text-muted-foreground">Loading more...</p>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">
                                    Scroll for more videos
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : searchQuery ? (
                          <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No videos found matching "{searchQuery}"</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="mt-4"
                              >
                                Clear search
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-card border rounded-xl p-6">
                      <h3 className="font-semibold mb-2">Add Content</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Embed content from any platform
                      </p>
                      <EmbedUrlForm onAddUrl={handleAddUrl} />
                    </div>
                    
                    {embeddedContent.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {embeddedContent.map((item, index) => (
                          <EmbedContent
                            key={index}
                            item={item}
                            onRemove={() => handleRemoveEmbed(index)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                          <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No embedded content yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeView === "search" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Discover Creators</h2>
              <p className="text-muted-foreground">Find and follow your favorite creators</p>
            </div>
            <ChannelSearch
              onAddChannel={handleAddChannel}
              selectedChannelIds={selectedChannels.map(c => c.id)}
            />
          </div>
        )}

        {activeView === "saved" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Saved Content</h2>
              <p className="text-muted-foreground">Your bookmarked videos and posts</p>
            </div>
            <div className="bg-card border rounded-xl p-12 text-center">
              <p className="text-muted-foreground">Saved content feature coming soon</p>
            </div>
          </div>
        )}

        {activeView === "profile" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
              <p className="text-muted-foreground">Manage your preferences and following</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Following</h3>
                <SelectedChannels
                  channels={selectedChannels}
                  onRemoveChannel={handleRemoveChannel}
                />
              </div>
              
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="space-y-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    Manage Feed Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
