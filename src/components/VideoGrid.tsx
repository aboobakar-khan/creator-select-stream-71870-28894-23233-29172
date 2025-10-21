import { YouTubeVideo } from "@/types/youtube";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { useState } from "react";

interface VideoGridProps {
  videos: YouTubeVideo[];
  onVideoClick?: (video: YouTubeVideo) => void;
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  if (videos.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">No videos to display. Add some creators to get started!</p>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="group text-left"
          onMouseEnter={() => setHoveredVideoId(video.id)}
          onMouseLeave={() => setHoveredVideoId(null)}
        >
            <Card 
              className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              onClick={() => onVideoClick?.(video)}
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {hoveredVideoId === video.id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
                    title={video.title}
                    allow="autoplay"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="bg-primary/90 rounded-full p-4 transform group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-primary-foreground fill-current" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{video.channelTitle}</span>
                  <span>•</span>
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
              </div>
            </Card>
        </div>
      ))}
    </div>
  );
}
