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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Flag,
} from "lucide-react";

interface Deposit {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: string;
  date: string;
  status: "pending" | "completed" | "failed";
}

interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  destination: string;
  requestedDate: string;
  approvedDate: string | null;
  status: "pending" | "approved" | "rejected";
  adminAction: string | null;
}

const mockDeposits: Deposit[] = [
  { id: "DEP-001", userId: "usr_001", username: "parlay_king", amount: 500, method: "Card", date: "2024-12-14 10:30", status: "completed" },
  { id: "DEP-002", userId: "usr_002", username: "sports_guru", amount: 250, method: "PayPal", date: "2024-12-14 09:15", status: "completed" },
  { id: "DEP-003", userId: "usr_003", username: "new_player", amount: 100, method: "Card", date: "2024-12-14 08:00", status: "pending" },
  { id: "DEP-004", userId: "usr_004", username: "unlucky_pete", amount: 75, method: "Crypto", date: "2024-12-13 22:00", status: "failed" },
];

const mockWithdrawals: Withdrawal[] = [
  { id: "WTH-001", userId: "usr_001", username: "parlay_king", amount: 1200, destination: "Bank ****4521", requestedDate: "2024-12-14 08:00", approvedDate: null, status: "pending", adminAction: null },
  { id: "WTH-002", userId: "usr_002", username: "sports_guru", amount: 500, destination: "PayPal", requestedDate: "2024-12-13 16:30", approvedDate: "2024-12-14 09:00", status: "approved", adminAction: "admin_john" },
  { id: "WTH-003", userId: "usr_005", username: "suspicious_user", amount: 5000, destination: "Bank ****9999", requestedDate: "2024-12-13 12:00", approvedDate: null, status: "pending", adminAction: null },
  { id: "WTH-004", userId: "usr_006", username: "flagged_user", amount: 2000, destination: "Crypto", requestedDate: "2024-12-12 18:00", approvedDate: null, status: "rejected", adminAction: "admin_jane" },
];

interface AdminTransactionsProps {
  type: "deposits" | "withdrawals";
}

export const AdminTransactions = ({ type }: AdminTransactionsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const isDeposits = type === "deposits";

  const filteredDeposits = mockDeposits.filter((dep) => {
    const matchesSearch =
      dep.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || dep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredWithdrawals = mockWithdrawals.filter((wth) => {
    const matchesSearch =
      wth.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wth.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || wth.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getDepositStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
      case "failed":
        return <Badge className="bg-destructive/10 text-destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getWithdrawalStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/10 text-success">Approved</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {isDeposits ? "Deposits" : "Withdrawals"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all {isDeposits ? "deposit" : "withdrawal"} transactions
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isDeposits ? (
          <>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">$24,850</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">156</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">8</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">$18,700</p>
                    <p className="text-sm text-muted-foreground">Pending Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">23</p>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
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
                    <p className="text-2xl font-bold text-foreground">89</p>
                    <p className="text-sm text-muted-foreground">Approved Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">5</p>
                    <p className="text-sm text-muted-foreground">Flagged</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {isDeposits ? (
                  <>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isDeposits ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Deposit ID</TableHead>
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Method</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id} className="border-border">
                    <TableCell className="font-mono text-foreground">{deposit.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">@{deposit.username}</p>
                        <p className="text-xs text-muted-foreground">{deposit.userId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-success">${deposit.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-foreground">{deposit.method}</TableCell>
                    <TableCell className="text-muted-foreground">{deposit.date}</TableCell>
                    <TableCell>{getDepositStatusBadge(deposit.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Withdrawal ID</TableHead>
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Destination</TableHead>
                  <TableHead className="text-muted-foreground">Requested</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id} className="border-border">
                    <TableCell className="font-mono text-foreground">{withdrawal.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">@{withdrawal.username}</p>
                        <p className="text-xs text-muted-foreground">{withdrawal.userId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-info">${withdrawal.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-foreground">{withdrawal.destination}</TableCell>
                    <TableCell className="text-muted-foreground">{withdrawal.requestedDate}</TableCell>
                    <TableCell>{getWithdrawalStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {withdrawal.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="text-success">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="text-warning">
                          <Flag className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
