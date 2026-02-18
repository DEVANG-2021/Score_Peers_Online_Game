import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, X, Loader2, List, User, ChevronUp, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerPropCard } from "./PlayerPropCard";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Fight {
  id: string;
  fighter_a: string;
  fighter_b: string;
  fight_start_time: string;
  event_id: string;
}

interface PlayerProp {
  id: string;
  fight_id: string;
  player_name: string;
  player_image: string | null;
  prop_type: string;
  line: number;
  fights: {
    id: string;
    fighter_a: string;
    fighter_b: string;
    fight_start_time: string;
    event_id: string;
  };
}

interface GameEvent {
  id: string;
  name: string;
  game_date: string;
  game_time: string;
  status: string;
}

export interface SelectedPick {
  prop: PlayerProp;
  selection: 'over' | 'under';
  fightId: string;
}

interface ExplorePicksProps {
  selectedPicks?: SelectedPick[];
  onPicksChange?: (picks: SelectedPick[]) => void;
  onCreateList?: (list: any) => void;
}

const MMA_PROP_CATEGORIES = [
  { key: 'significant_strikes', label: 'Significant Strikes' },
  { key: 'total_strikes', label: 'Total Strikes' },
  { key: 'round_line', label: 'Round Line' },
  { key: 'takedowns', label: 'Takedowns' },
];

