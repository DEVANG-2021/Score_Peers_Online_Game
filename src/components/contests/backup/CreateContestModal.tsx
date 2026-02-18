import { useState } from "react";
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
  const [predictions, setPredictions] = useState(savedPicks.length || 3);
  const [players, setPlayers] = useState(2);
  const [entryIndex, setEntryIndex] = useState(0);
  const [selectedSport, setSelectedSport] = useState('mma');
  const [selectedListId, setSelectedListId] = useState<string>('');
  const { currencyType } = useCurrency();

  const entries = currencyType === 'coins' ? spCoinsEntries : spCashEntries;
  const currentEntry = entries[entryIndex];
  const entryFee = currentEntry.entry;
  const processingFee = currentEntry.fee;
  const estimatedPrize = entryFee * players;

  const selectedList = savedLists.find(l => l.id === selectedListId);
  const displayPicks = selectedList ? selectedList.picks : savedPicks;

  if (!isOpen) return null;

  const currencyLabel = currencyType === 'coins' ? 'SP Coins' : 'SP Cash';
  const currencyColor = currencyType === 'coins' ? 'text-yellow-500' : 'text-success';

  const isValidContestName = contestName.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-elevated overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Set Up Your Challenge</h2>
              <p className="text-sm text-muted-foreground">Create your prediction challenge</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Challenge Name */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4" />
              CHALLENGE NAME
            </label>
            <Input
              type="text"
              value={contestName}
              onChange={(e) => setContestName(e.target.value)}
              placeholder="Enter challenge name"
              maxLength={50}
            />
          </div>

          {/* Challenge Entry Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Coins className={`w-4 h-4 ${currencyColor}`} />
                CHALLENGE ENTRY
              </label>
              <Badge variant="outline" className={currencyColor}>
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
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              {entries.map((e, i) => (
                <span key={i} className={entryIndex === i ? currencyColor : ''}>
                  {formatNumber(e.entry)}
                </span>
              ))}
            </div>
          </div>


          {/* Sport Selection */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-3 block">
              SELECT SPORT
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sports.map((sport) => (
                <Button
                  key={sport.id}
                  variant={selectedSport === sport.id ? "default" : "outline"}
                  className="h-auto py-3"
                  onClick={() => setSelectedSport(sport.id)}
                >
                  <span className="text-sm">{sport.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Number of Players */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                NUMBER OF PLAYERS
              </label>
              <Badge variant="outline" className="text-primary">
                {players} Players
              </Badge>
            </div>
            <Slider
              value={[players]}
              onValueChange={([value]) => setPlayers(value)}
              min={2}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10</span>
            </div>
          </div>

          {/* Number of Predictions */}
          <div>
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
              SAVED PICKS (OPTIONAL)
            </label>
            <Select value={selectedListId} onValueChange={setSelectedListId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a saved list (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No list selected</SelectItem>
                {savedLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name} ({list.picks.length} picks)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {savedLists.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">No saved lists yet. Create picks in Explore tab.</p>
            )}
          </div>

          {/* Selected List Picks Display */}
          {displayPicks.length > 0 && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {selectedList ? selectedList.name : 'Selected Picks'}
                </h4>
                <Badge variant="secondary">{displayPicks.length} picks</Badge>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {displayPicks.map((pick) => (
                  <div key={pick.prop.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={pick.prop.player_image || ''} alt={pick.prop.player_name} />
                      <AvatarFallback className="text-[8px]">
                        <User className="w-2.5 h-2.5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className={pick.selection === 'over' ? 'text-green-500' : 'text-red-500'}>
                      {pick.selection === 'over' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </span>
                    <span className="font-medium">{pick.prop.player_name}</span>
                    <span className="text-muted-foreground">
                      {pick.selection === 'over' ? '>' : '<'} {pick.prop.line} {formatPropType(pick.prop.prop_type)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Fee & Prize Display */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processing Fee:</span>
              <span className={`text-sm font-semibold ${currencyColor}`}>
                {formatNumber(processingFee)} {currencyLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated Challenge Prize:</span>
              <span className={`text-lg font-bold ${currencyColor}`}>
                {formatNumber(estimatedPrize)} {currencyLabel}
              </span>
            </div>
          </div>

          {/* Create Button */}
          <Button
            variant="hero"
            className="w-full gap-2"
            disabled={!isValidContestName}
            onClick={() => onCreate({ name: contestName.trim(), predictions: displayPicks.length || predictions, entryFee, sport: selectedSport, picks: displayPicks, players })}
          >
            <Coins className={`w-4 h-4 ${currencyColor}`} />
            Create Challenge - {formatNumber(entryFee)} {currencyLabel}
          </Button>
        </CardContent>
      </motion.div>
    </div>
  );
};
