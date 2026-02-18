import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X, Coins, Layers, Trophy, TrendingUp, TrendingDown, Users, Bookmark, User } from "lucide-react";
import { SelectedPick, SavedList } from "@/components/explore/ExplorePicks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreateContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; predictions: number; entryFee: number; sport: string; picks: SelectedPick[]; players: number }) => void;
  savedPicks?: SelectedPick[];
  savedLists?: SavedList[];
}


const sports = [
  { id: 'mma', name: 'MMA' },
];

// SP Cash entry amounts and processing fees
const spCashEntries = [
  { entry: 5, fee: 0.25 },
  { entry: 10, fee: 0.25 },
  { entry: 20, fee: 0.50 },
  { entry: 50, fee: 2 },
  { entry: 100, fee: 5 },
  { entry: 200, fee: 5 },
  { entry: 300, fee: 10 },
  { entry: 400, fee: 15 },
  { entry: 500, fee: 20 },
];

// SP Coins entry amounts and processing fees
const spCoinsEntries = [
  { entry: 1000, fee: 50 },
  { entry: 10000, fee: 500 },
  { entry: 20000, fee: 1000 },
  { entry: 50000, fee: 2000 },
  { entry: 100000, fee: 3000 },
  { entry: 500000, fee: 5000 },
];

const formatNumber = (num: number) => num.toLocaleString();

