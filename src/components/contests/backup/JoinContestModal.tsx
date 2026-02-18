import { useState } from "react";
import { motion } from "framer-motion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trophy, TrendingUp, TrendingDown, Users, Eye, EyeOff, User, Bookmark, Check } from "lucide-react";
import { SelectedPick, SavedList } from "@/components/explore/ExplorePicks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlayerEntry {
  id: string;
  username: string;
  avatarUrl?: string;
  picks: SelectedPick[];
  isRevealed: boolean;
}

interface JoinContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (picks: SelectedPick[]) => void;
  contest: {
    id: string;
    predictions: number;
    entryFee: number;
    maxPlayers: number;
    currentPlayers: number;
    sport: string;
  };
  savedLists?: SavedList[];
  existingPlayers?: PlayerEntry[];
}

const formatPropType = (propType: string) => {
  const labels: Record<string, string> = {
    'points': 'Points',
    'pts_rebs_asts': 'PRA',
    'rebounds': 'Rebounds',
    'three_pt_made': '3PM',
    'assists': 'Assists',
    'pts_asts': 'Pts+Asts',
    'rebs_asts': 'Rebs+Asts'
  };
  return labels[propType] || propType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Mock player data for demonstration
const mockPlayers: PlayerEntry[] = [
  {
    id: 'player1',
    username: 'BetKing',
    picks: [
      {
        prop: {
          id: 'mock1',
          sport: 'Basketball',
          league: 'NBA',
          game_date: '2024-01-15',
          home_team: 'Lakers',
          away_team: 'Celtics',
          player_name: 'LeBron James',
          player_image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png',
          prop_type: 'points',
          line: 27.5,
          over_odds: -110,
          under_odds: -110
        },
        selection: 'over'
      },
      {
        prop: {
          id: 'mock2',
          sport: 'Basketball',
          league: 'NBA',
          game_date: '2024-01-15',
          home_team: 'Warriors',
          away_team: 'Suns',
          player_name: 'Stephen Curry',
          player_image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png',
          prop_type: 'three_pt_made',
          line: 4.5,
          over_odds: -105,
          under_odds: -115
        },
        selection: 'over'
      }
    ],
    isRevealed: true
  },
  {
    id: 'player2',
    username: 'HoopDreams',
    picks: [
      {
        prop: {
          id: 'mock3',
          sport: 'Basketball',
          league: 'NBA',
          game_date: '2024-01-15',
          home_team: 'Bucks',
          away_team: 'Heat',
          player_name: 'Giannis Antetokounmpo',
          player_image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png',
          prop_type: 'rebounds',
          line: 11.5,
          over_odds: -110,
          under_odds: -110
        },
        selection: 'under'
      },
      {
        prop: {
          id: 'mock4',
          sport: 'Basketball',
          league: 'NBA',
          game_date: '2024-01-15',
          home_team: 'Nuggets',
          away_team: 'Clippers',
          player_name: 'Nikola Jokic',
          player_image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png',
          prop_type: 'assists',
          line: 8.5,
          over_odds: -115,
          under_odds: -105
        },
        selection: 'over'
      }
    ],
    isRevealed: true
  }
];

export const JoinContestModal = ({ 
  isOpen, 
  onClose, 
  onJoin, 
  contest,
  savedLists = [],
  existingPlayers = mockPlayers
}: JoinContestModalProps) => {
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [revealedPlayers, setRevealedPlayers] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const selectedList = savedLists.find(l => l.id === selectedListId);
  const myPicks = selectedList?.picks || [];
  const canJoin = myPicks.length >= contest.predictions;

  const togglePlayerReveal = (playerId: string) => {
    setRevealedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-card border border-border shadow-elevated overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Join Challenge</h2>
              <p className="text-sm text-muted-foreground">
                {contest.predictions} Predictions • {contest.entryFee} Entry • {contest.sport}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Other Players' Picks */}
          <div className="flex-1 border-b lg:border-b-0 lg:border-r border-border overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  PLAYERS IN CHALLENGE ({existingPlayers.length}/{contest.maxPlayers})
                </h3>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {existingPlayers.map((player) => {
                  const isRevealed = revealedPlayers.has(player.id) || player.isRevealed;
                  return (
                    <div key={player.id} className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={player.avatarUrl} />
                            <AvatarFallback>
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{player.username}</p>
                            <p className="text-xs text-muted-foreground">{player.picks.length} picks</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePlayerReveal(player.id)}
                          className="gap-2"
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {isRevealed ? 'Hide' : 'View'}
                        </Button>
                      </div>
                      
                      {isRevealed && (
                        <div className="space-y-2">
                          {player.picks.map((pick) => (
                            <div key={pick.prop.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarImage src={pick.prop.player_image || ''} alt={pick.prop.player_name} />
                                <AvatarFallback className="text-[10px]">
                                  <User className="w-3 h-3" />
                                </AvatarFallback>
                              </Avatar>
                              <span className={pick.selection === 'over' ? 'text-green-500' : 'text-red-500'}>
                                {pick.selection === 'over' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{pick.prop.player_name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {pick.prop.away_team} @ {pick.prop.home_team} • {pick.selection === 'over' ? '>' : '<'} {pick.prop.line} {formatPropType(pick.prop.prop_type)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {existingPlayers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No other players yet</p>
                    <p className="text-sm">Be the first to join!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Your Picks Selection */}
          <div className="w-full lg:w-96 p-6 bg-secondary/30 flex flex-col shrink-0">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              SELECT YOUR PICKS
            </h3>

            <Select value={selectedListId} onValueChange={setSelectedListId}>
              <SelectTrigger className="w-full mb-4 bg-card">
                <SelectValue placeholder="Choose from your saved lists" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {savedLists.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No saved lists yet</p>
                    <p className="text-xs mt-1">Go to Explore to create one</p>
                  </div>
                ) : savedLists.filter(list => list.picks.length >= contest.predictions).length === 0 ? (
                  <div className="p-4 text-center text-amber-500">
                    <p className="text-sm">No lists with {contest.predictions}+ picks</p>
                    <p className="text-xs mt-1">Create a list with at least {contest.predictions} picks</p>
                  </div>
                ) : (
                  savedLists.filter(list => list.picks.length >= contest.predictions).map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name} ({list.picks.length} picks)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {selectedList ? (
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-2">
                  {selectedList.picks.map((pick, index) => (
                    <div key={pick.prop.id} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-semibold shrink-0">
                        {index + 1}
                      </span>
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={pick.prop.player_image || ''} alt={pick.prop.player_name} />
                        <AvatarFallback className="text-[10px]">
                          <User className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className={`shrink-0 ${pick.selection === 'over' ? 'text-green-500' : 'text-red-500'}`}>
                        {pick.selection === 'over' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{pick.prop.player_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {pick.prop.away_team} @ {pick.prop.home_team} • {pick.selection === 'over' ? '>' : '<'} {pick.prop.line} {formatPropType(pick.prop.prop_type)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <Bookmark className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a saved list above to see your picks
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-card border border-border mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Entry Fee</span>
                <span className="font-semibold">{contest.entryFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Players</span>
                <span className="font-semibold">{contest.currentPlayers}/{contest.maxPlayers}</span>
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full gap-2"
              disabled={!canJoin}
              onClick={() => onJoin(myPicks)}
            >
              {canJoin ? (
                <>
                  <Check className="w-4 h-4" />
                  Join Challenge - {contest.entryFee}
                </>
              ) : (
                `Select a list with ${contest.predictions}+ picks`
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
