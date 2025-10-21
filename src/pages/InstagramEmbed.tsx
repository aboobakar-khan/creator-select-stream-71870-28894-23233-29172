import { useState } from "react";
import { Instagram, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { EmbedUrlForm } from "@/components/EmbedUrlForm";
import { EmbedContent } from "@/components/EmbedContent";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { parseUrlForEmbed, ParsedUrl } from "@/lib/embedUtils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InstagramEmbed as InstagramEmbedComponent } from "react-social-media-embed";

const InstagramEmbed = () => {
  const navigate = useNavigate();
  const [embeddedContent, setEmbeddedContent] = useLocalStorage<ParsedUrl[]>("instagramContent", []);
  const [selectedPost, setSelectedPost] = useState<ParsedUrl | null>(null);

  const handleAddUrl = (url: string) => {
    const parsed = parseUrlForEmbed(url);
    
    if (parsed.platform !== 'instagram') {
      toast.error("Please enter a valid Instagram URL");
      return;
    }
    
    setEmbeddedContent([parsed, ...embeddedContent]);
  };

  const handleRemoveEmbed = (index: number) => {
    setEmbeddedContent(embeddedContent.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Instagram className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Instagram Feed</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Add Instagram Content</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Paste Instagram post or reel URLs to view them here
            </p>
            <EmbedUrlForm onAddUrl={handleAddUrl} />
          </div>
          
          {embeddedContent.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {embeddedContent.map((item, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer"
                  onClick={() => setSelectedPost(item)}
                >
                  <EmbedContent
                    item={item}
                    onRemove={() => handleRemoveEmbed(index)}
                  />
                </div>
              ))}
            </div>
          )}

          <Dialog open={selectedPost !== null} onOpenChange={(open) => !open && setSelectedPost(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Instagram Post</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPost(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              {selectedPost && (
                <div className="flex justify-center w-full">
                  <InstagramEmbedComponent 
                    url={selectedPost.originalUrl} 
                    width="100%"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {embeddedContent.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Instagram className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No Instagram content yet. Add your first URL above!</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstagramEmbed;
