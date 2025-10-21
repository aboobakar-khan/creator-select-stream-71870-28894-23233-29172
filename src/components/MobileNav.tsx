import { Home, Search, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  activeView: "feed" | "search" | "saved" | "profile";
  onViewChange: (view: "feed" | "search" | "saved" | "profile") => void;
}

export function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  const navItems = [
    { id: "feed" as const, icon: Home, label: "Feed" },
    { id: "search" as const, icon: Search, label: "Search" },
    { id: "saved" as const, icon: Bookmark, label: "Saved" },
    { id: "profile" as const, icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