const formatPropType = (propType: string) => {
  return propType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const CreateContestModal = ({ isOpen, onClose, onCreate, savedPicks = [], savedLists = [] }: CreateContestModalProps) => {
  const [contestName, setContestName] = useState('');
  const [predictions, setPredictions] = useState(3); // Independent from list
  const [players, setPlayers] = useState(2);
  const [entryIndex, setEntryIndex] = useState(0);
  const [selectedSport, setSelectedSport] = useState('mma');
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [listPicks, setListPicks] = useState<SelectedPick[]>([]);
  const { currencyType } = useCurrency();
  
  
  const entries = currencyType === 'coins' ? spCoinsEntries : spCashEntries;
  const currentEntry = entries[entryIndex];
  const entryFee = currentEntry.entry;
  const processingFee = currentEntry.fee;
  const estimatedPrize = entryFee * players;


  const [user, setUser] = useState<any>(null);
  const [gameEvent, setGameEvent] = useState<any>(null);

  useEffect(() => {
      const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      };
      
      getUser();
    }, []);

  if (!isOpen) return null;

  useEffect(() => {
    const fetchGameEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('sport', 'MMA')
          .eq('league', 'MMA')
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
    fetchGameEvent();
  }, []);

 
  const [validationError, setValidationError] = useState<string>('');


  const currencyLabel = currencyType === 'coins' ? 'SP Coins' : 'SP Cash';
  const currencyColor = currencyType === 'coins' ? 'text-yellow-500' : 'text-success';
  const isValidContestName = contestName.trim().length > 0;
  const hasValidList = selectedListId && 
                     selectedListId !== 'none' && 
                     listPicks.length === predictions &&
                     !validationError;
  useEffect(() => {
    if (selectedListId && selectedListId !== 'none') {
      const list = savedLists.find(l => l.list_name === selectedListId);
      if (list) {
        setListPicks(list.picks);
        
        // Validate prediction count
        if (list.picks.length !== predictions) {
          setValidationError(
            `Selected list has ${list.picks.length} picks, but you need ${predictions} predictions. Please select a different list or adjust the number of predictions.`
          );
        } else {
          setValidationError('');
        }
      }
    } else {
      setListPicks([]);
      setValidationError('');
    }
  }, [selectedListId, predictions, savedLists]);

  // Replace the onCreate call with this:
  const handleCreateContest = async () => {
    if (!user) {
      toast.error('Please login to create challenge');
      return;
    }

    if (!isValidContestName || !hasValidList) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!gameEvent) {
      toast.error('No event selected');
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

      const totalCharge = entryFee + processingFee;
      const balance = currencyType === 'cash' ? profileData.sp_cash : profileData.sp_coins;
      
      if (balance < totalCharge) {
        toast.error(`Insufficient balance. You need ${totalCharge} ${currencyType === 'cash' ? 'SP Cash' : 'SP Coins'}`);
        return;
      }

      // Prepare picks data for database
      const picksData = listPicks.map(pick => ({
        player_prop_id: pick.prop.id,
        selection: pick.selection
      }));

      console.log('Creating contest with data:', {
        name: contestName.trim(),
        game_id: gameEvent.id,
        entry_fee: entryFee,
        currency_type: currencyType,
        picks_count: picksData.length
      });

      // Call database function
      const { data: contestId, error } = await supabase
        .rpc('create_contest_with_picks', {
          p_name: contestName.trim(),
          p_game_id: gameEvent.id,
          p_sport: 'MMA',
          p_league: 'MMA',
          p_entry_fee_cash: currencyType === 'cash' ? entryFee : 0,
          p_entry_fee_coins: currencyType === 'coins' ? entryFee : 0,
          p_processing_fee_cash: currencyType === 'cash' ? processingFee : 0,
          p_processing_fee_coins: currencyType === 'coins' ? processingFee : 0,
          p_currency_type: currencyType,
          p_num_predictions: predictions,
          p_max_players: players,
          p_created_by: user.id,
          p_list_name: selectedListId,
          p_user_sp_cash: profileData.sp_cash,
          p_user_sp_coins: profileData.sp_coins,
          p_charge_cash: currencyType === 'cash' ? totalCharge : 0,
          p_charge_coins: currencyType === 'coins' ? totalCharge : 0,
          p_picks: picksData
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Contest created with ID:', contestId);
      
      // Show success message
      toast.success(`Challenge "${contestName}" created successfully!`, {
        action: {
          label: 'View',
          onClick: () => {
            // You could add logic to scroll to or highlight the new contest
          }
        }
      });
      
      // Close modal first
      onClose();
      
      // Clear form for next use
      setContestName('');
      setSelectedListId('');
      setListPicks([]);
      setValidationError('');
      
      // Force refresh with a small delay to ensure database has processed
      setTimeout(() => {
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('refresh-contests'));
        
        // Also directly trigger fetch if we have access to it
        // This would require passing fetchContests as a prop or using context
      }, 500);
    } catch (error: any) {
      console.error('Error creating contest:', error);
      
      // More specific error messages
      if (error.message?.includes('already exists')) {
        toast.error('A challenge with this name already exists');
      } else if (error.message?.includes('balance')) {
        toast.error('Insufficient balance');
      } else {
        toast.error(error.message || 'Failed to create challenge');
      }
    }
  };

 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-xl bg-card border border-border shadow-elevated overflow-hidden max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-foreground">Create Challenge</h2>
              <p className="text-xs text-muted-foreground">Set up your prediction challenge</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Challenge Name */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
              <Trophy className="w-3.5 h-3.5" />
              CHALLENGE NAME
            </label>
            <Input
              type="text"
              value={contestName}
              onChange={(e) => setContestName(e.target.value)}
              placeholder="Enter challenge name"
              maxLength={50}
              className="h-9 text-sm"
            />
          </div>

          {/* Challenge Entry Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Coins className={`w-3.5 h-3.5 ${currencyColor}`} />
                ENTRY
              </label>
              <Badge variant="outline" className={`${currencyColor} text-xs`}>
                {formatNumber(entryFee)} {currencyLabel}
              </Badge>
            </div>
            <Slider
              value={[entryIndex]}
              onValueChange={([value]) => setEntryIndex(value)}
              min={0}
              max={entries.length - 1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span className={entryIndex === 0 ? currencyColor : ''}>{formatNumber(entries[0].entry)}</span>
              <span className={entryIndex === entries.length - 1 ? currencyColor : ''}>{formatNumber(entries[entries.length - 1].entry)}</span>
            </div>
          </div>


          {/* Sport Selection */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">
              SPORT
            </label>
            <div className="flex gap-2">
              {sports.map((sport) => (
                <Button
                  key={sport.id}
                  variant={selectedSport === sport.id ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => setSelectedSport(sport.id)}
                >
                  {sport.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Players & Predictions in row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Number of Players */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  PLAYERS
                </label>
                <span className="text-xs text-primary font-medium">{players}</span>
              </div>
              <div className="relative">
                <Slider
                  value={[players]}
                  onValueChange={([value]) => setPlayers(value)}
                  min={2}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 px-0.5">
                  {Array.from({ length: 9 }, (_, i) => i + 2).map((val) => (
                    <div key={val} className="flex flex-col items-center">
                      <div className={`w-0.5 h-1.5 ${players === val ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                      <span className={`text-[8px] ${players === val ? 'text-primary font-medium' : 'text-muted-foreground/60'}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Number of Predictions */}
           
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  NUMBER OF PREDICTIONS
                </label>
                <Badge variant="outline" className="text-primary">
                  {predictions} Predictions
                </Badge>
              </div>
              <Slider
                value={[predictions]}
                onValueChange={([value]) => setPredictions(value)}
                min={2}
                max={6}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>

          {/* Saved Picks Selection */}
          <div>
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                <Bookmark className="w-4 h-4" />
                SELECT YOUR SAVED LIST *
              </label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a saved list" />
                </SelectTrigger>
                <SelectContent>
                  {savedLists.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No saved lists yet</p>
                      <p className="text-xs mt-1">Go to Explore tab to create picks</p>
                    </div>
                  ) : (
                    <>
                      <SelectItem value="none">Select a list</SelectItem>
                      {savedLists.map((list) => (
                        <SelectItem key={list.list_name} value={list.list_name}>
                          {list.list_name} ({list.picks.length} picks)
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {savedLists.length === 0 && (
                <p className="text-xs text-destructive mt-2">
                  You must create a saved list before creating a challenge
                </p>
              )}
                {/* Validation Error Message */}
              {validationError && (
                <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {validationError}
                  </p>
                </div>
              )}
            </div>


          {/* Selected List Picks Display */}
         {listPicks.length > 0 && (
            <div className={`p-4 rounded-xl border ${
              listPicks.length === predictions 
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-destructive/10 border-destructive/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {savedLists.find(l => l.list_name === selectedListId)?.list_name || 'Selected Picks'}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{listPicks.length} picks</Badge>
                  {listPicks.length === predictions ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <Check className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      <X className="w-3 h-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {listPicks.map((pick, index) => (
                  <div key={pick.prop.id} className="flex items-center gap-2 text-sm p-2 bg-background/50 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-semibold shrink-0">
                      {index + 1}
                    </span>
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={pick.prop.player_image || ''} alt={pick.prop.player_name} />
                      <AvatarFallback className="text-[8px]">
                        <User className="w-2.5 h-2.5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className={pick.selection === 'over' ? 'text-green-500' : 'text-red-500'}>
                      {pick.selection === 'over' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pick.prop.player_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {pick.selection === 'over' ? '>' : '<'} {pick.prop.line} {formatPropType(pick.prop.prop_type)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {listPicks.length === 0 && selectedListId && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive">
                Please select a saved list to continue
              </p>
            </div>
          )}

          {/* Processing Fee & Prize Display */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Challenge Entry:</span>
                <span className={`text-sm font-semibold ${currencyColor}`}>
                  {formatNumber(entryFee)} {currencyLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Processing Fee:</span>
                <span className={`text-sm font-semibold ${currencyColor}`}>
                  {formatNumber(processingFee)} {currencyLabel}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total Charge:</span>
                <span className={`text-lg font-bold ${currencyColor}`}>
                  {formatNumber(entryFee + processingFee)} {currencyLabel}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Estimated Prize:</span>
                <span className={`text-lg font-bold ${currencyColor}`}>
                  {formatNumber(entryFee * players)} {currencyLabel}
                </span>
              </div>
            </div>

          {/* Create Button */}
          {/* <Button
            variant="hero"
            className="w-full gap-2"
            disabled={!isValidContestName || !hasValidList}
            onClick={() => {
              if (!hasValidList) {
                toast.error(`Please select a list with exactly ${predictions} predictions`);
                return;
              }
              onCreate({ 
                name: contestName.trim(), 
                predictions: predictions, // Use the slider value
                entryFee, 
                sport: selectedSport, 
                picks: listPicks, 
                players,
                listName: savedLists.find(l => l.list_name === selectedListId)?.list_name || 'My Picks'
              });
            }}
          > */}
          <Button
            variant="hero"
            className="w-full gap-2"
            disabled={!isValidContestName || !hasValidList}
            onClick={handleCreateContest}  // Changed from onCreate
          >
            <Coins className={`w-4 h-4 ${currencyColor}`} />
            Create Challenge - {formatNumber(entryFee + processingFee)} {currencyLabel}
          </Button>
        </CardContent>
      </motion.div>
    </div>
  );
};
