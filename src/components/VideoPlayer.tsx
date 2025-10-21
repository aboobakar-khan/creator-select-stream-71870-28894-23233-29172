import { YouTubeVideo } from "@/types/youtube";
import { Card } from "@/components/ui/card";
import { X, Calendar, User, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <Card className="overflow-hidden shadow-xl border-0 bg-card">
      <div className="relative bg-black">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white border-0 rounded-full h-10 w-10 backdrop-blur-sm transition-all hover:scale-105"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&modestbranding=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h2 className="font-bold text-2xl mb-3 leading-tight">{video.title}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <User className="h-3.5 w-3.5" />
              {video.channelTitle}
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(video.publishedAt)}
            </Badge>
          </div>
        </div>
        {video.description && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {video.description}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
