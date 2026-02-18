import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ContestCard, Contest } from "./ContestCard";
import { Plus, TrendingUp, TrendingDown, SlidersHorizontal, X, Search, RefreshCw } from "lucide-react";
import { SelectedPick } from "@/components/explore/ExplorePicks";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const mockContests: Contest[] = [
// Active challenges
{
  id: '1',
  name: 'MMA 310 Showdown',
  predictions: 4,
  entryFee: 25,
  maxPlayers: 2,
  currentPlayers: 2,
  status: 'active',
  sport: 'MMA',
  createdBy: 'BetKing',
}, {
  id: '2',
  name: 'Fight Night Challenge',
  predictions: 6,
  entryFee: 100,
  maxPlayers: 4,
  currentPlayers: 4,
  status: 'active',
  sport: 'MMA',
  createdBy: 'HighRoller',
},
// Open challenges (can join)
{
  id: '4',
  name: 'Quick Picks',
  predictions: 2,
  entryFee: 10,
  maxPlayers: 2,
  currentPlayers: 1,
  status: 'open',
  sport: 'MMA',
  createdBy: 'FightFan',
}, {
  id: '5',
  name: 'Octagon Glory',
  predictions: 5,
  entryFee: 25,
  maxPlayers: 8,
  currentPlayers: 5,
  status: 'open',
  sport: 'MMA',
  createdBy: 'MMAGuru',
},
// Completed challenges
{
  id: '6',
  name: 'December Fight Night',
  predictions: 4,
  entryFee: 50,
  maxPlayers: 4,
  currentPlayers: 4,
  status: 'completed',
  sport: 'MMA',
  createdBy: 'ProPicker',
}, {
  id: '7',
  name: 'Winter Championship',
  predictions: 5,
  entryFee: 75,
  maxPlayers: 6,
  currentPlayers: 6,
  status: 'completed',
  sport: 'MMA',
  createdBy: 'ChampMaker',
}];

interface Contest {
  id: string;
  name: string;
  game_id: string;
  sport: string;
  league: string;
  entry_fee_cash: number;
  entry_fee_coins: number;
  processing_fee_cash: number;
  processing_fee_coins: number;
  currency_type: 'cash' | 'coins';
  num_predictions: number;
  max_players: number;
  current_players: number;
  status: string;
  user_state: string;
  created_by: string;
  created_at: string;
  games: {
    name: string;
    game_date: string;
    game_time: string;
  };
  profiles: {
    username: string;
  };
}

interface ContestLobbyProps {
  onCreateContest?: () => void;
  onJoinContest?: (id: string, contest?: Contest) => void;
  onDeleteContest?: (id: string) => void;
  onReviewContest?: (id: string, contest?: Contest) => void;
  savedPicks?: SelectedPick[];
  currentUserId?: string;
}

const formatPropType = (propType: string) => {
  return propType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};


