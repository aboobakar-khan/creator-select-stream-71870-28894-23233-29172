import { useState, useEffect, useRef, useCallback } from "react";
import { Youtube, Settings2, Link2, Instagram as InstagramIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelSearch } from "@/components/ChannelSearch";
import { SelectedChannels } from "@/components/SelectedChannels";
import { VideoGrid } from "@/components/VideoGrid";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EmbedUrlForm } from "@/components/EmbedUrlForm";
import { EmbedContent } from "@/components/EmbedContent";
import { InstagramEmbed } from "@/components/InstagramEmbed";
import { NicheSelector } from "@/components/NicheSelector";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getMultipleChannelsVideos } from "@/lib/youtube";
import { YouTubeChannel, YouTubeVideo } from "@/types/youtube";
import { parseUrlForEmbed, ParsedUrl } from "@/lib/embedUtils";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"youtube" | "embed" | "instagram">("youtube");
  const [selectedChannels, setSelectedChannels] = useLocalStorage<YouTubeChannel[]>("selectedChannels", []);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageTokens, setPageTokens] = useState<Record<string, string>>({});
  const [hasMore, setHasMore] = useState(false);
  const [embeddedContent, setEmbeddedContent] = useLocalStorage<ParsedUrl[]>("embeddedContent", []);
  const observerTarget = useRef<HTMLDivElement>(null);

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
    if (!isLoading && hasMore) {
      loadVideos(false);
    }
  }, [isLoading, hasMore, pageTokens]);

  useEffect(() => {
    loadVideos(true);
  }, [selectedChannels]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
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
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Youtube className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Creator Feed</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab("instagram")}
              >
                <InstagramIcon className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/pinterest')}
              >
                <svg 
                  className="h-4 w-4 mr-2" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.104-2.073-.301.284-.461.696-1.225.851-1.803.093-.349.465-1.804.465-1.804.253.465 1.018.877 1.816.877 2.392 0 4.088-2.217 4.088-5.073 0-2.669-2.205-4.673-5.003-4.673-3.528 0-5.394 2.411-5.394 4.988 0 1.205.635 2.719 1.645 3.197.155.074.237.041.273-.113l.262-1.052c.032-.126.02-.235-.087-.359-.266-.308-.465-.872-.465-1.401 0-1.362 1.03-2.673 2.796-2.673 1.522 0 2.591 1.025 2.591 2.486 0 1.635-.822 2.779-1.885 2.779-.598 0-1.043-.487-0.899-1.084.174-.716.512-1.487.512-2.005 0-.463-.252-.849-.772-.849-.611 0-1.104.625-1.104 1.462 0 .533.181.893.181.893l-.729 3.025c-.182.756-.072 1.85-.017 2.562C5.704 18.124 4 15.342 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
                </svg>
                Pinterest
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Manage Creators
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Manage Your Creators</SheetTitle>
                </SheetHeader>
                
                <Tabs defaultValue="search" className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="search">Search</TabsTrigger>
                    <TabsTrigger value="selected">
                      Selected ({selectedChannels.length})
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
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "youtube" | "embed" | "instagram")} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="youtube" className="gap-2">
                <Youtube className="h-4 w-4" />
                YouTube Feed
              </TabsTrigger>
              <TabsTrigger value="instagram" className="gap-2">
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="embed" className="gap-2">
                <Link2 className="h-4 w-4" />
                Embed Content
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === "youtube" ? (
          <>
            {selectedChannels.length === 0 && (
              <NicheSelector onSelectNiche={handleSelectNiche} />
            )}
            
            {videos.length === 0 && isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading videos...</p>
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
                
                <div className={selectedVideo ? "mt-8" : ""}>
                  <h2 className="text-xl font-semibold mb-4">
                    {selectedVideo ? "More Videos" : "All Videos"}
                  </h2>
                  <VideoGrid 
                    videos={videos} 
                    onVideoClick={setSelectedVideo}
                  />
                </div>
                
                {hasMore && (
                  <div ref={observerTarget} className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading more videos...</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : activeTab === "instagram" ? (
          <InstagramEmbed />
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Embed Content from Any Platform</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Paste URLs from Instagram, Pinterest, TikTok, Twitter, YouTube, Vimeo, and more
              </p>
              <EmbedUrlForm onAddUrl={handleAddUrl} />
            </div>
            
            {embeddedContent.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {embeddedContent.map((item, index) => (
                  <EmbedContent
                    key={index}
                    item={item}
                    onRemove={() => handleRemoveEmbed(index)}
                  />
                ))}
              </div>
            )}
            
            {embeddedContent.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No content yet. Add your first URL above!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
