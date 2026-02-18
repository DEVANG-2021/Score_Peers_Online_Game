import { useState,useEffect } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, Coins, Calendar, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


type ResultStatus = "win" | "loss" | "draw" | "pending"; // Changed from "won" to "win"
type PickResult = "won" | "lost" | "pending";

interface Pick {
  id: string;
  playerName: string;
  playerImage: string;
  homeTeam: string;
  awayTeam: string;
  propType: string;
  line: number;
  selection: "over" | "under";
  result: PickResult;
}

interface ContestResult {
  id: string;
  contestName: string;
  date: string;
  entryFeeCash: number;
  entryFeeCoins: number;
  prize_credits_cash: number;  // Add this
  prize_credits_coins: number;  // Add this
  numPlayers: number;
  status: ResultStatus;
  picks: number;
  correctPicks: number;
  myPicks: Pick[];
  opponentName: string;
  opponentCorrectPicks: number;
  opponentPicks: Pick[];
  myScore: number;  // Add this
}

// Rounding helpers
const roundCash = (value: number): number => Math.round(value / 5) * 5;
const roundCoins = (value: number): number => Math.round(value / 1000) * 1000;

// Mock MMA data with detailed picks
const mockResults: ContestResult[] = [
  { 
    id: "1", 
    contestName: "MMA 309 Main Event", 
    date: "2024-12-10", 
    entryFeeCash: 25, 
    entryFeeCoins: 10000,
    numPlayers: 2,
    status: "win", 
    picks: 4, 
    correctPicks: 4,
    opponentName: "FightFan_123",
    opponentCorrectPicks: 2,
    myPicks: [
      { id: "p1", playerName: "Jon Jones", playerImage: "", homeTeam: "Jones", awayTeam: "Miocic", propType: "significant_strikes", line: 45.5, selection: "over", result: "won" },
      { id: "p2", playerName: "Jon Jones", playerImage: "", homeTeam: "Jones", awayTeam: "Miocic", propType: "takedowns", line: 1.5, selection: "over", result: "won" },
      { id: "p3", playerName: "Stipe Miocic", playerImage: "", homeTeam: "Jones", awayTeam: "Miocic", propType: "total_strikes", line: 55.5, selection: "under", result: "won" },
      { id: "p4", playerName: "Islam Makhachev", playerImage: "", homeTeam: "Makhachev", awayTeam: "Poirier", propType: "round_line", line: 2.5, selection: "under", result: "won" },
    ],
    opponentPicks: [
      { id: "o1", playerName: "Jon Jones", playerImage: "", homeTeam: "Jones", awayTeam: "Miocic", propType: "takedowns", line: 2.5, selection: "over", result: "lost" },
      { id: "o2", playerName: "Stipe Miocic", playerImage: "", homeTeam: "Jones", awayTeam: "Miocic", propType: "significant_strikes", line: 35.5, selection: "over", result: "won" },
      { id: "o3", playerName: "Islam Makhachev", playerImage: "", homeTeam: "Makhachev", awayTeam: "Poirier", propType: "takedowns", line: 3.5, selection: "over", result: "won" },
      { id: "o4", playerName: "Dustin Poirier", playerImage: "", homeTeam: "Makhachev", awayTeam: "Poirier", propType: "total_strikes", line: 45.5, selection: "over", result: "lost" },
    ],
  },
  { 
    id: "2", 
    contestName: "MMA Fight Night", 
    date: "2024-12-08", 
    entryFeeCash: 50, 
    entryFeeCoins: 20000,
    numPlayers: 2,
    status: "loss", 
    picks: 4, 
    correctPicks: 1,
    opponentName: "MMAGuru99",
    opponentCorrectPicks: 3,
    myPicks: [
      { id: "p1", playerName: "Alex Pereira", playerImage: "", homeTeam: "Pereira", awayTeam: "Hill", propType: "significant_strikes", line: 35.5, selection: "over", result: "won" },
      { id: "p2", playerName: "Alex Pereira", playerImage: "", homeTeam: "Pereira", awayTeam: "Hill", propType: "round_line", line: 1.5, selection: "over", result: "lost" },
      { id: "p3", playerName: "Jamahal Hill", playerImage: "", homeTeam: "Pereira", awayTeam: "Hill", propType: "takedowns", line: 0.5, selection: "over", result: "lost" },
      { id: "p4", playerName: "Sean O'Malley", playerImage: "", homeTeam: "O'Malley", awayTeam: "Dvalishvili", propType: "total_strikes", line: 85.5, selection: "over", result: "lost" },
    ],
    opponentPicks: [
      { id: "o1", playerName: "Alex Pereira", playerImage: "", homeTeam: "Pereira", awayTeam: "Hill", propType: "round_line", line: 1.5, selection: "under", result: "won" },
      { id: "o2", playerName: "Jamahal Hill", playerImage: "", homeTeam: "Pereira", awayTeam: "Hill", propType: "significant_strikes", line: 15.5, selection: "under", result: "won" },
      { id: "o3", playerName: "Sean O'Malley", playerImage: "", homeTeam: "O'Malley", awayTeam: "Dvalishvili", propType: "takedowns", line: 0.5, selection: "under", result: "lost" },
      { id: "o4", playerName: "Merab Dvalishvili", playerImage: "", homeTeam: "O'Malley", awayTeam: "Dvalishvili", propType: "takedowns", line: 4.5, selection: "over", result: "won" },
    ],
  },
  { 
    id: "3", 
    contestName: "MMA 308 Co-Main", 
    date: "2024-12-05", 
    entryFeeCash: 10, 
    entryFeeCoins: 5000,
    numPlayers: 2,
    status: "draw", 
    picks: 4, 
    correctPicks: 2,
    opponentName: "OctagonKing",
    opponentCorrectPicks: 2,
    myPicks: [
      { id: "p1", playerName: "Charles Oliveira", playerImage: "", homeTeam: "Oliveira", awayTeam: "Gaethje", propType: "significant_strikes", line: 55.5, selection: "over", result: "won" },
      { id: "p2", playerName: "Charles Oliveira", playerImage: "", homeTeam: "Oliveira", awayTeam: "Gaethje", propType: "takedowns", line: 2.5, selection: "over", result: "lost" },
      { id: "p3", playerName: "Justin Gaethje", playerImage: "", homeTeam: "Oliveira", awayTeam: "Gaethje", propType: "total_strikes", line: 65.5, selection: "over", result: "won" },
      { id: "p4", playerName: "Justin Gaethje", playerImage: "", homeTeam: "Oliveira", awayTeam: "Gaethje", propType: "round_line", line: 2.5, selection: "over", result: "lost" },
    ],
    opponentPicks: [
      { id: "o1", playerName: "Charles Oliveira", playerImage: "", homeTeam: "Oliveira", awayTeam: "Gaethje", propType: "round_line", line: 2.5, selection: "under", result: "won" },
      { id: "o2", playerName: "Justin Gaethje", playerImage: "", homeTeam: "Oliveira", awayTeam: "Gaethje", propType: "takedowns", line: 0.5, selection: "under", result: "lost" },
      { id: "o3", playerName: "Charles Oliveira", playerImage: "", homeTeam: "Oliveira", awayTeam: "Gaethje", propType: "total_strikes", line: 75.5, selection: "under", result: "won" },
      { id: "o4", playerName: "Justin Gaethje", playerImage: "", homeTeam: "Oliveira", awayTeam: "Gaethje", propType: "significant_strikes", line: 45.5, selection: "over", result: "lost" },
    ],
  },
  { 
    id: "4", 
    contestName: "MMA 307 Card", 
    date: "2024-12-03", 
    entryFeeCash: 15, 
    entryFeeCoins: 5000,
    numPlayers: 2,
    status: "win", 
    picks: 4, 
    correctPicks: 4,
    opponentName: "CageFighter",
    opponentCorrectPicks: 1,
    myPicks: [
      { id: "p1", playerName: "Khamzat Chimaev", playerImage: "", homeTeam: "Chimaev", awayTeam: "Burns", propType: "takedowns", line: 2.5, selection: "over", result: "won" },
      { id: "p2", playerName: "Khamzat Chimaev", playerImage: "", homeTeam: "Chimaev", awayTeam: "Burns", propType: "significant_strikes", line: 55.5, selection: "over", result: "won" },
      { id: "p3", playerName: "Gilbert Burns", playerImage: "", homeTeam: "Chimaev", awayTeam: "Burns", propType: "total_strikes", line: 45.5, selection: "over", result: "won" },
      { id: "p4", playerName: "Gilbert Burns", playerImage: "", homeTeam: "Chimaev", awayTeam: "Burns", propType: "round_line", line: 2.5, selection: "over", result: "won" },
    ],
    opponentPicks: [
      { id: "o1", playerName: "Khamzat Chimaev", playerImage: "", homeTeam: "Chimaev", awayTeam: "Burns", propType: "round_line", line: 1.5, selection: "under", result: "lost" },
      { id: "o2", playerName: "Gilbert Burns", playerImage: "", homeTeam: "Chimaev", awayTeam: "Burns", propType: "takedowns", line: 1.5, selection: "over", result: "won" },
      { id: "o3", playerName: "Khamzat Chimaev", playerImage: "", homeTeam: "Chimaev", awayTeam: "Burns", propType: "total_strikes", line: 85.5, selection: "over", result: "lost" },
      { id: "o4", playerName: "Gilbert Burns", playerImage: "", homeTeam: "Chimaev", awayTeam: "Burns", propType: "significant_strikes", line: 55.5, selection: "over", result: "lost" },
    ],
  },
  { 
    id: "5", 
    contestName: "MMA Vegas Special", 
    date: "2024-12-01", 
    entryFeeCash: 25, 
    entryFeeCoins: 10000,
    numPlayers: 2,
    status: "loss", 
    picks: 4, 
    correctPicks: 1,
    opponentName: "FightNight",
    opponentCorrectPicks: 3,
    myPicks: [
      { id: "p1", playerName: "Belal Muhammad", playerImage: "", homeTeam: "Muhammad", awayTeam: "Edwards", propType: "takedowns", line: 3.5, selection: "over", result: "lost" },
      { id: "p2", playerName: "Belal Muhammad", playerImage: "", homeTeam: "Muhammad", awayTeam: "Edwards", propType: "significant_strikes", line: 65.5, selection: "over", result: "lost" },
      { id: "p3", playerName: "Leon Edwards", playerImage: "", homeTeam: "Muhammad", awayTeam: "Edwards", propType: "total_strikes", line: 85.5, selection: "over", result: "won" },
      { id: "p4", playerName: "Leon Edwards", playerImage: "", homeTeam: "Muhammad", awayTeam: "Edwards", propType: "round_line", line: 3.5, selection: "over", result: "lost" },
    ],
    opponentPicks: [
      { id: "o1", playerName: "Belal Muhammad", playerImage: "", homeTeam: "Muhammad", awayTeam: "Edwards", propType: "takedowns", line: 2.5, selection: "over", result: "won" },
      { id: "o2", playerName: "Leon Edwards", playerImage: "", homeTeam: "Muhammad", awayTeam: "Edwards", propType: "significant_strikes", line: 55.5, selection: "over", result: "won" },
      { id: "o3", playerName: "Belal Muhammad", playerImage: "", homeTeam: "Muhammad", awayTeam: "Edwards", propType: "round_line", line: 4.5, selection: "under", result: "won" },
      { id: "o4", playerName: "Leon Edwards", playerImage: "", homeTeam: "Muhammad", awayTeam: "Edwards", propType: "takedowns", line: 0.5, selection: "over", result: "lost" },
    ],
  },
  { 
    id: "6", 
    contestName: "MMA 306 Noche", 
    date: "2024-11-28", 
    entryFeeCash: 20, 
    entryFeeCoins: 10000,
    numPlayers: 2,
    status: "win", 
    picks: 4, 
    correctPicks: 3,
    opponentName: "NoCheFighter",
    opponentCorrectPicks: 2,
    myPicks: [
      { id: "p1", playerName: "Valentina Shevchenko", playerImage: "", homeTeam: "Shevchenko", awayTeam: "Grasso", propType: "significant_strikes", line: 75.5, selection: "over", result: "won" },
      { id: "p2", playerName: "Valentina Shevchenko", playerImage: "", homeTeam: "Shevchenko", awayTeam: "Grasso", propType: "takedowns", line: 1.5, selection: "over", result: "won" },
      { id: "p3", playerName: "Alexa Grasso", playerImage: "", homeTeam: "Shevchenko", awayTeam: "Grasso", propType: "total_strikes", line: 65.5, selection: "over", result: "won" },
      { id: "p4", playerName: "Alexa Grasso", playerImage: "", homeTeam: "Shevchenko", awayTeam: "Grasso", propType: "round_line", line: 4.5, selection: "under", result: "lost" },
    ],
    opponentPicks: [
      { id: "o1", playerName: "Valentina Shevchenko", playerImage: "", homeTeam: "Shevchenko", awayTeam: "Grasso", propType: "round_line", line: 4.5, selection: "over", result: "won" },
      { id: "o2", playerName: "Alexa Grasso", playerImage: "", homeTeam: "Shevchenko", awayTeam: "Grasso", propType: "takedowns", line: 0.5, selection: "under", result: "lost" },
      { id: "o3", playerName: "Valentina Shevchenko", playerImage: "", homeTeam: "Shevchenko", awayTeam: "Grasso", propType: "total_strikes", line: 85.5, selection: "under", result: "won" },
      { id: "o4", playerName: "Alexa Grasso", playerImage: "", homeTeam: "Shevchenko", awayTeam: "Grasso", propType: "significant_strikes", line: 45.5, selection: "over", result: "lost" },
    ],
  },
];

