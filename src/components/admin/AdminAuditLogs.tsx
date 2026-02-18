import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Search,
  Download,
  User,
  Edit,
  Trash2,
  Shield,
  CircleDollarSign,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Ban,
  LogOut,
} from "lucide-react";

interface AuditLog {
  id: string;
  admin: string;
  action: string;
  category: "user" | "balance" | "pick" | "contest" | "withdrawal" | "dispute" | "system";
  target: string;
  details: string;
  timestamp: string;
  ip: string;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    admin: "admin_john",
    action: "BALANCE_ADJUST",
    category: "balance",
    target: "parlay_king",
    details: "Adjusted balance from $2,450.00 to $2,550.00 (+$100.00)",
    timestamp: "2024-12-14 10:45:32",
    ip: "192.168.1.100",
  },
  {
    id: "LOG-002",
    admin: "admin_jane",
    action: "USER_DISABLE",
    category: "user",
    target: "suspicious_user",
    details: "Disabled user account due to suspected fraud",
    timestamp: "2024-12-14 10:30:15",
    ip: "192.168.1.101",
  },
  {
    id: "LOG-003",
    admin: "admin_john",
    action: "PICK_EDIT",
    category: "pick",
    target: "Patrick Mahomes",
    details: "Changed line from 270.5 to 275.5 Passing Yards",
    timestamp: "2024-12-14 09:15:00",
    ip: "192.168.1.100",
  },
  {
    id: "LOG-004",
    admin: "admin_jane",
    action: "WITHDRAWAL_APPROVE",
    category: "withdrawal",
    target: "sports_guru",
    details: "Approved withdrawal WTH-002 for $500.00",
    timestamp: "2024-12-14 09:00:00",
    ip: "192.168.1.101",
  },
  {
    id: "LOG-005",
    admin: "admin_john",
    action: "CONTEST_SETTLE",
    category: "contest",
    target: "CTX-002",
    details: "Force settled contest. Winner: bet_master, Payout: $95.00",
    timestamp: "2024-12-13 22:00:00",
    ip: "192.168.1.100",
  },
  {
    id: "LOG-006",
    admin: "admin_jane",
    action: "DISPUTE_RESOLVE",
    category: "dispute",
    target: "DIS-003",
    details: "Resolved dispute in favor of sports_guru. Issued $25.00 credit.",
    timestamp: "2024-12-13 10:00:00",
    ip: "192.168.1.101",
  },
  {
    id: "LOG-007",
    admin: "super_admin",
    action: "ADMIN_CREATE",
    category: "system",
    target: "admin_new",
    details: "Created new admin account with support role",
    timestamp: "2024-12-12 15:00:00",
    ip: "192.168.1.1",
  },
  {
    id: "LOG-008",
    admin: "admin_john",
    action: "USER_DELETE",
    category: "user",
    target: "banned_user",
    details: "Permanently deleted user account and all associated data",
    timestamp: "2024-12-11 18:00:00",
    ip: "192.168.1.100",
  },
];

export const AdminAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "user":
        return <User className="h-4 w-4" />;
      case "balance":
        return <CircleDollarSign className="h-4 w-4" />;
      case "pick":
        return <Edit className="h-4 w-4" />;
      case "contest":
        return <Trophy className="h-4 w-4" />;
      case "withdrawal":
        return <CircleDollarSign className="h-4 w-4" />;
      case "dispute":
        return <AlertTriangle className="h-4 w-4" />;
      case "system":
        return <Shield className="h-4 w-4" />;
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      user: "bg-info/10 text-info",
      balance: "bg-success/10 text-success",
      pick: "bg-primary/10 text-primary",
      contest: "bg-accent/10 text-accent",
      withdrawal: "bg-warning/10 text-warning",
      dispute: "bg-destructive/10 text-destructive",
      system: "bg-muted text-muted-foreground",
    };
    return (
      <Badge className={`${colors[category] || "bg-secondary"} flex items-center gap-1`}>
        {getCategoryIcon(category)}
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const isDelete = action.includes("DELETE") || action.includes("DISABLE") || action.includes("REJECT");
    const isCreate = action.includes("CREATE") || action.includes("APPROVE") || action.includes("RESOLVE");
    const isEdit = action.includes("EDIT") || action.includes("ADJUST") || action.includes("SETTLE");

    return (
      <Badge
        variant="outline"
        className={
          isDelete
            ? "border-destructive/20 text-destructive"
            : isCreate
            ? "border-success/20 text-success"
            : "border-warning/20 text-warning"
        }
      >
        {action.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all admin actions and changes</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by log ID, admin, target, or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
                <SelectItem value="pick">Pick</SelectItem>
                <SelectItem value="contest">Contest</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Log ID</TableHead>
                <TableHead className="text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-muted-foreground">Admin</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Action</TableHead>
                <TableHead className="text-muted-foreground">Target</TableHead>
                <TableHead className="text-muted-foreground">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-border">
                  <TableCell className="font-mono text-foreground text-xs">{log.id}</TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-foreground">@{log.admin}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(log.category)}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="text-foreground font-medium">{log.target}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