const formatPropType = (propType: string) => {
  const labels: Record<string, string> = {
    'significant_strikes': 'Sig. Strikes',
    'total_strikes': 'Total Strikes',
    'round_line': 'Round Line',
    'takedowns': 'Takedowns',
  };
  return labels[propType] || propType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const ExplorePicks = ({
  selectedPicks: externalPicks,
  onPicksChange,
}: ExplorePicksProps) => {
  const [props, setProps] = useState<PlayerProp[]>([]);
  const [fights, setFights] = useState<Fight[]>([]);
  const [gameEvent, setGameEvent] = useState<GameEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalPicks, setInternalPicks] = useState<SelectedPick[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>(MMA_PROP_CATEGORIES[0].key);
  const [selectedFights, setSelectedFights] = useState<string[]>([]);
  const [countdown, setCountdown] = useState({ hours: 0, mins: 0, secs: 0 });
  const [listName, setListName] = useState('');
  const [showListInput, setShowListInput] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  const selectedPicks = externalPicks ?? internalPicks;

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  const setSelectedPicks = (picks: SelectedPick[] | ((prev: SelectedPick[]) => SelectedPick[])) => {
    const newPicks = typeof picks === 'function' ? picks(selectedPicks) : picks;
    if (onPicksChange) {
      onPicksChange(newPicks);
    } else {
      setInternalPicks(newPicks);
    }
  };

  // Remove the duplicate prop validation from validatePickSelection function
  const validatePickSelection = (newPick: SelectedPick, currentPicks: SelectedPick[]): { valid: boolean; error?: string } => {
    const { prop, selection, fightId } = newPick;
    
    // Rule: Can only have ONE pick per fight
    const existingFightPick = currentPicks.find(p => p.fightId === fightId);
    if (existingFightPick && existingFightPick.prop.id !== prop.id) {
      // Check if it's same player but different category - NOT ALLOWED
      if (existingFightPick.prop.player_name === prop.player_name) {
        return {
          valid: false,
          error: `You can only select ONE category per player. You already selected ${formatPropType(existingFightPick.prop.prop_type)} for ${prop.player_name}`
        };
      }
    }

    // Rule: Check if same player has different prop types in the list
    const samePlayerDifferentProp = currentPicks.find(p => 
      p.prop.player_name === prop.player_name && 
      p.prop.prop_type !== prop.prop_type &&
      p.fightId !== fightId
    );
    
    if (samePlayerDifferentProp) {
      return {
        valid: false,
        error: `Cannot mix different categories for ${prop.player_name}. Already selected ${formatPropType(samePlayerDifferentProp.prop.prop_type)}`
      };
    }

    return { valid: true };
  };

  const fetchGameEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('sport', 'MMA')
        .eq('league', 'MMA')
        .is('deleted_at', null)  
        .gte('game_date', new Date().toISOString().split('T')[0])
        .order('game_date', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      setGameEvent(data);
    } catch (error) {
      console.error('Error fetching game event:', error);
      toast.error('Failed to load event');
    }
  };

  const fetchFights = async (eventId: string) => {
    if (!user){
      setFights([]);
      toast.error('You are not authinicated! Please login to view fights');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fights')
        .select('*')
        .eq('event_id', eventId)
        .order('fight_start_time', { ascending: true });

      if (error) throw error;
      setFights(data || []);
      
      if (data && data.length > 0) {
        setSelectedFights(data.map(f => f.id));
      }
    } catch (error) {
      console.error('Error fetching fights:', error);
      toast.error('Failed to load fights');
    }
  };

  const fetchProps = async (fightIds: string[]) => {
    if (fightIds.length === 0) {
      setProps([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('player_props')
        .select(`
          *,
          fights!inner(
            id,
            fighter_a,
            fighter_b,
            fight_start_time,
            event_id
          )
        `)
        .in('fight_id', fightIds)
        .is('deleted_at', null)  // Only active props
        .is('fights.deleted_at', null)  // Only from active fights
        .is('fights.games.deleted_at', null)  // Only from active events
        .eq('is_active', true)
        .order('player_name', { ascending: true });

      if (error) throw error;
      setProps(data || []);
    } catch (error) {
      console.error('Error fetching props:', error);
      toast.error('Failed to load player props');
    }
  };

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchGameEvent();
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (gameEvent) {
      fetchFights(gameEvent.id);
    }
  }, [gameEvent]);

  useEffect(() => {
    fetchProps(selectedFights);
  }, [selectedFights]);

  const handleSelectPick = (prop: PlayerProp, selection: 'over' | 'under') => {
    const fightId = prop.fight_id;
    setValidationError('');
    
    const existingPickIndex = selectedPicks.findIndex(p => p.fightId === fightId);
    
    if (existingPickIndex >= 0) {
      if (selectedPicks[existingPickIndex].prop.id === prop.id && 
          selectedPicks[existingPickIndex].selection === selection) {
        setSelectedPicks(prev => prev.filter(p => p.fightId !== fightId));
        toast.info('Pick removed');
        return;
      }
      
      // Validate before replacing
      const otherPicks = selectedPicks.filter(p => p.fightId !== fightId);
      const validation = validatePickSelection({ prop, selection, fightId }, otherPicks);
      
      if (!validation.valid) {
        setValidationError(validation.error || '');
        toast.error(validation.error);
        return;
      }
      
      setSelectedPicks(prev => prev.map(p => 
        p.fightId === fightId ? { prop, selection, fightId } : p
      ));
      toast.success('Pick updated');
    } else {
      // Validate before adding
      const validation = validatePickSelection({ prop, selection, fightId }, selectedPicks);
      
      if (!validation.valid) {
        setValidationError(validation.error || '');
        toast.error(validation.error);
        return;
      }
      
      setSelectedPicks(prev => [...prev, { prop, selection, fightId }]);
      toast.success('Pick added');
    }
  };

  const handleRemovePick = (fightId: string) => {
    setSelectedPicks(prev => prev.filter(p => p.fightId !== fightId));
    setValidationError('');
    toast.info('Pick removed');
  };

  const isSelected = (propId: string, selection: 'over' | 'under') => {
    const pick = selectedPicks.find(p => p.prop.id === propId);
    return pick?.selection === selection;
  };

  const handleSavePicksList = async () => {
    if (!user) {
      toast.error('Please login to save picks');
      return;
    }

    if (selectedPicks.length === 0) {
      toast.error('Please select at least one pick');
      return;
    }

    if (!listName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    if (!gameEvent) {
      toast.error('No event selected');
      return;
    }

    // Check for duplicate list name for this event
    try {
      const { data: existingLists, error: fetchError } = await supabase
        .from('picks')
        .select('list_name')
        .eq('user_id', user.id)
        .eq('game_id', gameEvent.id)
        .eq('list_name', listName.trim())
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingLists && existingLists.length > 0) {
        toast.error(`You already have a list named "${listName}" for this event. Please use a different name.`);
        return;
      }

      // NEW: Check for duplicate picks combination
      const { data: allUserPicks, error: picksError } = await supabase
        .from('picks')
        .select('player_prop_id, selection, list_name')
        .eq('user_id', user.id)
        .eq('game_id', gameEvent.id);

      if (picksError) throw picksError;

      if (allUserPicks && allUserPicks.length > 0) {
        // Group existing picks by list_name
        const existingListsMap = new Map<string, Set<string>>();
        
        allUserPicks.forEach(pick => {
          if (!existingListsMap.has(pick.list_name)) {
            existingListsMap.set(pick.list_name, new Set());
          }
          // Create unique identifier: propId + selection
          existingListsMap.get(pick.list_name)!.add(`${pick.player_prop_id}_${pick.selection}`);
        });

        // Create set for current picks
        const currentPicksSet = new Set(
          selectedPicks.map(p => `${p.prop.id}_${p.selection}`)
        );

        // Check if any existing list has the exact same picks
        for (const [existingListName, existingPicksSet] of existingListsMap.entries()) {
          // Check if sets are equal (same size and same elements)
          if (existingPicksSet.size === currentPicksSet.size) {
            const allMatch = [...currentPicksSet].every(pick => existingPicksSet.has(pick));
            
            if (allMatch) {
              toast.error(`This exact combination of picks already exists in your list "${existingListName}". Please modify your picks.`);
              return;
            }
          }
        }
      }

    } catch (error) {
      console.error('Error checking existing lists:', error);
      toast.error('Failed to validate list');
      return;
    }

    setSavingList(true);
    try {
      const picksToInsert = selectedPicks.map(pick => ({
        user_id: user.id,
        game_id: gameEvent.id,
        fight_id: pick.fightId,
        player_prop_id: pick.prop.id,
        selection: pick.selection,
        list_name: listName.trim(),
      }));

      const { error } = await supabase
        .from('picks')
        .insert(picksToInsert);

      if (error) throw error;

      toast.success(`List "${listName}" saved with ${selectedPicks.length} picks!`);
      setSelectedPicks([]);
      setListName('');
      setShowListInput(false);
      setValidationError('');

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('saved-picks-updated', { 
        detail: { 
          userId: user.id,
          listName: listName.trim(),
          picksCount: selectedPicks.length
        } 
      }));
    } catch (error: any) {
      toast.error('Failed to save picks. Please try again.');
    } finally {
      setSavingList(false);
    }
  };

  const filteredProps = useMemo(() => {
    return categoryFilter 
      ? props.filter(p => p.prop_type === categoryFilter)
      : props;
  }, [props, categoryFilter]);

  const handleToggleFight = (fightId: string) => {
    setSelectedFights(prev => 
      prev.includes(fightId) 
        ? prev.filter(id => id !== fightId)
        : [...prev, fightId]
    );
  };

  const handleSelectAllFights = () => {
    if (selectedFights.length === fights.length) {
      setSelectedFights([]);
    } else {
      setSelectedFights(fights.map(f => f.id));
    }
  };

  const formatFightTime = (time: string) => {
    if (!time) return 'TBD';
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gameEvent) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No upcoming MMA events found</p>
      </div>
    );
  }

  return (
    <section className="py-4 pb-32">
      {/* Validation Error Alert */}
      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Challenge Countdown */}
      <div className="flex items-center justify-center gap-4 py-4 mb-4 bg-secondary/30 rounded-lg border border-border">
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

      {/* MMA Header */}
      <div className="flex items-center justify-center gap-2 pb-4 border-b border-border mb-4">
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-primary-foreground border-2 border-primary">
          MMA - {gameEvent.name}
        </div>
      </div>

      {/* Fights Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-display font-bold text-foreground">
            MMA Fights ({fights.length})
          </h3>
          <div className="flex items-center gap-2">
            {selectedFights.length > 0 && selectedFights.length < fights.length && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFights([])}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAllFights}
              className="text-foreground hover:bg-secondary"
            >
              {selectedFights.length === fights.length ? 'Deselect All' : 'Select All'}
              <ChevronUp className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          Select fights • One pick per fight • One category per player
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {fights.map(fight => (
            <button
              key={fight.id}
              onClick={() => handleToggleFight(fight.id)}
              className={`p-3 rounded-lg border transition-all text-left relative ${
                selectedFights.includes(fight.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/30 hover:border-muted-foreground'
              }`}
            >
              {selectedPicks.some(p => p.fightId === fight.id) && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500" />
              )}
              <div className="font-semibold text-foreground text-sm mb-1">{fight.fighter_a}</div>
              <div className="text-xs text-muted-foreground mb-1">vs</div>
              <div className="font-semibold text-foreground text-sm mb-2">{fight.fighter_b}</div>
              <span className="text-xs text-muted-foreground">
                {formatFightTime(fight.fight_start_time)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {MMA_PROP_CATEGORIES.map(category => (
          <button
            key={category.key}
            onClick={() => setCategoryFilter(category.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              categoryFilter === category.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Props Grid */}
      {selectedFights.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Select fights to view player props</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredProps.map((prop, index) => (
            <PlayerPropCard
              key={prop.id}
              prop={prop}
              isOverSelected={isSelected(prop.id, 'over')}
              isUnderSelected={isSelected(prop.id, 'under')}
              onSelectOver={() => handleSelectPick(prop, 'over')}
              onSelectUnder={() => handleSelectPick(prop, 'under')}
              index={index}
            />
          ))}
          
          {filteredProps.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No props available for this selection</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Picks Panel */}
      <AnimatePresence>
        {selectedPicks.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-40"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-foreground">
                  My Picks ({selectedPicks.length}) • One per fight
                </h3>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedPicks([]);
                  setListName('');
                  setShowListInput(false);
                  setValidationError('');
                }}>
                  Clear All
                </Button>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {selectedPicks.map(pick => (
                  <Badge
                    key={pick.fightId}
                    variant="secondary"
                    className="flex items-center gap-2 py-2 px-3 shrink-0"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={pick.prop.player_image || ''} alt={pick.prop.player_name} />
                      <AvatarFallback className="text-[10px]">
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span className={pick.selection === 'over' ? 'text-green-500' : 'text-red-500'}>
                      {pick.selection === 'over' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </span>
                    <span className="font-medium">{pick.prop.player_name}</span>
                    <span className="text-muted-foreground">
                      {pick.selection === 'over' ? '>' : '<'} {pick.prop.line} {formatPropType(pick.prop.prop_type)}
                    </span>
                    <button
                      onClick={() => handleRemovePick(pick.fightId)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                {showListInput ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      placeholder="Enter unique list name..."
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      className="flex-1"
                      maxLength={50}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && listName.trim()) {
                          handleSavePicksList();
                        }
                      }}
                    />
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={handleSavePicksList}
                      disabled={!listName.trim() || savingList}
                    >
                      {savingList ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <List className="w-4 h-4 mr-2" />
                          Save List
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowListInput(false);
                        setListName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => setShowListInput(true)}
                    className="flex-1 gap-2"
                  >
                    <List className="w-4 h-4" />
                    Create List with {selectedPicks.length} Picks
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};