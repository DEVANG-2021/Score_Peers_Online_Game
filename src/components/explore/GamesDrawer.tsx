import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { ChevronUp } from "lucide-react";

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  homeColor: string;
  awayColor: string;
}

interface GamesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sport: string;
  onApply: (selectedGames: string[]) => void;
}

// Mock games data - in real app, this would come from the database
const MOCK_GAMES: Game[] = [
  { id: "1", homeTeam: "IND", awayTeam: "WAS", time: "2:00 pm", homeColor: "bg-yellow-500", awayColor: "bg-red-500" },
  { id: "2", homeTeam: "BKN", awayTeam: "MIL", time: "5:00 pm", homeColor: "bg-yellow-500", awayColor: "bg-green-500" },
  { id: "3", homeTeam: "CHI", awayTeam: "NOP", time: "6:00 pm", homeColor: "bg-red-500", awayColor: "bg-cyan-500" },
  { id: "4", homeTeam: "PHX", awayTeam: "LAL", time: "7:00 pm", homeColor: "bg-orange-500", awayColor: "bg-purple-500" },
  { id: "5", homeTeam: "CLE", awayTeam: "CHA", time: "2:30 pm", homeColor: "bg-yellow-500", awayColor: "bg-cyan-500" },
  { id: "6", homeTeam: "ATL", awayTeam: "PHI", time: "5:00 pm", homeColor: "bg-red-500", awayColor: "bg-blue-500" },
  { id: "7", homeTeam: "MIN", awayTeam: "SAC", time: "6:00 pm", homeColor: "bg-green-500", awayColor: "bg-purple-500" },
  { id: "8", homeTeam: "POR", awayTeam: "GSW", time: "8:00 pm", homeColor: "bg-red-500", awayColor: "bg-yellow-500" },
];

export const GamesDrawer = ({ open, onOpenChange, sport, onApply }: GamesDrawerProps) => {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  const handleToggleGame = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGames.length === MOCK_GAMES.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(MOCK_GAMES.map(g => g.id));
    }
  };

  const handleReset = () => {
    setSelectedGames([]);
  };

  const handleApply = () => {
    onApply(selectedGames);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4" />
        
        <DrawerHeader className="px-6 pb-2">
          <DrawerTitle className="text-xl font-bold text-foreground">
            {sport} games
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Upcoming games</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAll}
              className="text-foreground hover:bg-secondary"
            >
              {selectedGames.length === MOCK_GAMES.length ? 'Deselect All' : 'Select All'}
              <ChevronUp className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOCK_GAMES.map(game => (
              <button
                key={game.id}
                onClick={() => handleToggleGame(game.id)}
                className={`p-3 rounded-lg border transition-all text-left ${
                  selectedGames.includes(game.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary/30 hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1 h-4 rounded-full ${game.homeColor}`} />
                  <span className="font-semibold text-foreground text-sm">{game.homeTeam}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-1 h-4 rounded-full ${game.awayColor}`} />
                  <span className="font-semibold text-foreground text-sm">{game.awayTeam}</span>
                </div>
                <span className="text-xs text-muted-foreground">{game.time}</span>
              </button>
            ))}
          </div>
        </div>

        <DrawerFooter className="px-6 pt-4 border-t border-border">
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              className="flex-1 border-border text-foreground hover:bg-secondary"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button 
              variant="default"
              className="flex-1"
              onClick={handleApply}
              disabled={selectedGames.length === 0}
            >
              Apply
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
