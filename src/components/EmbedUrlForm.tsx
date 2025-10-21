import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface EmbedUrlFormProps {
  onAddUrl: (url: string) => void;
}

export function EmbedUrlForm({ onAddUrl }: EmbedUrlFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    
    try {
      new URL(url);
      onAddUrl(url.trim());
      setUrl("");
      toast.success("Content added!");
    } catch (error) {
      toast.error("Please enter a valid URL");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="url"
        placeholder="Paste URL from Instagram, Pinterest, TikTok, Twitter, etc."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
