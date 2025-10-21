import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";
import { ParsedUrl } from "@/lib/embedUtils";
import { InstagramEmbed, PinterestEmbed } from "react-social-media-embed";

interface EmbedContentProps {
  item: ParsedUrl;
  onRemove: () => void;
}

export function EmbedContent({ item, onRemove }: EmbedContentProps) {
  const renderEmbed = () => {
    switch (item.platform) {
      case 'instagram':
        return (
          <div className="flex justify-center w-full p-4">
            <InstagramEmbed 
              url={item.originalUrl} 
              width="100%"
            />
          </div>
        );
      
      case 'youtube':
      case 'vimeo':
        return (
          <div className="aspect-video">
            <iframe
              src={item.embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      
      case 'tiktok':
        return (
          <div className="flex items-center justify-center p-8">
            <a 
              href={item.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              View on TikTok <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        );
      
      case 'twitter':
        return (
          <div className="flex items-center justify-center p-8">
            <a 
              href={item.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              View on Twitter <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        );
      
      case 'pinterest':
        return (
          <div className="flex justify-center w-full p-4">
            <PinterestEmbed 
              url={item.originalUrl} 
              width="100%"
              height={500}
            />
          </div>
        );
      
      default:
        return (
          <div className="aspect-video">
            <iframe
              src={item.embedUrl}
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        );
    }
  };

  return (
    <Card className="overflow-hidden relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
      {renderEmbed()}
      <div className="p-3 border-t">
        <p className="text-xs text-muted-foreground capitalize">
          {item.platform} content
        </p>
      </div>
    </Card>
  );
}