const getStatusBadge = (status: ResultStatus) => {
  switch (status) {
    case "win":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Top Score</Badge>;
    case "loss":
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Lower Finish</Badge>;
    case "draw":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draw</Badge>;
    case "pending":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Pending</Badge>;
  }
};

const getStatusIcon = (status: ResultStatus) => {
  switch (status) {
    case "win":
      return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    case "loss":
      return <TrendingDown className="w-5 h-5 text-red-400" />;
    case "draw":
      return <Minus className="w-5 h-5 text-yellow-400" />;
    case "pending":
      return <Calendar className="w-5 h-5 text-blue-400" />;
  }
};

const formatPropType = (propType: string) => {
  const labels: Record<string, string> = {
    'significant_strikes': 'Sig. Strikes',
    'total_strikes': 'Total Strikes',
    'round_line': 'Round Line',
    'takedowns': 'Takedowns',
  };
  return labels[propType] || propType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const PickResultIcon = ({ result }: { result: PickResult }) => {
  if (result === "won") {
    return <Check className="w-4 h-4 text-emerald-400" />;
  } else if (result === "lost") {
    return <X className="w-4 h-4 text-red-400" />;
  }
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

// Expanded Result Details Component with username tabs for desktop
const ExpandedResultDetails = ({ result }: { result: ContestResult }) => {
  const [activeTab, setActiveTab] = useState<'you' | 'opponent'>('you');

  const activePicks = activeTab === 'you' ? result.myPicks : result.opponentPicks;
  const activeCorrectPicks = activeTab === 'you' ? result.correctPicks : result.opponentCorrectPicks;
  
  

  return (
    <div className="p-4 space-y-4">
      {/* Score Summary */}
      <div className="flex items-center justify-center gap-8 py-3 bg-background/50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">You</p>
          <p className={`text-2xl font-bold ${result.correctPicks > result.opponentCorrectPicks ? 'text-emerald-400' : result.correctPicks < result.opponentCorrectPicks ? 'text-red-400' : 'text-yellow-400'}`}>
            {result.myScore} Points
          </p>
          <p className="text-xs text-muted-foreground">{result.correctPicks}/{result.picks} correct</p>
        </div>
        <div className="text-2xl font-bold text-muted-foreground">vs</div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">{result.opponentName}</p>
          <p className={`text-2xl font-bold ${result.opponentCorrectPicks > result.correctPicks ? 'text-emerald-400' : result.opponentCorrectPicks < result.correctPicks ? 'text-red-400' : 'text-yellow-400'}`}>
            {result.opponentCorrectPicks * 10} Points
          </p>
          <p className="text-xs text-muted-foreground">{result.opponentCorrectPicks}/{result.picks} correct</p>
        </div>
      </div>

      {/* Username Tabs */}
      <div className="flex gap-2 max-w-md mx-auto">
        <button
          onClick={(e) => { e.stopPropagation(); setActiveTab('you'); }}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'you'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          Your Picks
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setActiveTab('opponent'); }}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'opponent'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          {result.opponentName}
        </button>
      </div>

      {/* Picks List */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">
            {activeTab === 'you' ? 'Your Picks' : `${result.opponentName}'s Picks`}
          </h4>
          <Badge variant="outline" className="text-xs">
            {activeCorrectPicks}/{result.picks} Correct • {activeCorrectPicks * 10} Points
          </Badge>
        </div>
        <div className="space-y-2">
          {activePicks.map((pick) => (
            <div 
              key={pick.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                pick.result === 'won' 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : pick.result === 'lost'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-muted/20 border-border/50'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={pick.playerImage} 
                    alt={pick.playerName}
                    className="w-10 h-10 rounded-full object-cover bg-muted"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  {pick.result === 'won' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  {pick.result === 'lost' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{pick.playerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPropType(pick.propType)} {pick.selection.toUpperCase()} {pick.line}
                  </p>
                  <p className="text-xs text-primary">
                    {pick.awayTeam} @ {pick.homeTeam}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs font-bold ${
                  pick.result === 'won' 
                    ? 'border-emerald-500/50 text-emerald-400' 
                    : pick.result === 'lost'
                    ? 'border-red-500/50 text-red-400'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {pick.result === 'won' ? '+10 Points' : pick.result === 'lost' ? '0 Points' : 'PENDING'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Result Detail Dialog Component with username tabs
const ResultDetailDialog = ({
  selectedResult,
  setSelectedResult,
  currencyColor,
  getPrizeValue,
}: {
  selectedResult: ContestResult | null;
  setSelectedResult: (result: ContestResult | null) => void;
  currencyColor: string;
  getPrizeValue: (result: ContestResult) => string;
}) => {
  const [activeTab, setActiveTab] = useState<'you' | 'opponent'>('you');

  if (!selectedResult) return null;

  const activePicks = activeTab === 'you' ? selectedResult.myPicks : selectedResult.opponentPicks;
  const activeCorrectPicks = activeTab === 'you' ? selectedResult.correctPicks : selectedResult.opponentCorrectPicks;

  return (
    <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
      <DialogContent className="max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(selectedResult.status)}
            <DialogTitle className="text-base">{selectedResult.contestName}</DialogTitle>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(selectedResult.status)}
            <span className="text-xs text-muted-foreground">{selectedResult.date}</span>
            <span className={`text-xs font-medium ml-auto ${currencyColor}`}>
              Prize: {selectedResult.status === "win" ? getPrizeValue(selectedResult) : "0"}
            </span>
          </div>
        </DialogHeader>

        {/* Score Summary */}
        <div className="flex items-center justify-center gap-6 py-3 bg-muted/30 rounded-lg mb-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">You</p>
            <p className={`text-xl font-bold ${selectedResult.correctPicks > selectedResult.opponentCorrectPicks ? 'text-emerald-400' : selectedResult.correctPicks < selectedResult.opponentCorrectPicks ? 'text-red-400' : 'text-yellow-400'}`}>
              {selectedResult.correctPicks * 10}
            </p>
            <p className="text-[10px] text-muted-foreground">{selectedResult.correctPicks}/{selectedResult.picks}</p>
          </div>
          <div className="text-lg font-bold text-muted-foreground">vs</div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5 truncate max-w-[80px]">{selectedResult.opponentName}</p>
            <p className={`text-xl font-bold ${selectedResult.opponentCorrectPicks > selectedResult.correctPicks ? 'text-emerald-400' : selectedResult.opponentCorrectPicks < selectedResult.correctPicks ? 'text-red-400' : 'text-yellow-400'}`}>
              {selectedResult.opponentCorrectPicks * 10}
            </p>
            <p className="text-[10px] text-muted-foreground">{selectedResult.opponentCorrectPicks}/{selectedResult.picks}</p>
          </div>
        </div>

        {/* Username Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('you')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'you'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Your Picks
          </button>
          <button
            onClick={() => setActiveTab('opponent')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all truncate ${
              activeTab === 'opponent'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {selectedResult.opponentName}
          </button>
        </div>

        {/* Picks List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">
              {activeTab === 'you' ? 'Your Picks' : `${selectedResult.opponentName}'s Picks`}
            </h4>
            <Badge variant="outline" className="text-xs">
              {activeCorrectPicks}/{selectedResult.picks} Correct
            </Badge>
          </div>
          <div className="space-y-2">
            {activePicks.map((pick) => (
              <div 
                key={pick.id}
                className={`p-3 rounded-lg border text-sm ${
                  pick.result === 'won' 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {pick.result === 'won' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className="font-medium text-foreground">{pick.playerName}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      pick.result === 'won' 
                        ? 'border-emerald-500/50 text-emerald-400' 
                        : 'border-red-500/50 text-red-400'
                    }`}
                  >
                    {pick.result === 'won' ? '+10' : '0'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 pl-6">
                  {formatPropType(pick.propType)} {pick.selection === 'over' ? '↑' : '↓'} {pick.line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ContestResults = () => {
  const [filter, setFilter] = useState<"win" | "loss" | "draw">("win");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ContestResult | null>(null);
  const { currencyType } = useCurrency();

  const isCash = currencyType === 'cash';
  const currencyLabel = isCash ? 'SP Cash' : 'SP Coins';
  const currencyColor = isCash ? 'text-emerald-400' : 'text-yellow-400';

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ContestResult[]>([]);
  const [createdChallenges, setCreatedChallenges] = useState<number>(0);
  useEffect(() => {
    const fetchCreatedChallenges = async () => {
      if (!user) return;
      
      try {
        const { data: createdContests, error } = await supabase
          .from('contests')
          .select('id')
          .eq('created_by', user.id);
        
        if (error) {
          console.error('Error fetching created challenges:', error);
          return;
        }
        
        setCreatedChallenges(createdContests?.length || 0);
      } catch (error) {
        console.error('Error fetching created challenges:', error);
      }
    };
    
    fetchCreatedChallenges();
  }, [user]);

  // Filter results based on currency type AND filter status
  const filteredResults = results.filter(r => {
    // Check currency type
    const isCashContest = r.entryFeeCash > 0;
    const matchesCurrency = (isCash && isCashContest) || (!isCash && !isCashContest);
    
    // Check status - fix the status comparison
    let statusMatch = false;
    if (filter === "win") {
      statusMatch = r.status === "win";
    } else if (filter === "loss") {
      statusMatch = r.status === "loss";
    } else if (filter === "draw") {
      statusMatch = r.status === "draw";
    }
    
    return matchesCurrency && statusMatch;
  });

  console.log('Filtered Results:', filteredResults);
  const currencyFilteredResults = results.filter(r => {
    const isCashContest = r.entryFeeCash > 0;
    return (isCash && isCashContest) || (!isCash && !isCashContest);
  });

  // Calculate total prize credits earned based on currency type
   const totalPrizeCredits = currencyFilteredResults
    .filter(r => r.status === "win")
    .reduce((acc, r) => {
      const prize = isCash ? r.prize_credits_cash || 0 : r.prize_credits_coins || 0;
      return acc + prize;
    }, 0);

  // Stats based on currency filtered results
  const stats = {
    totalChallenges: currencyFilteredResults.length,
    wins: currencyFilteredResults.filter(r => r.status === "win").length,
    losses: currencyFilteredResults.filter(r => r.status === "loss").length,
    draws: currencyFilteredResults.filter(r => r.status === "draw").length,
  };

  const topFinishRate = stats.totalChallenges > 0 
    ? Math.round((stats.wins / stats.totalChallenges) * 100) 
    : 0;


  const formatValue = (cashValue: number, coinsValue: number): string => {
    if (isCash) {
      return `${roundCash(cashValue).toLocaleString()} SP Cash`;
    }
    return `${roundCoins(coinsValue).toLocaleString()} SP Coins`;
  };

  const getEntryValue = (result: ContestResult): string => {
    return formatValue(result.entryFeeCash, result.entryFeeCoins);
  };

  const getPrizeValue = (result: ContestResult): string => {
    // Use the actual prize credits from database
    const prizeCash = result.prize_credits_cash || 0;
    const prizeCoins = result.prize_credits_coins || 0;
    
    if (isCash) {
      return `${roundCash(prizeCash).toLocaleString()} SP Cash`;
    }
    return `${roundCoins(prizeCoins).toLocaleString()} SP Coins`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        fetchContestResults(session.user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, [currencyType]); 

  const fetchContestResults = async (userId: string) => {
  setLoading(true);
  try {
    console.log('Fetching contest results for user:', userId);
    
    // Fetch only settled contests where user participated
    const { data: userEntries, error } = await supabase
      .from('contest_entries')
      .select(`
        id,
        contest_id,
        user_id,
        list_name,
        score,
        rank,
        is_winner,
        prize_credits_cash,
        prize_credits_coins,
        contests!inner(
          id,
          name,
          entry_fee_cash,
          entry_fee_coins,
          currency_type,
          max_players,
          admin_state,
          user_state,
          created_at,
          created_by
        ),
        contest_entry_picks(
          id,
          selection,
          points,
          is_correct,
          player_props(
            id,
            player_name,
            player_image,
            prop_type,
            line,
            score,
            fights(
              fighter_a,
              fighter_b
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('contests.admin_state', 'settled')
      .eq('contests.user_state', 'completed')
      .order('created_at', { ascending: false, foreignTable: 'contests' });

    if (error) {
      console.error('Error fetching contest results:', error);
      throw error;
    }

    console.log('User Entries found:', userEntries?.length || 0);

    if (!userEntries || userEntries.length === 0) {
      console.log('No settled contests found');
      setResults([]);
      setLoading(false);
      return;
    }

    // For each contest, fetch opponent data
    const transformedResults: ContestResult[] = await Promise.all(
      userEntries.map(async (entry) => {
        console.log('Processing entry:', entry.id, 'for contest:', entry.contests.name);
        
        // First, get opponent entry
        const { data: opponentEntries } = await supabase
          .from('contest_entries')
          .select(`
            id,
            user_id,
            score,
            is_winner,
            contest_entry_picks(
              id,
              selection,
              points,
              is_correct,
              player_props(
                id,
                player_name,
                player_image,
                prop_type,
                line,
                score,
                fights(fighter_a, fighter_b)
              )
            )
          `)
          .eq('contest_id', entry.contest_id)
          .neq('user_id', userId)
          .limit(1);

        const opponentEntry = opponentEntries?.[0];
        
        // Get opponent username separately
        let opponentUsername = 'No opponent';
        if (opponentEntry?.user_id) {
          const { data: opponentProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', opponentEntry.user_id)
            .single();
          
          opponentUsername = opponentProfile?.username || 'Unknown';
        }

        // Transform user's picks
        const myPicks: Pick[] = (entry.contest_entry_picks || []).map(pick => {
          // Handle null player_props
          const playerProps = pick.player_props || {};
          const fights = playerProps.fights || {};
          
          return {
            id: pick.id,
            playerName: playerProps.player_name || 'Unknown Player',
            playerImage: playerProps.player_image || '',
            homeTeam: fights.fighter_a || '',
            awayTeam: fights.fighter_b || '',
            propType: playerProps.prop_type || '',
            line: playerProps.line || 0,
            selection: (pick.selection as 'over' | 'under') || 'over',
            result: pick.is_correct === true ? 'won' : pick.is_correct === false ? 'lost' : 'pending'
          };
        });

        // Transform opponent picks
        const opponentPicks: Pick[] = (opponentEntry?.contest_entry_picks || []).map(pick => {
          const playerProps = pick.player_props || {};
          const fights = playerProps.fights || {};
          
          return {
            id: pick.id,
            playerName: playerProps.player_name || 'Unknown Player',
            playerImage: playerProps.player_image || '',
            homeTeam: fights.fighter_a || '',
            awayTeam: fights.fighter_b || '',
            propType: playerProps.prop_type || '',
            line: playerProps.line || 0,
            selection: (pick.selection as 'over' | 'under') || 'over',
            result: pick.is_correct === true ? 'won' : pick.is_correct === false ? 'lost' : 'pending'
          };
        });

        const correctPicks = myPicks.filter(p => p.result === 'won').length;
        const opponentCorrectPicks = opponentPicks.filter(p => p.result === 'won').length;

        // Determine status based on scores
        let status: ResultStatus = 'pending';
        
        if (!opponentEntry) {
          status = 'pending';
        } else {
          const myScore = entry.score || 0;
          const opponentScore = opponentEntry.score || 0;
         console.log(`Comparing scores: ${myScore} vs ${opponentScore}`);
          if (myScore > opponentScore) {
            status = 'win';
          } else if (myScore < opponentScore) {
            status = 'loss';
          } else {
            status = 'draw';
          }
        }

        console.log(`Entry ${entry.id}: ${status}, Score: ${entry.score}, Opponent Score: ${opponentEntry?.score}`);

        return {
          id: entry.contest_id,
          contestName: entry.contests.name,
          date: new Date(entry.contests.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          entryFeeCash: entry.contests.entry_fee_cash || 0,
          entryFeeCoins: entry.contests.entry_fee_coins || 0,
          prize_credits_cash: entry.prize_credits_cash || 0,
          prize_credits_coins: entry.prize_credits_coins || 0,
          numPlayers: entry.contests.max_players,
          status,
          picks: myPicks.length,
          correctPicks,
          myPicks,
          opponentName: opponentUsername,
          opponentCorrectPicks,
          opponentPicks,
          myScore: entry.score || 0
        };
      })
    );

    console.log('Transformed results:', transformedResults);
    setResults(transformedResults);
    console.log("results:",results);
  } catch (error) {
    console.error('Error fetching contest results:', error);
    toast.error('Failed to load results');
    // Fallback to mock data for testing
    console.log('Using mock data as fallback');
    setResults(mockResults);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  } else if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Please login to view your results</p>
      </div>
    );
  } else {
    return (
    
    <div className="space-y-4 sm:space-y-6 mb-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" />
              <span className="text-[10px] sm:text-sm text-muted-foreground hidden sm:inline">Top Finish Rate</span>
              <span className="text-[10px] sm:text-sm text-muted-foreground sm:hidden">Rate</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{topFinishRate}%</p>
            <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">
              {stats.wins}W · {stats.losses}L · {stats.draws}D
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <Coins className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${currencyColor}`} />
              <span className="text-[10px] sm:text-sm text-muted-foreground hidden sm:inline">Prize Credits</span>
              <span className="text-[10px] sm:text-sm text-muted-foreground sm:hidden">Earned</span>
            </div>
            <p className={`text-sm sm:text-2xl font-bold ${currencyColor}`}>
              {isCash 
                ? roundCash(totalPrizeCredits).toLocaleString() 
                : roundCoins(totalPrizeCredits).toLocaleString()
              }
            </p>
            <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">{currencyLabel}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-muted-foreground" />
              <span className="text-[10px] sm:text-sm text-muted-foreground hidden sm:inline">Created</span>
              <span className="text-[10px] sm:text-sm text-muted-foreground sm:hidden">Created</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{createdChallenges}</p>
            <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">Challenges</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto h-auto p-1">
          <TabsTrigger value="win" className="text-emerald-400 text-xs sm:text-sm py-2">
            <span className="hidden sm:inline">Top Finishes</span>
            <span className="sm:hidden">Wins</span>
          </TabsTrigger>
          <TabsTrigger value="loss" className="text-red-400 text-xs sm:text-sm py-2">
            <span className="hidden sm:inline">Lower Finishes</span>
            <span className="sm:hidden">Losses</span>
          </TabsTrigger>
          <TabsTrigger value="draw" className="text-yellow-400 text-xs sm:text-sm py-2">Draws</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results Table - Desktop */}
      <Card className="bg-card/50 border-border/50 hidden sm:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Challenge</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Prize</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredResults.map((result) => {
                  const isExpanded = expandedId === result.id;
                  
                  return (
                    <>
                      <TableRow 
                        key={result.id} 
                        className="border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleExpand(result.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <p className="font-medium text-foreground">{result.contestName}</p>
                              <p className="text-xs text-muted-foreground">{result.date}</p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground ml-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(result.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-primary font-bold">{result.myScore} Pts</span>
                        </TableCell>
                        <TableCell className={`text-right ${currencyColor}`}>
                          {getEntryValue(result)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${currencyColor}`}>
                          {result.status === "win" || result.status === "draw" 
                            ? getPrizeValue(result) 
                            : `0 ${currencyLabel}`}
                        </TableCell>
                      </TableRow>
                    
                      {isExpanded && (
                        <TableRow key={`${result.id}-details`} className="border-border/50 bg-muted/10">
                          <TableCell colSpan={5} className="p-0">
                            <ExpandedResultDetails result={result} />
                          </TableCell>
                        </TableRow>
                      )}
                  </>
                );
              })}
            </TableBody>
          </Table>

          {filteredResults.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No results found for this filter.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Cards - Mobile */}
      {/* <div className="sm:hidden space-y-2">
        {filteredResults.map((result) => (
          <Card 
            key={result.id} 
            className="bg-card/50 border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setSelectedResult(result)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getStatusIcon(result.status)}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-xs truncate">{result.contestName}</p>
                    <p className="text-[9px] text-muted-foreground">{result.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {getStatusBadge(result.status)}
                  <span className="text-primary font-bold text-xs">{result.myScore} pts</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Entry: {getEntryValue(result)}</span>
                <span className={`font-semibold ${currencyColor}`}>
                  Prize: {result.status === "win" || result.status === "draw" 
                    ? getPrizeValue(result) 
                    : `0 ${currencyLabel}`}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredResults.length === 0 && (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No results found for this filter.
          </div>
        )}
      </div> */}

      {/* Result Detail Popup */}
      <ResultDetailDialog 
        selectedResult={selectedResult}
        setSelectedResult={setSelectedResult}
        currencyColor={currencyColor}
        getPrizeValue={getPrizeValue}
      />
    </div>
  );
  }
};
