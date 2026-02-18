import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SlidersHorizontal } from "lucide-react";

interface Game {
  home_team: string;
  away_team: string;
  game_date: string;
}

interface GameFilterProps {
  games: Game[];
  selectedGames: string[];
  onSelectionChange: (games: string[]) => void;
}

// Team color mapping for the accent bar
const TEAM_COLORS: Record<string, string> = {
  'LAL': '#552583',
  'GSW': '#FFC72C',
  'BOS': '#007A33',
  'MIA': '#98002E',
  'CHI': '#CE1141',
  'NYK': '#F58426',
  'BKN': '#000000',
  'PHI': '#006BB6',
  'ATL': '#E03A3E',
  'CLE': '#860038',
  'MIL': '#00471B',
  'PHX': '#E56020',
  'DAL': '#00538C',
  'DEN': '#0E2240',
  'MIN': '#0C2340',
  'NOP': '#0C2340',
  'SAC': '#5A2D81',
  'POR': '#E03A3E',
  'IND': '#002D62',
  'WAS': '#002B5C',
  'CHA': '#1D1160',
  'ORL': '#0077C0',
  'DET': '#C8102E',
  'TOR': '#CE1141',
  'OKC': '#007AC1',
  'UTA': '#002B5C',
  'MEM': '#5D76A9',
  'HOU': '#CE1141',
  'SAS': '#C4CED4',
  'LAC': '#C8102E',
};

const getTeamColor = (team: string) => {
  return TEAM_COLORS[team] || '#6B7280';
};

const formatGameTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase();
};

export const GameFilter = ({ games, selectedGames, onSelectionChange }: GameFilterProps) => {
  const [open, setOpen] = useState(false);
  const [tempSelection, setTempSelection] = useState<string[]>(selectedGames);

  // Get unique games
  const uniqueGames = useMemo(() => {
    const seen = new Set<string>();
    return games.filter(game => {
      const key = `${game.home_team}-${game.away_team}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [games]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setTempSelection(selectedGames);
    }
    setOpen(isOpen);
  };

  const toggleGame = (gameKey: string) => {
    setTempSelection(prev => 
      prev.includes(gameKey) 
        ? prev.filter(g => g !== gameKey)
        : [...prev, gameKey]
    );
  };

  const selectAll = () => {
    setTempSelection(uniqueGames.map(g => `${g.home_team}-${g.away_team}`));
  };

  const reset = () => {
    setTempSelection([]);
  };

  const apply = () => {
    onSelectionChange(tempSelection);
    setOpen(false);
  };

  const isSelected = (gameKey: string) => tempSelection.includes(gameKey);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 rounded-full border-border bg-secondary/50 hover:bg-secondary"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Games
          {selectedGames.length > 0 && selectedGames.length < uniqueGames.length && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {selectedGames.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">NBA games</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Upcoming games</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={selectAll}
              className="rounded-full text-xs"
            >
              Select All
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {uniqueGames.map((game) => {
              const gameKey = `${game.home_team}-${game.away_team}`;
              const selected = isSelected(gameKey);
              
              return (
                <button
                  key={gameKey}
                  onClick={() => toggleGame(gameKey)}
                  className={`relative flex flex-col p-3 rounded-lg border transition-all text-left ${
                    selected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  {/* Team color accent bars */}
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full flex flex-col gap-1 overflow-hidden">
                    <div 
                      className="flex-1 rounded-t-full" 
                      style={{ backgroundColor: getTeamColor(game.away_team) }}
                    />
                    <div 
                      className="flex-1 rounded-b-full" 
                      style={{ backgroundColor: getTeamColor(game.home_team) }}
                    />
                  </div>
                  
                  <div className="pl-2">
                    <p className="font-semibold text-foreground text-sm">{game.away_team}</p>
                    <p className="font-semibold text-foreground text-sm">{game.home_team}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatGameTime(game.game_date)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="secondary" 
            className="flex-1 rounded-full"
            onClick={reset}
          >
            Reset
          </Button>
          <Button 
            variant="default"
            className="flex-1 rounded-full"
            onClick={apply}
            disabled={tempSelection.length === 0}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
