import { useState } from "react";
import { Card } from "@/components/ui/card";
import { YouTubeChannel } from "@/types/youtube";
import { Gamepad2, Cpu, ChefHat, Dumbbell, Music, Plane, GraduationCap, Laugh, Globe, Sparkles, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Niche {
  id: string;
  name: string;
  icon: React.ReactNode;
  channels: YouTubeChannel[];
}

interface NicheSelectorProps {
  onSelectNiche: (channels: YouTubeChannel[]) => void;
}

const niches: Niche[] = [
  {
    id: "gaming",
    name: "Gaming",
    icon: <Gamepad2 className="h-8 w-8" />,
    channels: [
      { id: "UCX6OQ3DkcsbYNE6H8uQQuVA", title: "MrBeast Gaming", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UC-lHJZR3Gqxm24_Vd_AJ5Yw", title: "PewDiePie", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCqJ-Xo29CKyLTjn6z2XwYAw", title: "jacksepticeye", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCFMHVq9Nf3kEX3MJDiKpQjA", title: "Jacksepticeye", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCpqXJOEqGS-TCnazcHCo0rA", title: "Techno Gamerz", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UC2D6kxMNDrBDg8vZ5SLnfLA", title: "Total Gaming", thumbnail: "", subscriberCount: "", description: "" },
    ]
  },
  {
    id: "tech",
    name: "Tech",
    icon: <Cpu className="h-8 w-8" />,
    channels: [
      { id: "UCBJycsmduvYEL83R_U4JriQ", title: "Marques Brownlee", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCXuqSBlHAE6Xw-yeJA0Tunw", title: "Linus Tech Tips", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCBuL6PooveJP6nb9toV0fVA", title: "Unbox Therapy", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCdBK94H6oZT2Q7l0-b0xmMg", title: "Tech Burner", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCrBzBOMcUVV8ryyAU_c6P5g", title: "Technical Guruji", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UC_A7K2dXFsTMAciGnNRF3Iw", title: "Mrwhosetheboss", thumbnail: "", subscriberCount: "", description: "" },
    ]
  },
  {
    id: "cooking",
    name: "Cooking",
    icon: <ChefHat className="h-8 w-8" />,
    channels: [
      { id: "UCbpMy0Fg74eXXkvxJrtEn3w", title: "Tasty", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCJHA_jMfCvEnv-3kRjTCQXw", title: "Binging with Babish", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCekQr9znsk2vWxBo3YiLq2w", title: "Gordon Ramsay", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCIydZHk4qlLcd3LMhHGvXjQ", title: "Kabita's Kitchen", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCLz7LN5kd2YNkLcbmN8a3KQ", title: "Nisha Madhulika", thumbnail: "", subscriberCount: "", description: "" },
    ]
  },
  {
    id: "fitness",
    name: "Fitness",
    icon: <Dumbbell className="h-8 w-8" />,
    channels: [
      { id: "UC0CRYvGlWGlsGxBNgvkUbAg", title: "ATHLEAN-X", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UC2bj5Fv2z_RA3p8i6x2C7jw", title: "Chloe Ting", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCe0TLA0EsQbE-MjuHXevj2A", title: "THENX", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCg_ptb-vJEikp8To-AiLFdw", title: "Fit Tuber", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UClwzQ6dgsgmHZJxG3C1GBCg", title: "Beer Biceps", thumbnail: "", subscriberCount: "", description: "" },
    ]
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: <Sparkles className="h-8 w-8" />,
    channels: [
      { id: "UCq-Fj5jknLsUf-MWSy4_brA", title: "T-Series", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UC_vcKmg67vjMP7ciLnSxSHQ", title: "SET India", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCkBY0aHJP9BwjZLMoTbV8xQ", title: "Harsh Beniwal", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCqwUrj10mAEsqezcItqvwEw", title: "CarryMinati", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCFmti-1FtHaWb4HRrBh2kyg", title: "Ashish Chanchlani", thumbnail: "", subscriberCount: "", description: "" },
    ]
  },
  {
    id: "education",
    name: "Education",
    icon: <GraduationCap className="h-8 w-8" />,
    channels: [
      { id: "UCX6b17PVsYBQ0ip5gyeme-Q", title: "CrashCourse", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UC6nSFpj9HTCZ5t-N3Rm3-HA", title: "Vsauce", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCHnyfMqiRRG1u-2MsSQLbXA", title: "Veritasium", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCBwmMxybNva6P_5VmxjzwqA", title: "Physics Wallah", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCMZYbgBvudH9qZ2X1Y8FPXw", title: "Khan Academy India", thumbnail: "", subscriberCount: "", description: "" },
    ]
  },
  {
    id: "indian",
    name: "Indian Creators",
    icon: <Globe className="h-8 w-8" />,
    channels: [
      { id: "UCqwUrj10mAEsqezcItqvwEw", title: "CarryMinati", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UC_vcKmg67vjMP7ciLnSxSHQ", title: "SET India", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCrBzBOMcUVV8ryyAU_c6P5g", title: "Technical Guruji", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCBwmMxybNva6P_5VmxjzwqA", title: "Physics Wallah", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCkBY0aHJP9BwjZLMoTbV8xQ", title: "Harsh Beniwal", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCFmti-1FtHaWb4HRrBh2kyg", title: "Ashish Chanchlani", thumbnail: "", subscriberCount: "", description: "" },
    ]
  },
  {
    id: "informative",
    name: "Informative",
    icon: <Laugh className="h-8 w-8" />,
    channels: [
      { id: "UC6nSFpj9HTCZ5t-N3Rm3-HA", title: "Vsauce", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCHnyfMqiRRG1u-2MsSQLbXA", title: "Veritasium", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCsooa4yRKGN_zEE8iknghZA", title: "TED-Ed", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UC4QZ_LsYcvcq7qOsOhpAX4A", title: "Dhruv Rathee", thumbnail: "", subscriberCount: "", description: "" },
      { id: "UCRkGS3GN1b3Dck56vqcIhRg", title: "Soch by Mohak Mangal", thumbnail: "", subscriberCount: "", description: "" },
    ]
  },
];

export function NicheSelector({ onSelectNiche }: NicheSelectorProps) {
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [selectedChannelIds, setSelectedChannelIds] = useState<Set<string>>(new Set());

  const handleNicheClick = (niche: Niche) => {
    setSelectedNiche(niche);
    setSelectedChannelIds(new Set(niche.channels.map(c => c.id)));
  };

  const toggleChannel = (channelId: string) => {
    const newSet = new Set(selectedChannelIds);
    if (newSet.has(channelId)) {
      newSet.delete(channelId);
    } else {
      newSet.add(channelId);
    }
    setSelectedChannelIds(newSet);
  };

  const handleAddSelected = () => {
    if (selectedNiche) {
      const channelsToAdd = selectedNiche.channels.filter(c => 
        selectedChannelIds.has(c.id)
      );
      onSelectNiche(channelsToAdd);
      setSelectedNiche(null);
      setSelectedChannelIds(new Set());
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Explore Popular Niches</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {niches.map((niche) => (
            <Card
              key={niche.id}
              className="p-6 cursor-pointer hover:bg-accent transition-colors text-center"
              onClick={() => handleNicheClick(niche)}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="text-primary">{niche.icon}</div>
                <p className="font-medium">{niche.name}</p>
                <p className="text-xs text-muted-foreground">{niche.channels.length} creators</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedNiche} onOpenChange={() => setSelectedNiche(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNiche?.icon}
              {selectedNiche?.name} Creators
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Select the creators you want to follow
            </p>
            
            <div className="space-y-2">
              {selectedNiche?.channels.map((channel) => (
                <Card
                  key={channel.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedChannelIds.has(channel.id) 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => toggleChannel(channel.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{channel.title[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{channel.title}</p>
                      </div>
                    </div>
                    {selectedChannelIds.has(channel.id) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAddSelected}
                disabled={selectedChannelIds.size === 0}
                className="flex-1"
              >
                Add {selectedChannelIds.size} Creator{selectedChannelIds.size !== 1 ? 's' : ''}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedNiche(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
