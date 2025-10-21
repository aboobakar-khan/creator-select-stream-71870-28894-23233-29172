import { Home, Search, Bookmark, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DesktopNavProps {
  activeView: "feed" | "search" | "saved" | "profile";
  onViewChange: (view: "feed" | "search" | "saved" | "profile") => void;
  onSettingsClick: () => void;
}

export function DesktopNav({ activeView, onViewChange, onSettingsClick }: DesktopNavProps) {
  const navItems = [
    { id: "feed" as const, icon: Home, label: "Feed" },
    { id: "search" as const, icon: Search, label: "Search" },
    { id: "saved" as const, icon: Bookmark, label: "Saved" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <span className="text-white font-bold text-lg">CF</span>
            </div>
            <h1 className="text-xl font-bold hidden sm:block">Creator Feed</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium text-sm",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onSettingsClick}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </div>
    </header>
  );
}
