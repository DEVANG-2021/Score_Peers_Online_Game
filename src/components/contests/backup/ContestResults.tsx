import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, Coins, Calendar, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/contexts/CurrencyContext";

type ResultStatus = "win" | "loss" | "draw" | "pending";
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
  numPlayers: number;
  status: ResultStatus;
  picks: number;
  correctPicks: number;
  myPicks: Pick[];
  opponentName: string;
  opponentCorrectPicks: number;
  opponentPicks: Pick[];
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

export const ContestResults = () => {
  const [filter, setFilter] = useState<"win" | "loss" | "draw">("win");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { currencyType } = useCurrency();

  const isCash = currencyType === 'cash';
  const currencyLabel = isCash ? 'SP Cash' : 'SP Coins';
  const currencyColor = isCash ? 'text-emerald-400' : 'text-yellow-400';

  const filteredResults = mockResults.filter(r => r.status === filter);

  // Calculate total prize credits earned based on currency type
  const totalPrizeCredits = mockResults
    .filter(r => r.status === "win")
    .reduce((acc, r) => {
      const entry = isCash ? r.entryFeeCash : r.entryFeeCoins;
      const prize = entry * r.numPlayers;
      return acc + prize;
    }, 0);

  const stats = {
    totalChallenges: mockResults.length,
    wins: mockResults.filter(r => r.status === "win").length,
    losses: mockResults.filter(r => r.status === "loss").length,
    draws: mockResults.filter(r => r.status === "draw").length,
  };

  const topFinishRate = stats.totalChallenges > 0 
    ? Math.round((stats.wins / stats.totalChallenges) * 100) 
    : 0;

  const formatValue = (cashValue: number, coinsValue: number): string => {
    if (isCash) {
      return `${roundCash(cashValue).toLocaleString()} ${currencyLabel}`;
    }
    return `${roundCoins(coinsValue).toLocaleString()} ${currencyLabel}`;
  };

  const getEntryValue = (result: ContestResult): string => {
    return formatValue(result.entryFeeCash, result.entryFeeCoins);
  };

  const getPrizeValue = (result: ContestResult): string => {
    // Prize = Entry × Number of Players (no fee deductions)
    const cashPrize = result.entryFeeCash * result.numPlayers;
    const coinsPrize = result.entryFeeCoins * result.numPlayers;
    return formatValue(cashPrize, coinsPrize);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Top Finish Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{topFinishRate}%</p>
            <p className="text-xs text-muted-foreground">{stats.wins} Top Finishes · {stats.losses} Lower Finishes · {stats.draws}D</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className={`w-5 h-5 ${currencyColor}`} />
              <span className="text-sm text-muted-foreground">Total Prize Credits Earned</span>
            </div>
            <p className={`text-2xl font-bold ${currencyColor}`}>
              {isCash 
                ? roundCash(totalPrizeCredits).toLocaleString() 
                : roundCoins(totalPrizeCredits).toLocaleString()
              } {currencyLabel}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Challenges Entered</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalChallenges}</p>
          </CardContent>
        </Card>

      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
          <TabsTrigger value="win" className="text-emerald-400">Top Finishes</TabsTrigger>
          <TabsTrigger value="loss" className="text-red-400">Lower Finishes</TabsTrigger>
          <TabsTrigger value="draw" className="text-yellow-400">Draws</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results Table */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Challenge</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-right">Challenge Entry</TableHead>
                <TableHead className="text-right">Prize Credits Issued</TableHead>
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
                              <p className="text-xs text-muted-foreground">ID: {result.id}</p>
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
                          <span className="text-primary font-bold">{result.correctPicks * 10} Points</span>
                        </TableCell>
                        <TableCell className={`text-right ${currencyColor}`}>
                          {getEntryValue(result)}
                        </TableCell>
                        <TableCell className={`text-right ${currencyColor}`}>
                          {result.status === "win" ? getPrizeValue(result) : `0 ${currencyLabel}`}
                        </TableCell>
                      </TableRow>
                    
                      {isExpanded && (
                        <TableRow key={`${result.id}-details`} className="border-border/50 bg-muted/10">
                          <TableCell colSpan={5} className="p-0">
                          <div className="p-4 space-y-4">
                            {/* Score Summary */}
                            <div className="flex items-center justify-center gap-8 py-3 bg-background/50 rounded-lg">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">You</p>
                                <p className={`text-2xl font-bold ${result.correctPicks > result.opponentCorrectPicks ? 'text-emerald-400' : result.correctPicks < result.opponentCorrectPicks ? 'text-red-400' : 'text-yellow-400'}`}>
                                  {result.correctPicks * 10} Points
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

                            {/* Picks Comparison */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Your Picks */}
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  Your Picks
                                  <Badge variant="outline" className="text-xs">
                                    {result.correctPicks * 10} Points
                                  </Badge>
                                </h4>
                                <div className="space-y-2">
                                  {result.myPicks.map((pick) => (
                                    <div 
                                      key={pick.id}
                                      className={`flex items-center justify-between p-3 rounded-lg border ${
                                        pick.result === 'won' 
                                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                                          : pick.result === 'lost'
                                          ? 'bg-red-500/10 border-red-500/30'
                                          : 'bg-muted/20 border-border/50'
                                      }`}
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

                              {/* Opponent Picks */}
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  {result.opponentName}'s Picks
                                  <Badge variant="outline" className="text-xs">
                                    {result.opponentCorrectPicks * 10} Points
                                  </Badge>
                                </h4>
                                <div className="space-y-2">
                                  {result.opponentPicks.map((pick) => (
                                    <div 
                                      key={pick.id}
                                      className={`flex items-center justify-between p-3 rounded-lg border ${
                                        pick.result === 'won' 
                                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                                          : pick.result === 'lost'
                                          ? 'bg-red-500/10 border-red-500/30'
                                          : 'bg-muted/20 border-border/50'
                                      }`}
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
                          </div>
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
    </div>
  );
};
