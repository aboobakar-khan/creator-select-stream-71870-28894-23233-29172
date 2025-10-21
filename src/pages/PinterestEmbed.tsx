import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { EmbedUrlForm } from "@/components/EmbedUrlForm";
import { EmbedContent } from "@/components/EmbedContent";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { parseUrlForEmbed, ParsedUrl } from "@/lib/embedUtils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PinterestEmbed } from "react-social-media-embed";

const PinterestEmbedPage = () => {
  const navigate = useNavigate();
  const [embeddedContent, setEmbeddedContent] = useLocalStorage<ParsedUrl[]>("pinterestContent", []);
  const [selectedPin, setSelectedPin] = useState<ParsedUrl | null>(null);

  const handleAddUrl = (url: string) => {
    const parsed = parseUrlForEmbed(url);
    
    if (parsed.platform !== 'pinterest') {
      toast.error("Please enter a valid Pinterest URL");
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
              <svg 
                className="h-8 w-8 text-primary" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.104-2.073-.301.284-.461.696-1.225.851-1.803.093-.349.465-1.804.465-1.804.253.465 1.018.877 1.816.877 2.392 0 4.088-2.217 4.088-5.073 0-2.669-2.205-4.673-5.003-4.673-3.528 0-5.394 2.411-5.394 4.988 0 1.205.635 2.719 1.645 3.197.155.074.237.041.273-.113l.262-1.052c.032-.126.02-.235-.087-.359-.266-.308-.465-.872-.465-1.401 0-1.362 1.03-2.673 2.796-2.673 1.522 0 2.591 1.025 2.591 2.486 0 1.635-.822 2.779-1.885 2.779-.598 0-1.043-.487-0.899-1.084.174-.716.512-1.487.512-2.005 0-.463-.252-.849-.772-.849-.611 0-1.104.625-1.104 1.462 0 .533.181.893.181.893l-.729 3.025c-.182.756-.072 1.85-.017 2.562C5.704 18.124 4 15.342 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
              </svg>
              <h1 className="text-2xl font-bold">Pinterest Feed</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Add Pinterest Content</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Paste Pinterest pin URLs to view them here
            </p>
            <EmbedUrlForm onAddUrl={handleAddUrl} />
          </div>
          
          {embeddedContent.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {embeddedContent.map((item, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer"
                  onClick={() => setSelectedPin(item)}
                >
                  <EmbedContent
                    item={item}
                    onRemove={() => handleRemoveEmbed(index)}
                  />
                </div>
              ))}
            </div>
          )}

          <Dialog open={selectedPin !== null} onOpenChange={(open) => !open && setSelectedPin(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Pinterest Pin</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPin(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              {selectedPin && (
                <div className="flex justify-center w-full">
                  <PinterestEmbed 
                    url={selectedPin.originalUrl} 
                    width="100%"
                    height={600}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {embeddedContent.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg 
                  className="h-12 w-12 text-muted-foreground mx-auto mb-4" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.104-2.073-.301.284-.461.696-1.225.851-1.803.093-.349.465-1.804.465-1.804.253.465 1.018.877 1.816.877 2.392 0 4.088-2.217 4.088-5.073 0-2.669-2.205-4.673-5.003-4.673-3.528 0-5.394 2.411-5.394 4.988 0 1.205.635 2.719 1.645 3.197.155.074.237.041.273-.113l.262-1.052c.032-.126.02-.235-.087-.359-.266-.308-.465-.872-.465-1.401 0-1.362 1.03-2.673 2.796-2.673 1.522 0 2.591 1.025 2.591 2.486 0 1.635-.822 2.779-1.885 2.779-.598 0-1.043-.487-0.899-1.084.174-.716.512-1.487.512-2.005 0-.463-.252-.849-.772-.849-.611 0-1.104.625-1.104 1.462 0 .533.181.893.181.893l-.729 3.025c-.182.756-.072 1.85-.017 2.562C5.704 18.124 4 15.342 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
                </svg>
                <p className="text-muted-foreground">No Pinterest content yet. Add your first URL above!</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PinterestEmbedPage;
