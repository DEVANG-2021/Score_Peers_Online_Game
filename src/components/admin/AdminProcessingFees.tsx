import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Coins, RotateCcw, Receipt, TrendingUp, CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";


interface ProcessingFee {
  id: string;
  userId: string;
  username: string;
  contestId: string;
  contestName: string;
  action: "created" | "joined";
  currencyType: "sp_coins" | "sp_cash";
  entryAmount: number;
  feeAmount: number;
  status: "charged" | "refunded";
  chargedAt: string;
  refundedAt?: string;
  refundReason?: string;
}

// Mock data - replace with real data from Supabase
const mockProcessingFees: ProcessingFee[] = [
  {
    id: "1",
    userId: "user-1",
    username: "johnsmith",
    contestId: "contest-1",
    contestName: "UFC 300 Main Event",
    action: "created",
    currencyType: "sp_coins",
    entryAmount: 10000,
    feeAmount: 500,
    status: "charged",
    chargedAt: "2026-01-02T14:30:00Z",
  },
  {
    id: "2",
    userId: "user-2",
    username: "sarahj",
    contestId: "contest-1",
    contestName: "UFC 300 Main Event",
    action: "joined",
    currencyType: "sp_coins",
    entryAmount: 10000,
    feeAmount: 500,
    status: "charged",
    chargedAt: "2026-01-02T15:00:00Z",
  },
  {
    id: "3",
    userId: "user-3",
    username: "miked",
    contestId: "contest-2",
    contestName: "NBA Finals Pick",
    action: "created",
    currencyType: "sp_cash",
    entryAmount: 50,
    feeAmount: 2,
    status: "refunded",
    chargedAt: "2026-01-01T10:00:00Z",
    refundedAt: "2026-01-02T09:00:00Z",
    refundReason: "Contest expired",
  },
  {
    id: "4",
    userId: "user-4",
    username: "emilyb",
    contestId: "contest-3",
    contestName: "NFL Sunday Challenge",
    action: "joined",
    currencyType: "sp_cash",
    entryAmount: 100,
    feeAmount: 5,
    status: "charged",
    chargedAt: "2026-01-02T08:15:00Z",
  },
  {
    id: "5",
    userId: "user-5",
    username: "alexw",
    contestId: "contest-4",
    contestName: "Boxing Championship",
    action: "created",
    currencyType: "sp_coins",
    entryAmount: 50000,
    feeAmount: 2000,
    status: "refunded",
    chargedAt: "2025-12-30T12:00:00Z",
    refundedAt: "2026-01-01T14:00:00Z",
    refundReason: "Draw",
  },
];

