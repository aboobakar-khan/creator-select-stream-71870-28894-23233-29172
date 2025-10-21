import { YouTubeVideo } from "@/types/youtube";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  video: YouTubeVideo;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
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
    <Card className="overflow-hidden">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="p-4">
        <h2 className="font-bold text-xl mb-2">{video.title}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <span className="font-medium text-foreground">{video.channelTitle}</span>
          <span>•</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>
        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{video.description}</p>
        )}
      </div>
    </Card>
  );
}