export const ContestLobby = ({
  onCreateContest,
  onJoinContest,
  onDeleteContest,
  onReviewContest,
  savedPicks = [],
  currentUserId = 'HoopDreams' // Mock current user for demo
}: ContestLobbyProps) => {
  const [subFilter, setSubFilter] = useState<'available' | 'open' | 'active' | 'completed' | 'expired'>('available');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [predictionsFilter, setPredictionsFilter] = useState<number | null>(null);
  const [playersFilter, setPlayersFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { currencyType } = useCurrency();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();
  }, []);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameEvent, setGameEvent] = useState<any>(null);
  const [countdown, setCountdown] = useState({ hours: 0, mins: 0, secs: 0 });
  const [newlyCreatedContestId, setNewlyCreatedContestId] = useState<string | null>(null);

  const fetchGameEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('sport', 'MMA')
        .eq('league', 'MMA')
        .is('deleted_at', null)  // Only show non-deleted events
        .gte('game_date', new Date().toISOString().split('T')[0])
        .order('game_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setGameEvent(data);
    } catch (error) {
      console.error('Error fetching game event:', error);
    }
  };

  const checkUserJoinedContest = async (contestId: string) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('contest_entries')
        .select('id')
        .eq('contest_id', contestId)
        .eq('user_id', user.id)
        .single();
      
      return !!data;
    } catch (error) {
      return false;
    }
  };

  // Add this useEffect to ContestLobby.tsx for manual refresh
  useEffect(() => {
    const handleRefresh = () => {
      fetchContests();
    };

    window.addEventListener('refresh-contests', handleRefresh);
    return () => {
      window.removeEventListener('refresh-contests', handleRefresh);
    };
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      // First, fetch contests
      const { data: contestsData, error: contestsError } = await supabase
        .from('contests')
        .select(`
          *,
          games!inner(name, game_date, game_time)
        `)
        .eq('currency_type', currencyType)
        .order('created_at', { ascending: false });

      if (contestsError) throw contestsError;

      // Then fetch entries and picks separately for each contest
      const contestsWithData = await Promise.all(
        (contestsData || []).map(async (contest) => {
          // Get creator username
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', contest.created_by)
            .single();

          console.log(`Fetched profile for user_id ${contest.created_by}:`, profileData.username);
          // Get contest entries with picks
          const { data: entries } = await supabase
            .from('contest_entries')
            .select(`
              id,
              user_id,
              list_name,
              score,
              rank,
              is_winner,
              prize_credits_cash,
              prize_credits_coins,
              contest_entry_picks(
                id,
                player_prop_id,
                selection,
                points,
                is_correct
              )
            `)
            .eq('contest_id', contest.id);

          const hasJoined = await checkUserJoinedContest(contest.id);
          console.log('contest entries:', entries);
          return {
            ...contest,
            creator_username: profileData.username,
            contest_entries: entries || [],
            hasJoined
          };
        })
      );

      setContests(contestsWithData);
    } catch (error) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameEvent();
    fetchContests();

    // Realtime subscription - make it more responsive
    const channel = supabase
      .channel('contests_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'contests',
        filter: `currency_type=eq.${currencyType}`
      }, (payload) => {
        console.log('New contest created via realtime:', payload.new);
        // Force immediate refresh
        fetchContests();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'contests',
        filter: `currency_type=eq.${currencyType}`
      }, (payload) => {
        console.log('Contest updated via realtime:', payload.new);
        fetchContests();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'contest_entries'
      }, (payload) => {
        console.log('New contest entry via realtime:', payload.new);
        fetchContests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currencyType]);
  // Countdown effect
  useEffect(() => {
    if (!gameEvent) return;

    const calculateCountdown = () => {
      const eventDateTime = new Date(`${gameEvent.game_date}T${gameEvent.game_time}`);
      const now = new Date();
      const diff = eventDateTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ hours: 0, mins: 0, secs: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours, mins, secs });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [gameEvent]);

  const CountdownTimer = () => {
    if (!gameEvent) return null;

    return (
      <div className="flex items-center justify-center gap-4 py-4 mb-6 bg-secondary/30 rounded-lg border border-border">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">
            {new Date(gameEvent.game_date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
          <p className="text-lg font-display font-bold text-foreground">
            {gameEvent.name} starts in{' '}
            <span className="text-primary">
              {countdown.hours}h {countdown.mins}m {countdown.secs}s
            </span>
          </p>
        </div>
      </div>
    );
  };

 const filteredContests = contests.filter(contest => {
    let subMatch = true;
    
    // Available = open status AND has space for more players AND has at least 1 player
    if (subFilter === 'available') {
      subMatch = contest.user_state === 'available' && 
                  contest.current_players >= 1 && 
                  contest.current_players < contest.max_players;
    }
    // Open = open status (includes challenges with 0 players or waiting for players)
    else if (subFilter === 'open') {
      subMatch = contest.user_state === 'open';
    }
    // Active = has reached max players and is active
    else if (subFilter === 'active') {
      subMatch = contest.user_state === 'active';
    }
    else if (subFilter === 'completed') {
      subMatch = contest.user_state === 'completed';
    }
    else if (subFilter === 'expired') {
      subMatch = contest.user_state === 'expired';
    }

    const predictionsMatch = predictionsFilter === null || contest.num_predictions === predictionsFilter;
    const playersMatch = playersFilter === null || contest.max_players === playersFilter;
    const searchMatch = searchQuery.trim() === '' || 
      contest.profiles?.username.toLowerCase().includes(searchQuery.toLowerCase());

    return subMatch && predictionsMatch && playersMatch && searchMatch;
  });

  const activeFiltersCount = (predictionsFilter !== null ? 1 : 0) + (playersFilter !== null ? 1 : 0);
  
  const clearAllFilters = () => {
    setSubFilter('available');
    setPredictionsFilter(null);
    setPlayersFilter(null);
  };

  const stats = {
    available: contests.filter(c => 
      c.user_state === 'available' && 
      c.current_players >= 1 && 
      c.current_players < c.max_players
    ).length,
    openChallenges: contests.filter(c => c.user_state === 'available').length,
    activeChallenges: contests.filter(c => c.user_state === 'active').length,
    completedChallenges: contests.filter(c => c.user_state === 'completed').length,
    expiredChallenges: contests.filter(c => c.user_state === 'expired').length,
  };
  const currencyLabel = currencyType === 'coins' ? 'SP Coins' : 'SP Cash';

  // Function to manually check for expired contests
  const manuallyCheckExpiredContests = async () => {
    try {
      console.log('Manually checking for expired contests...');
      
      const { data, error } = await supabase
        .rpc('update_expired_contests_batch');
      
      if (error) {
        console.error('Error checking expired contests:', error);
      } else {
        console.log('Expired contests check result:', data);
        
        // If contests were updated, refresh the list
        if (data?.updated_count > 0) {
          toast.success(`${data.updated_count} challenges moved to expired`);
          fetchContests();
        }
      }
    } catch (error) {
      console.error('Failed to check expired contests:', error);
    }
  };

  // Call this function when component mounts
  useEffect(() => {
    // Check for expired contests on mount
    manuallyCheckExpiredContests();
    
    // Set up interval to check every 10 minutes (as backup)
    const intervalId = setInterval(manuallyCheckExpiredContests, 10 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <section className="py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-display font-bold text-foreground mb-1 sm:mb-2">
              Challenge Lobby
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Join or create a prediction challenge
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-9 w-full sm:w-64 bg-card border-border/50 text-sm h-9 sm:h-10"
              />
            </div>
            <Button 
              variant="outline" 
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
              onClick={() => {
                fetchContests();
                toast.success('Challenges refreshed', {
                  duration: 1000
                });
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Refresh
            </Button>
            <Button variant="hero" className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 whitespace-nowrap" onClick={onCreateContest}>
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Create</span> Challenge
            </Button>
          </div>
        </div>
          {/* Challenge Countdown */}
      {/* <div className="flex items-center justify-center gap-4 py-4 mb-4 bg-secondary/30 rounded-lg border border-border">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">
            {new Date(gameEvent.game_date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
          <p className="text-lg font-display font-bold text-foreground">
            {gameEvent.name} starts in{' '}
            <span className="text-primary">
              {countdown.hours}h {countdown.mins}m {countdown.secs}s
            </span>
          </p>
        </div>
      </div> */}
        {/* Saved Picks Display */}
        {savedPicks.length > 0 && <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">Your Saved Picks</h3>
              <Badge variant="secondary">{savedPicks.length} picks</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedPicks.map(pick => <Badge key={pick.prop.id} variant="outline" className="flex items-center gap-1 py-1">
                  <span className={pick.selection === 'over' ? 'text-green-500' : 'text-red-500'}>
                    {pick.selection === 'over' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </span>
                  <span>{pick.prop.player_name}</span>
                  <span className="text-muted-foreground text-xs">
                    {pick.selection === 'over' ? '>' : '<'} {pick.prop.line} {formatPropType(pick.prop.prop_type)}
                  </span>
                </Badge>)}
            </div>
          </motion.div>}

        {/* Quick Stats */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="grid grid-cols-5 gap-1.5 sm:gap-4 mb-4 sm:mb-8">
          <div className="p-2.5 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-[11px] sm:text-sm mb-0.5 sm:mb-1 truncate">Available</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {stats.available}
            </div>
          </div>
          <div className="p-2.5 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-[11px] sm:text-sm mb-0.5 sm:mb-1">Open</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {stats.openChallenges}
            </div>
          </div>
          <div className="p-2.5 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-[11px] sm:text-sm mb-0.5 sm:mb-1">Active</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-accent">
              {stats.activeChallenges}
            </div>
          </div>
          <div className="p-2.5 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-[11px] sm:text-sm mb-0.5 sm:mb-1">Done</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-success">
              {stats.completedChallenges}
            </div>
          </div>
          <div className="p-2.5 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-[11px] sm:text-sm mb-0.5 sm:mb-1">Expired</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-muted-foreground">
              {stats.expiredChallenges}
            </div>
          </div>
        </motion.div>

        {/* Challenge Countdown */}
        <CountdownTimer />

        {/* MMA Header */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="flex p-1 rounded-lg sm:rounded-xl bg-muted/50 border border-border/50 w-full max-w-md">
            <div className="relative flex-1 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-display font-bold text-xs sm:text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/25 text-center">
              MMA
            </div>
          </div>
        </div>

        {/* Sub Filters */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="flex items-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-muted/30 border border-border/30 w-full max-w-xl">
            <button onClick={() => setShowFilterPanel(!showFilterPanel)} className={`
                flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-md sm:rounded-lg transition-all duration-200
                ${showFilterPanel || activeFiltersCount > 0 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
              `}>
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              {activeFiltersCount > 0 && <span className="ml-1.5 text-xs sm:text-sm font-bold">{activeFiltersCount}</span>}
            </button>
            {(['available', 'open', 'active', 'completed', 'expired'] as const).map(f => <button key={f} onClick={() => setSubFilter(f)} className={`
                  flex-1 py-2.5 sm:py-3 rounded-md sm:rounded-lg text-xs sm:text-base font-medium transition-all duration-200 capitalize
                  ${subFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
                `}>
                {f}
              </button>)}
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} className="overflow-hidden mb-6">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-foreground">Advanced Filters</h4>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Clear all
                      </button>}
                    <button onClick={() => setShowFilterPanel(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Number of Predictions */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    NUMBER OF PREDICTIONS
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[2, 3, 4, 5, 6].map(num => <button key={num} onClick={() => setPredictionsFilter(predictionsFilter === num ? null : num)} className={`
                          px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                          ${predictionsFilter === num ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground border border-border/50'}
                        `}>
                        {num}
                      </button>)}
                  </div>
                </div>

                {/* Number of Players */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    NUMBER OF PLAYERS
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <button key={num} onClick={() => setPlayersFilter(playersFilter === num ? null : num)} className={`
                          px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                          ${playersFilter === num ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground border border-border/50'}
                        `}>
                        {num}
                      </button>)}
                  </div>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>

        {/* Challenge Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContests.map((contest, index) => (
              <motion.div key={contest.id}>
                <ContestCard 
                  contest={{
                    id: contest.id,
                    name: contest.name,
                    predictions: contest.num_predictions,
                    entryFee: currencyType === 'cash' ? contest.entry_fee_cash : contest.entry_fee_coins,
                    processingFee: currencyType === 'cash' ? contest.processing_fee_cash : contest.processing_fee_coins,
                    maxPlayers: contest.max_players,
                    currentPlayers: contest.current_players,
                    status: contest.status as any,
                    sport: contest.sport,
                    userState: contest.user_state,
                    createdBy: contest.creator_username || 'Unknown',
                  }}
                  onJoin={onJoinContest} 
                  onDelete={onDeleteContest}
                  onReview={onReviewContest}
                  isCreator={contest.created_by === user?.id}
                  currentUserId={user?.id}
                  hasJoined={contest.hasJoined} // Add this line
                />
              </motion.div>
            ))}
          </div>
        )}

        {filteredContests.length === 0 && <div className="text-center py-12">
            <p className="text-muted-foreground">No challenges found</p>
            <Button variant="hero" className="mt-4 gap-2" onClick={onCreateContest}>
              <Plus className="w-4 h-4" />
              Create First Challenge
            </Button>
          </div>}
      </div>
    </section>;
};