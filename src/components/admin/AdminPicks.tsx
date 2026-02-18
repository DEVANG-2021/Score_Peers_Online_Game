import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Edit, Trash2, Calendar, Clock, User, Image, Search, RefreshCw, Upload, Send, Lock, Loader2, CheckCircle2, XCircle, AlertTriangle, Shield, Timer, Wifi, WifiOff, Trophy } from "lucide-react";

// Pick status types following the lifecycle
type PickStatus = "matches_imported" | "props_imported" | "waiting" | "settled";
type ApiSyncStatus = "connected" | "awaiting" | "error";
type SettlementResult = "win" | "loss" | "push" | null;
interface Pick {
  id: string;
  playerName: string;
  team: string;
  propType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  gameDate: string;
  gameTime: string;
  matchup: string;
  status: PickStatus;
  apiSyncStatus: ApiSyncStatus;
  contestCount: number;
  result: SettlementResult;
  actualValue?: number;
  overrideReason?: string;
}
interface Match {
  id: string;
  matchName: string;
  teamA: string;
  teamB: string;
  gameDate: string;
  gameTime: string;
  status: "upcoming" | "live" | "final";
}

// Mock data with new lifecycle statuses
const mockNFLPicks: Pick[] = [{
  id: "p1",
  playerName: "Patrick Mahomes",
  team: "KC",
  propType: "Passing Yards",
  line: 275.5,
  overOdds: -110,
  underOdds: -110,
  gameDate: "2024-12-15",
  gameTime: "16:30",
  matchup: "KC vs BUF",
  status: "matches_imported",
  apiSyncStatus: "connected",
  contestCount: 0,
  result: null
}, {
  id: "p2",
  playerName: "Travis Kelce",
  team: "KC",
  propType: "Receiving Yards",
  line: 65.5,
  overOdds: -115,
  underOdds: -105,
  gameDate: "2024-12-15",
  gameTime: "16:30",
  matchup: "KC vs BUF",
  status: "props_imported",
  apiSyncStatus: "connected",
  contestCount: 0,
  result: null
}, {
  id: "p3",
  playerName: "Josh Allen",
  team: "BUF",
  propType: "Passing Yards",
  line: 280.5,
  overOdds: -110,
  underOdds: -110,
  gameDate: "2024-12-15",
  gameTime: "16:30",
  matchup: "KC vs BUF",
  status: "waiting",
  apiSyncStatus: "connected",
  contestCount: 12,
  result: null
}, {
  id: "p4",
  playerName: "Stefon Diggs",
  team: "BUF",
  propType: "Receiving Yards",
  line: 78.5,
  overOdds: -110,
  underOdds: -110,
  gameDate: "2024-12-14",
  gameTime: "13:00",
  matchup: "KC vs BUF",
  status: "waiting",
  apiSyncStatus: "connected",
  contestCount: 8,
  result: null
}, {
  id: "p5",
  playerName: "Isiah Pacheco",
  team: "KC",
  propType: "Rushing Yards",
  line: 55.5,
  overOdds: -110,
  underOdds: -110,
  gameDate: "2024-12-13",
  gameTime: "20:15",
  matchup: "KC vs DEN",
  status: "waiting",
  apiSyncStatus: "awaiting",
  contestCount: 15,
  result: null
}, {
  id: "p6",
  playerName: "Davante Adams",
  team: "LV",
  propType: "Receiving Yards",
  line: 82.5,
  overOdds: -110,
  underOdds: -110,
  gameDate: "2024-12-12",
  gameTime: "20:15",
  matchup: "LV vs KC",
  status: "settled",
  apiSyncStatus: "connected",
  contestCount: 22,
  result: "win",
  actualValue: 95
}, {
  id: "p7",
  playerName: "Derrick Henry",
  team: "TEN",
  propType: "Rushing Yards",
  line: 100.5,
  overOdds: -105,
  underOdds: -115,
  gameDate: "2024-12-10",
  gameTime: "13:00",
  matchup: "TEN vs JAX",
  status: "settled",
  apiSyncStatus: "connected",
  contestCount: 18,
  result: "push",
  actualValue: 100
}];
const mockNBAPicks: Pick[] = [{
  id: "p8",
  playerName: "LeBron James",
  team: "LAL",
  propType: "Points",
  line: 25.5,
  overOdds: -110,
  underOdds: -110,
  gameDate: "2024-12-15",
  gameTime: "19:30",
  matchup: "LAL vs GSW",
  status: "waiting",
  apiSyncStatus: "connected",
  contestCount: 25,
  result: null
}, {
  id: "p9",
  playerName: "Stephen Curry",
  team: "GSW",
  propType: "3-Pointers Made",
  line: 4.5,
  overOdds: -120,
  underOdds: +100,
  gameDate: "2024-12-15",
  gameTime: "19:30",
  matchup: "LAL vs GSW",
  status: "props_imported",
  apiSyncStatus: "connected",
  contestCount: 0,
  result: null
}];
const mockUFCPicks: Pick[] = [{
  id: "p10",
  playerName: "Jon Jones",
  team: "",
  propType: "Significant Strikes",
  line: 45.5,
  overOdds: -110,
  underOdds: -110,
  gameDate: "2024-12-21",
  gameTime: "22:00",
  matchup: "Jones vs Miocic",
  status: "matches_imported",
  apiSyncStatus: "awaiting",
  contestCount: 0,
  result: null
}];
const mockNFLMatches: Match[] = [{
  id: "m1",
  matchName: "Chiefs vs Bills",
  teamA: "Kansas City Chiefs",
  teamB: "Buffalo Bills",
  gameDate: "2024-12-15",
  gameTime: "16:30",
  status: "upcoming"
}, {
  id: "m2",
  matchName: "49ers vs Seahawks",
  teamA: "San Francisco 49ers",
  teamB: "Seattle Seahawks",
  gameDate: "2024-12-15",
  gameTime: "20:20",
  status: "upcoming"
}];
const nflPropTypes = ["Passing Yards", "Rushing Yards", "Receiving Yards", "Receptions", "Touchdowns"];
const nbaPropTypes = ["Points", "Rebounds", "Assists", "3-Pointers Made", "Steals", "Blocks"];
const ufcPropTypes = ["Significant Strikes", "Takedowns", "Rounds", "Total Strikes"];
interface AdminPicksProps {
  sport: "nfl" | "nba" | "ufc";
}

