import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { YouTubeChannel } from "@/types/youtube";
import { toast } from "sonner";

interface SelectedChannelsProps {
  channels: YouTubeChannel[];
  onRemoveChannel: (channelId: string) => void;
}

export function SelectedChannels({ channels, onRemoveChannel }: SelectedChannelsProps) {
  if (channels.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No creators selected yet. Search and add creators to start!</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-2">
      {channels.map((channel) => (
        <Card key={channel.id} className="p-3">
          <div className="flex items-center gap-3">
            <img
              src={channel.thumbnail}
              alt={channel.title}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{channel.title}</h3>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                onRemoveChannel(channel.id);
                toast.success(`Removed ${channel.title}`);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