export const AdminProcessingFees = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [refundReason, setRefundReason] = useState<string>("");
  const [fees, setFees] = useState<ProcessingFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.contestName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
    const matchesCurrency =
      currencyFilter === "all" || fee.currencyType === currencyFilter;
    const matchesAction = actionFilter === "all" || fee.action === actionFilter;
    const matchesDate = !dateFilter || 
      new Date(fee.chargedAt).toDateString() === dateFilter.toDateString();
    return matchesSearch && matchesStatus && matchesCurrency && matchesAction && matchesDate;
  });

  // Add useEffect to fetch data
  useEffect(() => {
    fetchProcessingFees();
  }, [statusFilter, currencyFilter, actionFilter, dateFilter]);

  const fetchProcessingFees = async () => {
    setLoading(true);
    try {
      // Fetch processing fees first
      let query = supabase
        .from('processing_fees')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (currencyFilter !== 'all') {
        query = query.eq('currency_type', currencyFilter);
      }
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }
      if (dateFilter) {
        const dateStr = dateFilter.toISOString().split('T')[0];
        query = query.gte('created_at', `${dateStr}T00:00:00`)
                    .lte('created_at', `${dateStr}T23:59:59`);
      }

      console.log('Executing query:', query.toString());
      const { data: feesData, error: feesError } = await query;
      console.log('Fetched fees data:', feesData);
      if (feesError) throw feesError;

      // Transform data with separate queries for usernames and contest names
      const transformedFees: ProcessingFee[] = await Promise.all(
        (feesData || []).map(async (fee) => {
          // Get username
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', fee.user_id)
            .single();

          // Get contest name
          const { data: contestData } = await supabase
            .from('contests')
            .select('name')
            .eq('id', fee.contest_id)
            .single();

          return {
            id: fee.id,
            userId: fee.user_id,
            username: profileData?.username || 'Unknown',
            contestId: fee.contest_id,
            contestName: contestData?.name || 'Unknown Contest',
            action: fee.action as 'created' | 'joined',
            currencyType: fee.currency_type === 'cash' ? 'sp_cash' : 'sp_coins',
            entryAmount: fee.currency_type === 'cash' ? fee.entry_amount_cash : fee.entry_amount_coins,
            feeAmount: fee.currency_type === 'cash' ? fee.amount_cash : fee.amount_coins,
            status: fee.status as 'charged' | 'refunded',
            chargedAt: fee.created_at,
            refundedAt: fee.refunded_at,
            refundReason: fee.refund_reason,
          };
        })
      );

      setFees(transformedFees);
    } catch (error) {
      console.error('Error fetching processing fees:', error);
      toast.error('Failed to load processing fees');
    } finally {
      setLoading(false);
    }
  };

  // In the handleRefund function, update it to:
  const handleRefund = async (id: string, reason: string) => {
    try {
      // Find the fee to get user and amount details
      const feeToRefund = fees.find(fee => fee.id === id);
      if (!feeToRefund) {
        toast.error('Fee not found');
        return;
      }

      // Start a Supabase transaction using RPC or multiple operations
      const { data: currentBalance, error: balanceError } = await supabase
        .from('profiles')
        .select(feeToRefund.currencyType === 'sp_coins' ? 'sp_coins' : 'sp_cash')
        .eq('user_id', feeToRefund.userId)
        .single();

      if (balanceError) throw balanceError;

      // Update the processing fee status
      const { error: feeError } = await supabase
        .from('processing_fees')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_reason: reason
        })
        .eq('id', id);

      if (feeError) throw feeError;

      // Update user balance - refund both entry amount and fee
      const totalRefundAmount = feeToRefund.entryAmount + feeToRefund.feeAmount;
      
      const updateData = feeToRefund.currencyType === 'sp_coins' 
        ? { sp_coins: (currentBalance.sp_coins || 0) + totalRefundAmount }
        : { sp_cash: (currentBalance.sp_cash || 0) + totalRefundAmount };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', feeToRefund.userId);

      if (updateError) throw updateError;

      // Update local state immediately for better UX
      setFees(prevFees => 
        prevFees.map(fee => 
          fee.id === id 
            ? {
                ...fee,
                status: 'refunded' as const,
                refundedAt: new Date().toISOString(),
                refundReason: reason
              }
            : fee
        )
      );

      toast.success('Processing fee refunded successfully');
      setRefundReason('');
      
      // Optional: Refresh data from server to ensure consistency
      setTimeout(() => {
        fetchProcessingFees();
      }, 500);
      
    } catch (error) {
      console.error('Error refunding fee:', error);
      toast.error('Failed to refund processing fee');
    }
  };

  // Also update the useEffect to refresh data when status changes
  useEffect(() => {
    fetchProcessingFees();
  }, [statusFilter, currencyFilter, actionFilter, dateFilter]);

  // Add this helper function to format currency
  const formatCurrency = (amount: number, currencyType: string) => {
    return currencyType === 'sp_coins' 
      ? amount.toLocaleString()
      : amount.toFixed(2);
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "charged":
        return (
          <Badge variant="outline" className="text-green-500 border-green-500">
            Charged
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            Refunded
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "created":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
            Created Contest
          </Badge>
        );
      case "joined":
        return (
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
            Joined Contest
          </Badge>
        );
      default:
        return null;
    }
  };

  const totalSpCoinsFees = fees
    .filter((f) => f.currencyType === "sp_coins" && f.status === "charged")
    .reduce((sum, f) => sum + f.feeAmount, 0);
  const totalSpCashFees = fees
    .filter((f) => f.currencyType === "sp_cash" && f.status === "charged")
    .reduce((sum, f) => sum + f.feeAmount, 0);
  const totalSpCoinsRefunded = fees
    .filter((f) => f.currencyType === "sp_coins" && f.status === "refunded")
    .reduce((sum, f) => sum + f.feeAmount, 0);
  const totalSpCashRefunded = fees
    .filter((f) => f.currencyType === "sp_cash" && f.status === "refunded")
    .reduce((sum, f) => sum + f.feeAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Processing Fees
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all processing fees charged for contest creation and participation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !dateFilter && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {dateFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDateFilter(undefined)}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{fees.length}</p>
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
                <p className="text-sm text-muted-foreground">SP Coins Fees</p>
                <p className="text-2xl font-bold">
                  {totalSpCoinsFees.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SP Cash Fees</p>
                <p className="text-2xl font-bold">{totalSpCashFees.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SP Coins Refunded</p>
                <p className="text-2xl font-bold">{totalSpCoinsRefunded.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SP Cash Refunded</p>
                <p className="text-2xl font-bold">{totalSpCashRefunded.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or contest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="charged">Charged</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currency</SelectItem>
                <SelectItem value="sp_coins">SP Coins</SelectItem>
                <SelectItem value="sp_cash">SP Cash</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="created">Created Contest</SelectItem>
                <SelectItem value="joined">Joined Contest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contest</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entry Amount</TableHead>
                <TableHead>Fee Charged</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredFees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No processing fees found
                  </TableCell>
                </TableRow>
              ) : (
              filteredFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>
                    <span className="font-medium">@{fee.username}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{fee.contestName}</span>
                  </TableCell>
                  <TableCell>{getActionBadge(fee.action)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        fee.currencyType === "sp_coins"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }
                    >
                      {fee.entryAmount.toLocaleString()}{" "}
                      {fee.currencyType === "sp_coins" ? "SP Coins" : "SP Cash"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold ${
                        fee.currencyType === "sp_coins"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {fee.feeAmount.toLocaleString()}{" "}
                      {fee.currencyType === "sp_coins" ? "SP Coins" : "SP Cash"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {new Date(fee.chargedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(fee.chargedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {getStatusBadge(fee.status)}
                      {fee.refundReason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {fee.refundReason}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {fee.status === "charged" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-500 hover:text-orange-600"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Refund
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Refund Processing Fee</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-4">
                              <p>
                                Refund {fee.feeAmount.toLocaleString()} fee + {fee.entryAmount.toLocaleString()} entry = 
                                {(fee.feeAmount + fee.entryAmount).toLocaleString()}{" "}
                                {fee.currencyType === "sp_coins" ? "SP Coins" : "SP Cash"}{" "}
                                to @{fee.username}?
                              </p>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                  Refund Reason
                                </label>
                                <Select
                                  value={refundReason}
                                  onValueChange={setRefundReason}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select reason..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Draw">Draw</SelectItem>
                                    <SelectItem value="Contest expired">
                                      Contest Expired
                                    </SelectItem>
                                    <SelectItem value="Contest cancelled">
                                      Contest Cancelled
                                    </SelectItem>
                                    <SelectItem value="Customer request">
                                      Customer Request
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRefundReason("")}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleRefund(fee.id, refundReason || "Refunded")
                              }
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              Confirm Refund
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {fee.status === "refunded" && fee.refundedAt && (
                      <span className="text-xs text-muted-foreground">
                        Refunded {new Date(fee.refundedAt).toLocaleDateString()}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
