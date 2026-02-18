import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MoreVertical,
  User,
  Ban,
  CheckCircle,
  XCircle,
  LogOut,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Coins,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  id: string;
  username: string;
  email: string;
  status: "active" | "disabled" | "banned";
  spCashBalance: number;
  spCoinsBalance: number;
  createdAt: string;
  lastLogin: string;
  wins: number;
  losses: number;
}

const mockUsers: UserData[] = [
  {
    id: "usr_001",
    username: "parlay_king",
    email: "parlay@example.com",
    status: "active",
    spCashBalance: 2450,
    spCoinsBalance: 125000,
    createdAt: "2024-01-15",
    lastLogin: "2024-12-14",
    wins: 47,
    losses: 23,
  },
  {
    id: "usr_002",
    username: "sports_guru",
    email: "guru@example.com",
    status: "active",
    spCashBalance: 1875,
    spCoinsBalance: 85000,
    createdAt: "2024-02-20",
    lastLogin: "2024-12-13",
    wins: 42,
    losses: 28,
  },
  {
    id: "usr_003",
    username: "unlucky_pete",
    email: "pete@example.com",
    status: "active",
    spCashBalance: 50,
    spCoinsBalance: 5000,
    createdAt: "2024-03-10",
    lastLogin: "2024-12-12",
    wins: 12,
    losses: 38,
  },
  {
    id: "usr_004",
    username: "banned_user",
    email: "banned@example.com",
    status: "banned",
    spCashBalance: 0,
    spCoinsBalance: 0,
    createdAt: "2024-01-05",
    lastLogin: "2024-11-01",
    wins: 5,
    losses: 2,
  },
  {
    id: "usr_005",
    username: "new_player",
    email: "newbie@example.com",
    status: "active",
    spCashBalance: 100,
    spCoinsBalance: 10000,
    createdAt: "2024-12-10",
    lastLogin: "2024-12-14",
    wins: 0,
    losses: 0,
  },
];

const mockUserDetails = {
  picks: [
    { id: 1, contestId: "CTX-001", sport: "NFL", pickType: "Over", line: "Patrick Mahomes 275.5 Passing Yards", result: "won", points: 1, timestamp: "2024-12-14 14:30" },
    { id: 2, contestId: "CTX-001", sport: "NFL", pickType: "Under", line: "Travis Kelce 65.5 Receiving Yards", result: "lost", points: 0, timestamp: "2024-12-14 14:30" },
    { id: 3, contestId: "CTX-002", sport: "NBA", pickType: "Over", line: "LeBron James 25.5 Points", result: "won", points: 1, timestamp: "2024-12-13 19:00" },
  ],
  contests: {
    active: [
      { id: "CTX-001", sport: "NFL", entryFee: 25, currencyType: "cash" as const, players: 2, legs: 5, picksCorrect: 3, status: "in_progress" },
    ],
    completed: [
      { id: "CTX-002", sport: "NBA", entryFee: 10, currencyType: "cash" as const, players: 2, legs: 3, picksCorrect: 3, outcome: "won", prizeCredits: 19 },
      { id: "CTX-003", sport: "UFC", entryFee: 50, currencyType: "cash" as const, players: 2, legs: 4, picksCorrect: 2, outcome: "lost", prizeCredits: 0 },
    ],
    created: [
      { id: "CTX-004", sport: "NFL", entryFee: 100, currencyType: "cash" as const, players: 1, legs: 5, status: "waiting" },
    ],
    expired: [
      { id: "CTX-005", sport: "MMA", entryFee: 25, currencyType: "coins" as const, players: 1, legs: 3, reason: "No opponent joined" },
    ],
  },
  transactions: {
    deposits: [
      { id: "DEP-001", amount: 500, method: "Card", date: "2024-12-10", status: "completed" },
      { id: "DEP-002", amount: 250, method: "PayPal", date: "2024-12-05", status: "completed" },
    ],
    withdrawals: [
      { id: "WTH-001", amount: 200, destination: "Bank", requestedDate: "2024-12-12", approvedDate: "2024-12-13", status: "completed" },
    ],
  },
};

