import { YouTubeVideo } from "@/types/youtube";
import { Card } from "@/components/ui/card";
import { Play, Clock } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface VideoGridProps {
  videos: YouTubeVideo[];
  onVideoClick?: (video: YouTubeVideo) => void;
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  if (videos.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <div
          key={video.id}
          className="group text-left"
          onMouseEnter={() => setHoveredVideoId(video.id)}
          onMouseLeave={() => setHoveredVideoId(null)}
        >
          <Card 
            className="overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-card"
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
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-primary rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                      <Play className="h-6 w-6 text-primary-foreground fill-current" />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-foreground/80">{video.channelTitle}</p>
                <Badge variant="outline" className="w-fit gap-1.5 px-2 py-0.5 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatDate(video.publishedAt)}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
