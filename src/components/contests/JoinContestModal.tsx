import { useState,useEffect } from "react";
import { motion } from "framer-motion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trophy, TrendingUp, TrendingDown, Users, Eye, EyeOff, User, Bookmark, Check } from "lucide-react";
import { SelectedPick, SavedList } from "@/components/explore/ExplorePicks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useCurrency } from "./../../contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();
  }, []);
  if (!isOpen) return null;
  const { currencyType } = useCurrency();
  const selectedList = savedLists.find(l => l.list_name === selectedListId);
  const myPicks = selectedList?.picks || [];
  const canJoin = selectedList && selectedList.picks.length === contest.predictions;
  const validLists = savedLists.filter(list => list.picks.length === contest.predictions);  
  const [processingFees, setProcessingFees] = useState<{
    sp_cash: Record<number, number>;
    sp_coins: Record<number, number>;
  }>({
    sp_cash: {},
    sp_coins: {}
  });

  const [loadingFees, setLoadingFees] = useState(false);

  // Add this useEffect to fetch platform settings
  useEffect(() => {
    const fetchProcessingFees = async () => {
      setLoadingFees(true);
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('currency_type, entry_amount, processing_fee')
          .order('currency_type')
          .order('entry_amount');

        if (error) throw error;

        const fees: { sp_cash: Record<number, number>; sp_coins: Record<number, number> } = {
          sp_cash: {},
          sp_coins: {}
        };

        data?.forEach((setting: any) => {
          if (setting.currency_type === 'sp_cash') {
            fees.sp_cash[setting.entry_amount] = setting.processing_fee;
          } else if (setting.currency_type === 'sp_coins') {
            fees.sp_coins[setting.entry_amount] = setting.processing_fee;
          }
        });

        console.log('Loaded processing fees:', fees);
        setProcessingFees(fees);
      } catch (error) {
        console.error('Error fetching processing fees:', error);
        toast.error('Failed to load processing fees');
        
        // Fallback to hardcoded values if database fails
        setProcessingFees({
          sp_cash: {
            5: 0.25, 10: 0.25, 20: 0.50, 50: 2, 100: 5,
            200: 5, 300: 10, 400: 15, 500: 20
          },
          sp_coins: {
            1000: 50, 10000: 500, 20000: 1000, 50000: 2000,
            100000: 3000, 500000: 5000
          }
        });
      } finally {
        setLoadingFees(false);
      }
    };

    fetchProcessingFees();
  }, []);

  // Update the calculateProcessingFee function to use cached data
  const calculateProcessingFee = (entryFee: number, type: 'cash' | 'coins') => {
    const dbCurrencyType = type === 'cash' ? 'sp_cash' : 'sp_coins';
    const fee = processingFees[dbCurrencyType]?.[entryFee];
    
    if (fee === undefined) {
      toast.error('Processing fee not available. Please try again later.');
      return 0;
    }
    
    return fee;
  };

  const processingFee = calculateProcessingFee(contest.entryFee, currencyType);
  const totalCharge = contest.entryFee + processingFee;
  const estimatedPrize = contest.entryFee * contest.maxPlayers;

  const currencyLabel = currencyType === 'coins' ? 'SP Coins' : 'SP Cash';
  const currencyColor = currencyType === 'coins' ? 'text-yellow-500' : 'text-success';

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
  
  // Add at the top of handleJoin in JoinContestModal
  // Update the handleJoin function in JoinContestModal.tsx
  const handleJoin = async () => {
    if (!user) {
      toast.error('Please login to join');
      return;
    }

    if (!selectedList) {
      toast.error('Please select a list');
      return;
    }

    try {
      // Get user balance
      const { data: profileData } = await supabase
        .from('profiles')
        .select('sp_cash, sp_coins')
        .eq('user_id', user.id)
        .single();

      if (!profileData) {
        toast.error('User profile not found');
        return;
      }

      const totalCharge = contest.entryFee + processingFee;
      const balance = currencyType === 'cash' ? profileData.sp_cash : profileData.sp_coins;

      if (balance < totalCharge) {
        toast.error(`Insufficient balance. You need ${totalCharge} ${currencyType === 'cash' ? 'SP Cash' : 'SP Coins'}`);
        return;
      }
      
      const { data: contestData } = await supabase
          .from('contests')
          .select('current_players, max_players')
          .eq('id', contest.id)
          .single();

      if (contestData.current_players === contestData.max_players) {
        toast.error('This challenge is already full');
        return;
      }
      
      // Prepare picks data
      const picksData = selectedList.picks.map(pick => ({
        player_prop_id: pick.prop.id,
        selection: pick.selection
      }));

      // Call database function
      const { error } = await supabase
        .rpc('join_contest_with_transaction', {
          p_contest_id: contest.id,
          p_user_id: user.id,
          p_list_name: selectedList.list_name,
          p_user_sp_cash: profileData.sp_cash,
          p_user_sp_coins: profileData.sp_coins,
          p_charge_cash: currencyType === 'cash' ? totalCharge : 0,
          p_charge_coins: currencyType === 'coins' ? totalCharge : 0,
          p_currency_type: currencyType,
          p_picks: picksData
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already joined this challenge');
        } else {
          throw error;
        }
        return;
      }

      if (contestData.current_players === contestData.max_players) {
        const { error: stateError } = await supabase
          .from('contests')
          .update({
            user_state: 'active',
            admin_state: 'ready'
          })
          .eq('id', contestId);

        if (stateError) throw stateError;
      }

      toast.success('Successfully joined the challenge!');
      onClose();
      
      // Trigger refresh
      window.dispatchEvent(new Event('refresh-contests'));      
    } catch (error) {
      console.error('Error joining contest:', error);
      toast.error('Failed to join challenge');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[85vh] rounded-xl bg-card border border-border shadow-elevated overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-foreground">Join Challenge</h2>
              <p className="text-xs text-muted-foreground">
                {contest.predictions} Picks • {contest.entryFee} Entry
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Other Players' Picks */}
          <div className="flex-1 border-b lg:border-b-0 lg:border-r border-border overflow-hidden flex flex-col max-h-[40vh] lg:max-h-none">
            <div className="p-3 border-b border-border shrink-0">
              <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                PLAYERS ({existingPlayers.length}/{contest.maxPlayers})
              </h3>
            </div>
            
            <ScrollArea className="hidden flex-1 p-3">
              <div className="space-y-2">
                {existingPlayers.map((player) => {
                  const isRevealed = revealedPlayers.has(player.id) || player.isRevealed;
                  return (
                    <div key={player.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={player.avatarUrl} />
                            <AvatarFallback>
                              <User className="w-3 h-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{player.username}</p>
                            <p className="text-[10px] text-muted-foreground">{player.picks.length} picks</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePlayerReveal(player.id)}
                          className="h-7 px-2 gap-1 text-xs"
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {isRevealed ? 'Hide' : 'View'}
                        </Button>
                      </div>
                      
                      {isRevealed && (
                        <div className="space-y-1.5">
                          {player.picks.map((pick) => (
                            <div key={pick.prop.id} className="flex items-center gap-1.5 p-1.5 rounded bg-background/50 text-xs">
                              <Avatar className="w-5 h-5 shrink-0">
                                <AvatarImage src={pick.prop.player_image || ''} alt={pick.prop.player_name} />
                                <AvatarFallback className="text-[8px]">
                                  <User className="w-2 h-2" />
                                </AvatarFallback>
                              </Avatar>
                              <span className={pick.selection === 'over' ? 'text-green-500' : 'text-red-500'}>
                                {pick.selection === 'over' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                              </span>
                              <span className="font-medium truncate">{pick.prop.player_name}</span>
                              <span className="text-muted-foreground truncate">
                                {pick.selection === 'over' ? '>' : '<'} {pick.prop.line}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {existingPlayers.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No players yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Your Picks Selection */}
          <div className="w-full lg:w-80 p-4 bg-secondary/30 flex flex-col shrink-0">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              YOUR PICKS
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
                ) : validLists.length === 0 ? (
                  <div className="p-4 text-center text-amber-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No matching lists found</p>
                    <p className="text-xs mt-1">
                      You need a list with exactly {contest.predictions} picks to join this challenge
                    </p>
                  </div>
                ) : (
                  validLists.map((list) => (
                    <SelectItem key={list.list_name} value={list.list_name}>
                      {list.list_name} ({list.picks.length} picks)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {selectedList ? (
              <ScrollArea className="flex-1 mb-3 max-h-32 lg:max-h-none">
                <div className="space-y-1.5">
                  {selectedList.picks.map((pick, index) => (
                    <div key={pick.prop.id} className="flex items-center gap-1.5 p-2 rounded-lg bg-card border border-border text-xs">
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-semibold shrink-0">
                        {index + 1}
                      </span>
                      <Avatar className="w-5 h-5 shrink-0">
                        <AvatarImage src={pick.prop.player_image || ''} alt={pick.prop.player_name} />
                        <AvatarFallback className="text-[8px]">
                          <User className="w-2 h-2" />
                        </AvatarFallback>
                      </Avatar>
                      <span className={`shrink-0 ${pick.selection === 'over' ? 'text-green-500' : 'text-red-500'}`}>
                        {pick.selection === 'over' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      </span>
                      <span className="font-medium truncate">{pick.prop.player_name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <Bookmark className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">Select a list above</p>
              </div>
            )}

           <div className="p-4 rounded-xl bg-card border border-border mb-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Challenge Entry</span>
                <span className={`font-semibold ${currencyColor}`}>
                  {contest.entryFee.toLocaleString()} {currencyLabel}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className={`font-semibold ${currencyColor}`}>
                  {processingFee.toLocaleString()} {currencyLabel}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-foreground">Total Charge</span>
                <span className={`font-bold text-lg ${currencyColor}`}>
                  {totalCharge.toLocaleString()} {currencyLabel}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Prize</span>
                <span className={`font-bold text-lg ${currencyColor}`}>
                  {estimatedPrize.toLocaleString()} {currencyLabel}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Players</span>
                <span className="font-semibold">{contest.currentPlayers}/{contest.maxPlayers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Required Predictions</span>
                <span className="font-semibold">{contest.predictions}</span>
              </div>
            </div>

          <Button
            variant="hero"
            className="w-full gap-2"
            disabled={!canJoin}
            onClick={handleJoin}  // Changed
          >
            {canJoin ? (
              <>
                <Check className="w-4 h-4" />
                Join Challenge - {totalCharge.toLocaleString()} {currencyLabel}
              </>
            ) : (
              `Select a list with ${contest.predictions} predictions`
            )}
          </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