// Helper function to format currency
const formatCurrency = (amount: number, currencyType: "cash" | "coins"): string => {
  if (currencyType === "coins") {
    const rounded = Math.round(amount / 1000) * 1000;
    return `${rounded.toLocaleString()} SP Coins`;
  } else {
    const rounded = Math.round(amount / 5) * 5;
    return `${rounded} SP Cash`;
  }
};

export const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case "disabled":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Disabled</Badge>;
      case "banned":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Banned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage all platform users</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, email, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">SP Cash</TableHead>
                <TableHead className="text-muted-foreground">SP Coins</TableHead>
                <TableHead className="text-muted-foreground">W/L</TableHead>
                <TableHead className="text-muted-foreground">Last Login</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">@{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="font-medium text-success">{formatCurrency(user.spCashBalance, "cash")}</TableCell>
                  <TableCell className="font-medium text-yellow-500">{formatCurrency(user.spCoinsBalance, "coins")}</TableCell>
                  <TableCell>
                    <span className="text-success">{user.wins}W</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="text-destructive">{user.losses}L</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Adjust SP Cash
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Coins className="h-4 w-4 mr-2" />
                          Adjust SP Coins
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        {user.status === "active" ? (
                          <DropdownMenuItem className="text-warning">
                            <Ban className="h-4 w-4 mr-2" />
                            Disable User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-success">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Enable User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <LogOut className="h-4 w-4 mr-2" />
                          Force Logout
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-foreground">
              User Profile: @{selectedUser?.username}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="bg-secondary">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="picks">Picks History</TabsTrigger>
                <TabsTrigger value="contests">Challenges</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* User Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-secondary/30 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Account Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID</span>
                        <span className="font-mono text-foreground">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="text-foreground">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        {getStatusBadge(selectedUser.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span className="text-foreground">{selectedUser.createdAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Login</span>
                        <span className="text-foreground">{selectedUser.lastLogin}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/30 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Wallet & Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">SP Cash Balance</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-success">{formatCurrency(selectedUser.spCashBalance, "cash")}</span>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">SP Coins Balance</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-yellow-500">{formatCurrency(selectedUser.spCoinsBalance, "coins")}</span>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats */}
                <Card className="bg-secondary/30 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Performance Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <Trophy className="h-6 w-6 mx-auto text-primary mb-1" />
                        <p className="text-2xl font-bold text-foreground">{selectedUser.wins}</p>
                        <p className="text-xs text-muted-foreground">Wins</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <XCircle className="h-6 w-6 mx-auto text-destructive mb-1" />
                        <p className="text-2xl font-bold text-foreground">{selectedUser.losses}</p>
                        <p className="text-xs text-muted-foreground">Losses</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <Target className="h-6 w-6 mx-auto text-info mb-1" />
                        <p className="text-2xl font-bold text-foreground">
                          {selectedUser.wins + selectedUser.losses > 0
                            ? ((selectedUser.wins / (selectedUser.wins + selectedUser.losses)) * 100).toFixed(1)
                            : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Adjust SP Cash
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Coins className="h-4 w-4" />
                    Adjust SP Coins
                  </Button>
                  {selectedUser.status === "active" ? (
                    <Button variant="outline" className="gap-2 text-warning border-warning/20 hover:bg-warning/10">
                      <Ban className="h-4 w-4" />
                      Disable User
                    </Button>
                  ) : (
                    <Button variant="outline" className="gap-2 text-success border-success/20 hover:bg-success/10">
                      <CheckCircle className="h-4 w-4" />
                      Enable User
                    </Button>
                  )}
                  <Button variant="outline" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Force Logout
                  </Button>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="picks" className="mt-4">
                <Card className="bg-secondary/30 border-border">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-muted-foreground">Challenge</TableHead>
                          <TableHead className="text-muted-foreground">Sport</TableHead>
                          <TableHead className="text-muted-foreground">Pick</TableHead>
                          <TableHead className="text-muted-foreground">Result</TableHead>
                          <TableHead className="text-muted-foreground">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockUserDetails.picks.map((pick) => (
                          <TableRow key={pick.id} className="border-border">
                            <TableCell className="font-mono text-foreground">{pick.contestId}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{pick.sport}</Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm text-foreground">{pick.line}</p>
                                <p className="text-xs text-muted-foreground">{pick.pickType}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={pick.result === "won" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                                {pick.result.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{pick.timestamp}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contests" className="mt-4 space-y-4">
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="bg-secondary">
                    <TabsTrigger value="active">Active ({mockUserDetails.contests.active.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({mockUserDetails.contests.completed.length})</TabsTrigger>
                    <TabsTrigger value="created">Created ({mockUserDetails.contests.created.length})</TabsTrigger>
                    <TabsTrigger value="expired">Expired ({mockUserDetails.contests.expired.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="active">
                    <Card className="bg-secondary/30 border-border">
                      <CardContent className="p-4">
                        {mockUserDetails.contests.active.map((contest) => (
                          <div key={contest.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div>
                              <p className="font-medium text-foreground">{contest.id}</p>
                              <p className="text-sm text-muted-foreground">{contest.sport} • {formatCurrency(contest.entryFee, contest.currencyType)} entry</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-foreground">{contest.picksCorrect}/{contest.legs} correct</p>
                              <Badge variant="secondary">In Progress</Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="completed">
                    <Card className="bg-secondary/30 border-border">
                      <CardContent className="p-4 space-y-2">
                        {mockUserDetails.contests.completed.map((contest) => (
                          <div key={contest.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div>
                              <p className="font-medium text-foreground">{contest.id}</p>
                              <p className="text-sm text-muted-foreground">{contest.sport} • {formatCurrency(contest.entryFee, contest.currencyType)} entry</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-foreground">{contest.picksCorrect}/{contest.legs} correct</p>
                              <Badge className={contest.outcome === "won" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                                {contest.outcome === "won" ? `+${formatCurrency(contest.prizeCredits, contest.currencyType)}` : "Lost"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="created">
                    <Card className="bg-secondary/30 border-border">
                      <CardContent className="p-4">
                        {mockUserDetails.contests.created.map((contest) => (
                          <div key={contest.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div>
                              <p className="font-medium text-foreground">{contest.id}</p>
                              <p className="text-sm text-muted-foreground">{contest.sport} • {formatCurrency(contest.entryFee, contest.currencyType)} entry</p>
                            </div>
                            <Badge variant="secondary">Waiting for opponent</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="expired">
                    <Card className="bg-secondary/30 border-border">
                      <CardContent className="p-4">
                        {mockUserDetails.contests.expired.map((contest) => (
                          <div key={contest.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                            <div>
                              <p className="font-medium text-foreground">{contest.id}</p>
                              <p className="text-sm text-muted-foreground">{contest.sport} • {formatCurrency(contest.entryFee, contest.currencyType)} entry</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{contest.reason}</p>
                              <Badge variant="secondary">Expired</Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="transactions" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-secondary/30 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Deposits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {mockUserDetails.transactions.deposits.map((dep) => (
                        <div key={dep.id} className="flex justify-between items-center p-2 rounded bg-background/50">
                          <div>
                            <p className="text-sm font-medium text-foreground">{dep.amount} SP Cash</p>
                            <p className="text-xs text-muted-foreground">{dep.method}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-success/10 text-success">{dep.status}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">{dep.date}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/30 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <TrendingDown className="h-4 w-4 text-info" />
                        Withdrawals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {mockUserDetails.transactions.withdrawals.map((wth) => (
                        <div key={wth.id} className="flex justify-between items-center p-2 rounded bg-background/50">
                          <div>
                            <p className="text-sm font-medium text-foreground">{wth.amount} SP Cash</p>
                            <p className="text-xs text-muted-foreground">{wth.destination}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-success/10 text-success">{wth.status}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">{wth.approvedDate}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