// Status badge component
const StatusBadge = ({
  status
}: {
  status: PickStatus;
}) => {
  const config: Record<PickStatus, {
    label: string;
    className: string;
    icon: React.ReactNode;
  }> = {
    matches_imported: {
      label: "Matches Imported",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <Upload className="h-3 w-3" />
    },
    props_imported: {
      label: "Props Imported",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      icon: <Upload className="h-3 w-3" />
    },
    waiting: {
      label: "Wait for Results",
      className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      icon: <Loader2 className="h-3 w-3 animate-spin" />
    },
    settled: {
      label: "Settled",
      className: "bg-slate-300/10 text-slate-300 border-slate-300/20",
      icon: <CheckCircle2 className="h-3 w-3" />
    }
  };
  const {
    label,
    className,
    icon
  } = config[status];
  return <Badge variant="outline" className={`${className} gap-1.5 font-medium`}>
      {icon}
      {label}
    </Badge>;
};

// API Sync indicator component
const ApiSyncIndicator = ({
  status
}: {
  status: ApiSyncStatus;
}) => {
  const config: Record<ApiSyncStatus, {
    label: string;
    className: string;
    icon: React.ReactNode;
  }> = {
    connected: {
      label: "API Connected",
      className: "text-green-500",
      icon: <Wifi className="h-4 w-4" />
    },
    awaiting: {
      label: "Awaiting Data",
      className: "text-yellow-500",
      icon: <RefreshCw className="h-4 w-4 animate-spin" />
    },
    error: {
      label: "API Error",
      className: "text-red-500",
      icon: <WifiOff className="h-4 w-4" />
    }
  };
  const {
    label,
    className,
    icon
  } = config[status];
  return <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className={className}>{icon}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>;
};

