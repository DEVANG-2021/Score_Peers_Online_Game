import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Check,
  X,
  DollarSign,
  Trophy,
  RefreshCw,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Pick {
  id: string;
  playerName: string;
  playerImage?: string;
  homeTeam?: string;
  awayTeam?: string;
  propType: string;
  line: number;
  selection: "over" | "under";
  result: "won" | "lost" | "pending";
}

interface Dispute {
  id: string;
  contestId: string;
  contestName: string;
  filedBy: string;
  reason: string;
  status: "open" | "settled";
  createdAt: string;
  entryFee: number;
  players: {
    name: string;
    picks: Pick[];
    correctPicks: number;
  }[];
}

const mockDisputes: Dispute[] = [
  {
    id: "DIS-001",
    contestId: "CTX-004",
    contestName: "NBA Sunday Showdown",
    filedBy: "unlucky_pete",
    reason: "The pick for Patrick Mahomes passing yards was marked as a loss, but he actually threw for 285 yards which should have been over the 275.5 line.",
    status: "open",
    createdAt: "2024-12-14",
    entryFee: 25,
    players: [
      {
        name: "unlucky_pete",
        correctPicks: 3,
        picks: [
          { id: "p1", playerName: "LeBron James", playerImage: "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png", homeTeam: "LAL", awayTeam: "GSW", propType: "points", line: 25.5, selection: "over", result: "won" },
          { id: "p2", playerName: "Stephen Curry", playerImage: "https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png", homeTeam: "GSW", awayTeam: "LAL", propType: "threes", line: 4.5, selection: "over", result: "won" },
          { id: "p3", playerName: "Kevin Durant", playerImage: "https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png", homeTeam: "PHX", awayTeam: "DEN", propType: "rebounds", line: 6.5, selection: "under", result: "lost" },
          { id: "p4", playerName: "Luka Doncic", playerImage: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png", homeTeam: "DAL", awayTeam: "MIA", propType: "assists", line: 8.5, selection: "over", result: "won" },
        ],
      },
      {
        name: "sharp_bettor",
        correctPicks: 4,
        picks: [
          { id: "o1", playerName: "LeBron James", playerImage: "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png", homeTeam: "LAL", awayTeam: "GSW", propType: "assists", line: 7.5, selection: "under", result: "won" },
          { id: "o2", playerName: "Stephen Curry", playerImage: "https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png", homeTeam: "GSW", awayTeam: "LAL", propType: "points", line: 28.5, selection: "over", result: "won" },
          { id: "o3", playerName: "Kevin Durant", playerImage: "https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png", homeTeam: "PHX", awayTeam: "DEN", propType: "points", line: 27.5, selection: "over", result: "won" },
          { id: "o4", playerName: "Luka Doncic", playerImage: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png", homeTeam: "DAL", awayTeam: "MIA", propType: "rebounds", line: 9.5, selection: "over", result: "won" },
        ],
      },
    ],
  },
  {
    id: "DIS-002",
    contestId: "CTX-002",
    contestName: "NFL Prime Time",
    filedBy: "new_player",
    reason: "The contest ended 2 days ago but the winnings haven't been credited to my account yet.",
    status: "open",
    createdAt: "2024-12-13",
    entryFee: 50,
    players: [
      {
        name: "new_player",
        correctPicks: 2,
        picks: [
          { id: "p1", playerName: "Patrick Mahomes", propType: "passing_yards", line: 275.5, selection: "over", result: "won" },
          { id: "p2", playerName: "Travis Kelce", propType: "receptions", line: 5.5, selection: "over", result: "lost" },
          { id: "p3", playerName: "Tyreek Hill", propType: "receiving_yards", line: 85.5, selection: "over", result: "lost" },
          { id: "p4", playerName: "Josh Allen", propType: "rushing_yards", line: 35.5, selection: "over", result: "won" },
        ],
      },
      {
        name: "bet_master",
        correctPicks: 3,
        picks: [
          { id: "o1", playerName: "Patrick Mahomes", propType: "touchdowns", line: 2.5, selection: "over", result: "won" },
          { id: "o2", playerName: "Travis Kelce", propType: "receiving_yards", line: 65.5, selection: "under", result: "won" },
          { id: "o3", playerName: "Tyreek Hill", propType: "receptions", line: 6.5, selection: "under", result: "lost" },
          { id: "o4", playerName: "Josh Allen", propType: "passing_yards", line: 250.5, selection: "over", result: "won" },
        ],
      },
    ],
  },
  {
    id: "DIS-003",
    contestId: "CTX-001",
    contestName: "MLB Weekend Special",
    filedBy: "sports_guru",
    reason: "The app crashed while I was submitting my picks.",
    status: "settled",
    createdAt: "2024-12-12",
    entryFee: 10,
    players: [
      {
        name: "sports_guru",
        correctPicks: 2,
        picks: [
          { id: "p1", playerName: "Shohei Ohtani", propType: "strikeouts", line: 7.5, selection: "over", result: "won" },
          { id: "p2", playerName: "Aaron Judge", propType: "hits", line: 1.5, selection: "over", result: "lost" },
          { id: "p3", playerName: "Mookie Betts", propType: "runs", line: 0.5, selection: "over", result: "won" },
        ],
      },
      {
        name: "parlay_king",
        correctPicks: 2,
        picks: [
          { id: "o1", playerName: "Shohei Ohtani", propType: "hits", line: 1.5, selection: "over", result: "won" },
          { id: "o2", playerName: "Aaron Judge", propType: "home_runs", line: 0.5, selection: "over", result: "lost" },
          { id: "o3", playerName: "Mookie Betts", propType: "rbis", line: 1.5, selection: "under", result: "won" },
        ],
      },
    ],
  },
];

const formatPropType = (propType: string) => {
  return propType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const AdminDisputes = () => {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const totalDisputes = mockDisputes.length;
  const settledDisputes = mockDisputes.filter(d => d.status === "settled").length;
  const openDisputes = mockDisputes.filter(d => d.status === "open").length;

  const handleForcePickResult = (pickId: string, result: "won" | "lost") => {
    console.log(`Force pick ${pickId} to ${result}`);
  };

  const handleForceSettlement = () => {
    console.log("Force settlement");
    setSelectedDispute(null);
  };

  const handleIssueRefund = () => {
    console.log("Issue refund");
    setSelectedDispute(null);
  };

  const handleMakeWinner = (playerName: string) => {
    console.log(`Make ${playerName} winner`);
    setSelectedDispute(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Disputes</h1>
        <p className="text-muted-foreground mt-1">Review and resolve contest disputes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalDisputes}</p>
                <p className="text-sm text-muted-foreground">Total Disputes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{openDisputes}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{settledDisputes}</p>
                <p className="text-sm text-muted-foreground">Settled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disputes Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Contest</TableHead>
                <TableHead className="text-muted-foreground">Filed By</TableHead>
                <TableHead className="text-muted-foreground">Reason</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDisputes.map((dispute) => (
                <TableRow key={dispute.id} className="border-border">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{dispute.contestName}</p>
                      <p className="text-xs text-muted-foreground">{dispute.contestId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">@{dispute.filedBy}</TableCell>
                  <TableCell className="text-muted-foreground max-w-48 truncate">{dispute.reason}</TableCell>
                  <TableCell>
                    <Badge className={dispute.status === "open" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}>
                      {dispute.status === "open" ? "Open" : "Settled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{dispute.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDispute(dispute)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dispute Detail Modal */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-4xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-foreground">
              {selectedDispute?.contestName}
            </DialogTitle>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-6 mt-4">
              {/* Contest Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Entry Fee</p>
                  <p className="text-lg font-bold text-foreground">${selectedDispute.entryFee}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Pot Size</p>
                  <p className="text-lg font-bold text-foreground">${selectedDispute.entryFee * 2}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={selectedDispute.status === "open" ? "bg-warning/10 text-warning mt-1" : "bg-success/10 text-success mt-1"}>
                    {selectedDispute.status === "open" ? "Open" : "Settled"}
                  </Badge>
                </div>
              </div>

              {/* Dispute Reason */}
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-sm font-medium text-warning mb-1">Dispute Reason from @{selectedDispute.filedBy}</p>
                <p className="text-foreground">{selectedDispute.reason}</p>
              </div>

              {/* Players and Picks */}
              <div className="grid md:grid-cols-2 gap-4">
                {selectedDispute.players.map((player) => (
                  <div key={player.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">@{player.name}</h4>
                      <Badge variant="outline">{player.correctPicks}/{player.picks.length} correct</Badge>
                    </div>
                    <div className="space-y-2">
                      {player.picks.map((pick) => (
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
                            <Avatar className="w-10 h-10 shrink-0">
                              <AvatarImage src={pick.playerImage || ''} alt={pick.playerName} />
                              <AvatarFallback>
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{pick.playerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {pick.awayTeam} @ {pick.homeTeam} • {formatPropType(pick.propType)} {pick.selection.toUpperCase()} {pick.line}
                              </p>
                            </div>
                          </div>
                          {selectedDispute.status === "open" && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/20"
                                onClick={() => handleForcePickResult(pick.id, "won")}
                                title="Force Win"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-400 hover:bg-red-500/20"
                                onClick={() => handleForcePickResult(pick.id, "lost")}
                                title="Force Loss"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {selectedDispute.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => handleMakeWinner(player.name)}
                      >
                        <Trophy className="h-4 w-4" />
                        Make @{player.name} Winner
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Admin Actions */}
              {selectedDispute.status === "open" && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleForceSettlement}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Force Settlement
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleIssueRefund}
                  >
                    <DollarSign className="h-4 w-4" />
                    Issue Refund
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};