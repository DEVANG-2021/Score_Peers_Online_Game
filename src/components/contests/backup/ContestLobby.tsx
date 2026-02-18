import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ContestCard, Contest } from "./ContestCard";
import { Plus, TrendingUp, TrendingDown, SlidersHorizontal, X, Search } from "lucide-react";
import { SelectedPick } from "@/components/explore/ExplorePicks";
import { useCurrency } from "@/contexts/CurrencyContext";

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

const CountdownTimer = () => {
  const [countdown, setCountdown] = useState({ hours: 10, mins: 30, secs: 10 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, mins, secs } = prev;
        if (secs > 0) {
          secs--;
        } else if (mins > 0) {
          mins--;
          secs = 59;
        } else if (hours > 0) {
          hours--;
          mins = 59;
          secs = 59;
        }
        return { hours, mins, secs };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4 py-4 mb-6 bg-secondary/30 rounded-lg border border-border">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">December 22, 2024</p>
        <p className="text-lg font-display font-bold text-foreground">
          Challenge starts in{' '}
          <span className="text-primary">
            {countdown.hours}h {countdown.mins}m {countdown.secs}s
          </span>
        </p>
      </div>
    </div>
  );
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

  const filteredContests = mockContests.filter(contest => {
    // Sub filter
    let subMatch = true;
    if (subFilter === 'available') subMatch = contest.status === 'open' && contest.currentPlayers < contest.maxPlayers;
    else if (subFilter === 'open') subMatch = contest.status === 'open';
    else if (subFilter === 'active') subMatch = contest.status === 'active';
    else if (subFilter === 'completed') subMatch = contest.status === 'completed';
    else if (subFilter === 'expired') subMatch = contest.status === 'expired';

    // Predictions filter
    const predictionsMatch = predictionsFilter === null || contest.predictions === predictionsFilter;

    // Players filter
    const playersMatch = playersFilter === null || contest.maxPlayers === playersFilter;

    // Search filter (by username)
    const searchMatch = searchQuery.trim() === '' || 
      contest.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    return subMatch && predictionsMatch && playersMatch && searchMatch;
  });

  const activeFiltersCount = (predictionsFilter !== null ? 1 : 0) + (playersFilter !== null ? 1 : 0);
  
  const clearAllFilters = () => {
    setSubFilter('available');
    setPredictionsFilter(null);
    setPlayersFilter(null);
  };

  const stats = {
    available: mockContests.length,
    openChallenges: mockContests.filter(c => c.status === 'open').length,
    activeChallenges: mockContests.filter(c => c.status === 'active').length,
    completedChallenges: mockContests.filter(c => c.status === 'completed').length,
    expiredChallenges: mockContests.filter(c => c.status === 'expired').length,
  };
  const currencyLabel = currencyType === 'coins' ? 'SP Coins' : 'SP Cash';

  return <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
              Challenge Lobby
            </h2>
            <p className="text-muted-foreground">
              Join an existing challenge or create your own prediction challenge
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 sm:w-64 bg-card border-border/50"
              />
            </div>
            <Button variant="hero" className="gap-2" onClick={onCreateContest}>
              <Plus className="w-4 h-4" />
              Create Challenge {savedPicks.length > 0 && `(${savedPicks.length} picks)`}
            </Button>
          </div>
        </div>

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
      }} className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-sm mb-1">Challenges Available</div>
            <div className="text-2xl font-display font-bold text-foreground">
              {stats.available}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-sm mb-1">Open</div>
            <div className="text-2xl font-display font-bold text-foreground">
              {stats.openChallenges}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-sm mb-1">Active</div>
            <div className="text-2xl font-display font-bold text-accent">
              {stats.activeChallenges}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-sm mb-1">Completed</div>
            <div className="text-2xl font-display font-bold text-success">
              {stats.completedChallenges}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-card border border-border/50">
            <div className="text-muted-foreground text-sm mb-1">Expired</div>
            <div className="text-2xl font-display font-bold text-muted-foreground">
              {stats.expiredChallenges}
            </div>
          </div>
        </motion.div>

        {/* Challenge Countdown */}
        <CountdownTimer />

        {/* MMA Header */}
        <div className="flex justify-center mb-4">
          <div className="flex p-1 rounded-xl bg-muted/50 border border-border/50 w-full max-w-md">
            <div className="relative flex-1 py-2.5 rounded-lg font-display font-bold text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/25 text-center">
              MMA
            </div>
          </div>
        </div>

        {/* Sub Filters */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center p-1 rounded-lg bg-muted/30 border border-border/30 w-full max-w-lg">
            <button onClick={() => setShowFilterPanel(!showFilterPanel)} className={`
                flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200
                ${showFilterPanel || activeFiltersCount > 0 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
              `}>
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && <span className="ml-1 text-xs font-bold">{activeFiltersCount}</span>}
            </button>
            {(['available', 'open', 'active', 'completed', 'expired'] as const).map(f => <button key={f} onClick={() => setSubFilter(f)} className={`
                  flex-1 py-2 rounded-md text-xs font-medium transition-all duration-200 capitalize
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

        {/* Contest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContests.map((contest, index) => <motion.div key={contest.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.05
        }}>
              <ContestCard 
                contest={contest} 
                onJoin={onJoinContest} 
                onDelete={onDeleteContest}
                onReview={onReviewContest}
                isCreator={contest.createdBy === currentUserId}
                currentUserId={currentUserId}
              />
            </motion.div>)}
        </div>

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