// Result badge component
const ResultBadge = ({
  result,
  actualValue,
  line
}: {
  result: SettlementResult;
  actualValue?: number;
  line: number;
}) => {
  if (!result) return null;
  const config: Record<NonNullable<SettlementResult>, {
    label: string;
    className: string;
    icon: React.ReactNode;
  }> = {
    win: {
      label: "Win",
      className: "bg-green-500/10 text-green-500",
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    loss: {
      label: "Loss",
      className: "bg-red-500/10 text-red-500",
      icon: <XCircle className="h-3 w-3" />
    },
    push: {
      label: "Push",
      className: "bg-yellow-500/10 text-yellow-500",
      icon: <AlertTriangle className="h-3 w-3" />
    }
  };
  const {
    label,
    className,
    icon
  } = config[result];
  return <div className="flex flex-col gap-1">
      <Badge className={`${className} gap-1`}>
        {icon}
        {label}
      </Badge>
      {actualValue !== undefined && <span className="text-xs text-muted-foreground">
          Actual: {actualValue} (Line: {line})
        </span>}
    </div>;
};

// Countdown timer component
const CountdownTimer = ({
  gameDate,
  gameTime,
  status
}: {
  gameDate: string;
  gameTime: string;
  status: PickStatus;
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const calculateTimeLeft = () => {
      const gameDateTime = new Date(`${gameDate}T${gameTime}:00`);
      const now = new Date();
      const diff = gameDateTime.getTime() - now.getTime();
      if (diff <= 0) {
        return "Started";
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
      const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
      const seconds = Math.floor(diff % (1000 * 60) / 1000);
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      }
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [gameDate, gameTime]);
  if (["locked", "waiting", "settled", "overridden"].includes(status)) {
    return null;
  }
  return <div className="flex items-center gap-1.5 text-sm">
      <Timer className="h-3.5 w-3.5 text-muted-foreground" />
      <span className={timeLeft === "Started" ? "text-destructive font-medium" : "text-foreground font-mono"}>
        {timeLeft}
      </span>
    </div>;
};

// Check if pick is editable based on status
const isPickEditable = (status: PickStatus): boolean => {
  return status === "matches_imported" || status === "props_imported";
};
export const AdminPicks = ({
  sport
}: AdminPicksProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PickStatus | "all">("all");
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isPickModalOpen, setIsPickModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("picks");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedPicks, setSelectedPicks] = useState<string[]>([]);
  const picks = sport === "nfl" ? mockNFLPicks : sport === "nba" ? mockNBAPicks : mockUFCPicks;
  const propTypes = sport === "nfl" ? nflPropTypes : sport === "nba" ? nbaPropTypes : ufcPropTypes;
  const sportLabel = sport.toUpperCase();
  const isTeamSport = sport !== "ufc";
  const matches = mockNFLMatches;
  const filteredPicks = picks.filter(pick => {
    const matchesSearch = pick.playerName.toLowerCase().includes(searchQuery.toLowerCase()) || pick.propType.toLowerCase().includes(searchQuery.toLowerCase()) || pick.matchup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || pick.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count picks by status
  const statusCounts = picks.reduce((acc, pick) => {
    acc[pick.status] = (acc[pick.status] || 0) + 1;
    return acc;
  }, {} as Record<PickStatus, number>);
  const handleBulkPublish = () => {
    console.log("Publishing picks:", selectedPicks);
    setSelectedPicks([]);
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{sportLabel} Picks Management</h1>
          <p className="text-muted-foreground mt-1">Manage {sportLabel} player props through their lifecycle</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync from API
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["matches_imported", "props_imported", "waiting", "settled"] as PickStatus[]).map(status => <Card key={status} className={`bg-card border-border cursor-pointer transition-all hover:border-primary/50 ${statusFilter === status ? 'ring-2 ring-primary' : ''}`} onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-xl font-bold text-foreground">{statusCounts[status] || 0}</span>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="picks">Player Picks ({picks.length})</TabsTrigger>
          <TabsTrigger value="matches">{isTeamSport ? "Matches" : "Fights"} ({matches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="picks" className="mt-4 space-y-4">
          {/* Search & Filters */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search players, props, or matchups..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={val => setStatusFilter(val as PickStatus | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="matches_imported">Matches Imported</SelectItem>
                    <SelectItem value="props_imported">Props Imported</SelectItem>
                    <SelectItem value="waiting">Wait for Results</SelectItem>
                    <SelectItem value="settled">Settled</SelectItem>
                  </SelectContent>
                </Select>
                {selectedPicks.length > 0 && <Button onClick={handleBulkPublish} className="gap-2">
                    <Send className="h-4 w-4" />
                    Publish {selectedPicks.length} Picks
                  </Button>}
              </div>
            </CardContent>
          </Card>

          {/* Picks Table */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Player / Event</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-muted-foreground">Line</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Last Updated</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPicks.map(pick => <TableRow key={pick.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">{pick.playerName}</span>
                            <span className="text-sm text-muted-foreground">{pick.matchup}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pick.propType}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{pick.line}</TableCell>
                      <TableCell>
                        <StatusBadge status={pick.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        10:00 am
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {isPickEditable(pick.status) && <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Pick</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>}
                          {(pick.status === "settled" || pick.status === "waiting" || pick.apiSyncStatus === "error") && <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-red-500">
                                    <Shield className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Admin Override</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>}
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              
              
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">{isTeamSport ? "Matchup" : "Fight"}</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map(match => <TableRow key={match.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {match.teamA} vs {match.teamB}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {match.gameDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {match.gameTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={match.status === "upcoming" ? "bg-blue-500/10 text-blue-500" : match.status === "live" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}>
                          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};