import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Coins, DollarSign, Gift, TrendingUp } from "lucide-react";

interface Deposit {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  coinsAmount: number;
  dollarAmount: number;
  spCashBonus: number;
  status: "pending" | "completed";
  createdAt: string;
}

// Mock data - replace with real data from Supabase
const mockDeposits: Deposit[] = [
  {
    id: "1",
    userId: "user-1",
    fullName: "John Smith",
    username: "johnsmith",
    coinsAmount: 10000,
    dollarAmount: 10,
    spCashBonus: 0.50,
    status: "completed",
    createdAt: "2026-01-02T11:00:00Z",
  },
  {
    id: "2",
    userId: "user-2",
    fullName: "Sarah Johnson",
    username: "sarahj",
    coinsAmount: 50000,
    dollarAmount: 50,
    spCashBonus: 2.50,
    status: "completed",
    createdAt: "2026-01-02T10:30:00Z",
  },
  {
    id: "3",
    userId: "user-3",
    fullName: "Mike Davis",
    username: "miked",
    coinsAmount: 100000,
    dollarAmount: 100,
    spCashBonus: 5.00,
    status: "pending",
    createdAt: "2026-01-02T09:45:00Z",
  },
  {
    id: "4",
    userId: "user-4",
    fullName: "Emily Brown",
    username: "emilyb",
    coinsAmount: 500000,
    dollarAmount: 500,
    spCashBonus: 25.00,
    status: "completed",
    createdAt: "2026-01-01T16:20:00Z",
  },
];

export const AdminDeposits = () => {
  const [deposits] = useState<Deposit[]>(mockDeposits);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch =
      deposit.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || deposit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-green-500 border-green-500">
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const totalCoins = deposits
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + d.coinsAmount, 0);
  const totalDollars = deposits
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + d.dollarAmount, 0);
  const totalSpCash = deposits
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + d.spCashBonus, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Incoming SP Coin Purchases
        </h1>
        <p className="text-muted-foreground mt-1">
          View all SP Coin purchase transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-bold">{deposits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Coins className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total SP Coins</p>
                <p className="text-2xl font-bold">{totalCoins.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalDollars.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Gift className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SP Cash Given</p>
                <p className="text-2xl font-bold">{totalSpCash.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or username..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deposits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>SP Coins</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>SP Cash Bonus</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{deposit.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        @{deposit.username}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-yellow-500">
                      {deposit.coinsAmount.toLocaleString()} SP Coins
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-500">
                      ${deposit.dollarAmount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-purple-500">
                      {deposit.spCashBonus} SP Cash
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(deposit.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                </TableRow>
              ))}
              {filteredDeposits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No deposits found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
