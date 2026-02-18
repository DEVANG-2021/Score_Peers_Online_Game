import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Check, AlertCircle } from "lucide-react";

interface Pick {
  id: string;
  game: string;
  team: string;
  type: string;
  odds: string;
  sport: string;
}

interface AvailableGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  startTime: string;
  picks: {
    id: string;
    team: string;
    type: string;
    odds: string;
  }[];
}

const mockGames: AvailableGame[] = [
  {
    id: 'g1',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    sport: 'NFL',
    startTime: 'Today, 8:20 PM',
    picks: [
      { id: 'p1', team: 'Chiefs', type: 'Spread -3.5', odds: '-110' },
      { id: 'p2', team: 'Bills', type: 'Spread +3.5', odds: '-110' },
      { id: 'p3', team: 'Over', type: '47.5 Total', odds: '-105' },
      { id: 'p4', team: 'Under', type: '47.5 Total', odds: '-115' },
    ],
  },
  {
    id: 'g2',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    sport: 'NBA',
    startTime: 'Tomorrow, 7:30 PM',
    picks: [
      { id: 'p5', team: 'Lakers', type: 'Moneyline', odds: '+145' },
      { id: 'p6', team: 'Celtics', type: 'Moneyline', odds: '-165' },
      { id: 'p7', team: 'Over', type: '228.5 Total', odds: '-110' },
      { id: 'p8', team: 'Under', type: '228.5 Total', odds: '-110' },
    ],
  },
  {
    id: 'g3',
    homeTeam: 'New York Rangers',
    awayTeam: 'Toronto Maple Leafs',
    sport: 'NHL',
    startTime: 'Tomorrow, 7:00 PM',
    picks: [
      { id: 'p9', team: 'Rangers', type: 'Puckline -1.5', odds: '+155' },
      { id: 'p10', team: 'Maple Leafs', type: 'Puckline +1.5', odds: '-175' },
    ],
  },
];

interface ParlayBuilderProps {
  requiredLegs: number;
  onSubmit?: (picks: Pick[]) => void;
  onClose?: () => void;
}

export const ParlayBuilder = ({ requiredLegs = 3, onSubmit, onClose }: ParlayBuilderProps) => {
  const [selectedPicks, setSelectedPicks] = useState<Pick[]>([]);

  const handleAddPick = (game: AvailableGame, pick: typeof game.picks[0]) => {
    if (selectedPicks.length >= requiredLegs) return;
    if (selectedPicks.find(p => p.id === pick.id)) return;
    
    // Remove any existing pick from the same game
    const filtered = selectedPicks.filter(p => 
      !mockGames.find(g => g.id === game.id)?.picks.some(gp => gp.id === p.id)
    );
    
    setSelectedPicks([...filtered, {
      id: pick.id,
      game: `${game.awayTeam} @ ${game.homeTeam}`,
      team: pick.team,
      type: pick.type,
      odds: pick.odds,
      sport: game.sport,
    }]);
  };

  const handleRemovePick = (pickId: string) => {
    setSelectedPicks(selectedPicks.filter(p => p.id !== pickId));
  };

  const isPickSelected = (pickId: string) => selectedPicks.some(p => p.id === pickId);
  const isComplete = selectedPicks.length === requiredLegs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-card border border-border shadow-elevated"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Build Your Prediction Challenge
            </h2>
            <p className="text-muted-foreground">
              Select {requiredLegs} picks to complete your entry
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-180px)]">
          {/* Games List */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">AVAILABLE GAMES</h3>
            <div className="space-y-4">
              {mockGames.map((game) => (
                <Card key={game.id} variant="glass" className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {game.awayTeam} @ {game.homeTeam}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {game.sport}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{game.startTime}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      {game.picks.map((pick) => (
                        <Button
                          key={pick.id}
                          variant={isPickSelected(pick.id) ? "default" : "outline"}
                          size="sm"
                          className="justify-between text-xs h-auto py-2"
                          onClick={() => handleAddPick(game, pick)}
                          disabled={selectedPicks.length >= requiredLegs && !isPickSelected(pick.id)}
                        >
                          <span className="truncate">{pick.team} {pick.type}</span>
                          <span className={isPickSelected(pick.id) ? "text-primary-foreground" : "text-primary"}>
                            {pick.odds}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Picks */}
          <div className="w-full lg:w-80 p-6 bg-secondary/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">YOUR PICKS</h3>
              <Badge variant={isComplete ? "default" : "outline"} className="gap-1">
                {isComplete ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {selectedPicks.length}/{requiredLegs}
              </Badge>
            </div>

            <div className="space-y-2 mb-6">
              <AnimatePresence mode="popLayout">
                {selectedPicks.map((pick, index) => (
                  <motion.div
                    key={pick.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-semibold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm text-foreground truncate">
                          {pick.team}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate pl-7">
                        {pick.type} • {pick.odds}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleRemovePick(pick.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty Slots */}
              {Array.from({ length: requiredLegs - selectedPicks.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border/50"
                >
                  <span className="w-5 h-5 rounded-full bg-secondary text-muted-foreground text-xs flex items-center justify-center">
                    {selectedPicks.length + index + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">Select a pick</span>
                </div>
              ))}
            </div>

            <Button
              variant="hero"
              className="w-full"
              disabled={!isComplete}
              onClick={() => onSubmit?.(selectedPicks)}
            >
              {isComplete ? 'Submit Prediction Challenge' : `Select ${requiredLegs - selectedPicks.length} More`}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
