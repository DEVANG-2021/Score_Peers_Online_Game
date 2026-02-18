import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { color } from "framer-motion";

interface UserData {
  id: string;
  user_id: string;
  username: string;
  email: string;
  status: "active" | "disabled" | "banned";
  sp_cash: number;
  sp_coins: number;
  created_at: string;
  last_sign_in_at: string | null;
  wins: number;
  losses: number;
}

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
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedUser1, setSelectedUser1] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState(null); // "cash" | "coins"
  const [amount, setAmount] = useState("");

  const openAdjustModal = (user, type) => {
    setSelectedUser1(user);
    setAdjustType(type); // "cash" or "coins"
    setAmount("");
    setIsModalOpen(true);
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with user auth data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          username,
          email,
          sp_cash,
          sp_coins,
          wins,
          losses,
          status,
          sp_cash,
          sp_coins,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // // Fetch auth data for last login
      // const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

      // if (authError) {
      //   console.error("Error fetching auth users:", authError);
      // }

      // // Create a map of user_id to last_sign_in_at
      // const authMap = authUsers?.reduce((acc, user) => {
      //   acc[user.id] = user.last_sign_in_at;
      //   return acc;
      // }, {} as Record<string, string>) || {};

      // Combine profile and auth data
      // const combinedUsers = profiles.map(profile => ({
      //   ...profile,
      //   // last_sign_in_at: authMap[profile.user_id] || null,
      // }));

      setUsers(profiles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const updateUserStatus = async (userId: string, newStatus: "active" | "disabled" | "banned") => {
    try {
  

      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`User status updated to ${newStatus}`);
        if (newStatus === "disabled") {
          await supabase.auth.admin.signOut(userId);
        }
      fetchUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Error updating user status");
    }
  };

  const deleteUser = async (userId: string) => {
      try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Please login as admin');
        return;
      }

      // Check if user is admin
      const { data: adminData } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!adminData || adminData.role !== 'admin') {
        toast.error('Admin access required');
        return;
      }

      // Prevent admin from deleting themselves
      if (userId === session.user.id) {
        toast.error('You cannot deactivate your own account');
        return;
      }

      // SIMPLE UPDATE - Use 'inactive' status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          status: 'inactive', // This should be in your constraint
          deleted_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Update error:', updateError);
        
        // If 'inactive' doesn't work, try 'banned'
        if (updateError.message.includes('status_check')) {
          const { error: retryError } = await supabase
            .from('profiles')
            .update({
              status: 'banned',
              deleted_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          if (retryError) throw retryError;
        } else {
          throw updateError;
        }
      }

      toast.success('User has been deactivated successfully');
      
      // Refresh the users list
      if (fetchUsers) {
        await fetchUsers();
      }

    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast.error(error.message || 'Failed to deactivate user');
    } finally {
      toast.success('User has been deactivated successfully');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }
  
  const handleAdjust = async (mode) => {
    if (!selectedUser1) {
      toast.error("No user selected");
      return;
    }

    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to ${mode} ${amount} ${
        adjustType === "cash" ? "SP Cash" : "SP Coins"
      }?`
    );

    if (!confirm) return;

    setLoading(true);

    try {
      const currentValue =
        adjustType === "cash"
          ? selectedUser1.sp_cash
          : selectedUser1.sp_coins;

      const newValue =
        mode === "add"
          ? Number(currentValue) + Number(amount)
          : Number(amount);

      const updateData =
        adjustType === "cash"
          ? { sp_cash: newValue }
          : { sp_coins: newValue };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", selectedUser1.id);

      if (error) throw error;

      toast.success(
        `${adjustType === "cash" ? "SP Cash" : "SP Coins"} updated successfully`
      );

      // Refresh users list
      fetchUsers();

      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update value");
    } finally {
      setLoading(false);
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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">@{user.username || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{user.email || "N/A"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="font-medium text-success">
                      {formatCurrency(user.sp_cash || 0, "cash")}
                    </TableCell>
                    <TableCell className="font-medium text-yellow-500">
                      {formatCurrency(user.sp_coins || 0, "coins")}
                    </TableCell>
                    <TableCell>
                      <span className="text-success">{user.wins || 0}W</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="text-destructive">{user.losses || 0}L</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.last_sign_in_at)}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => openAdjustModal(user, "cash")}>
                            <Edit className="h-4 w-4 mr-2" />
                              Adjust SP Cash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAdjustModal(user, "coins")}>
                            <Coins className="h-4 w-4 mr-2" />
                              Adjust SP Coins
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          {user.status === "active" ? (
                            <>
                              <DropdownMenuItem 
                                className="text-warning"
                                onClick={() => updateUserStatus(user.id, "disabled")}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Disable User
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => updateUserStatus(user.id, "banned")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem 
                              className="text-success"
                              onClick={() => updateUserStatus(user.id, "active")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Enable User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this user?")) {
                                deleteUser(user.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
                        <span className="text-foreground">{formatDate(selectedUser.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Login</span>
                        <span className="text-foreground">{formatDate(selectedUser.last_sign_in_at)}</span>
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
                          <span className="font-semibold text-success">
                            {formatCurrency(selectedUser.sp_cash || 0, "cash")}
                          </span>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">SP Coins Balance</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-yellow-500">
                            {formatCurrency(selectedUser.sp_coins || 0, "coins")}
                          </span>
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
                        <p className="text-2xl font-bold text-foreground">{selectedUser.wins || 0}</p>
                        <p className="text-xs text-muted-foreground">Wins</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <XCircle className="h-6 w-6 mx-auto text-destructive mb-1" />
                        <p className="text-2xl font-bold text-foreground">{selectedUser.losses || 0}</p>
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
                    <>
                      <Button 
                        variant="outline" 
                        className="gap-2 text-warning border-warning/20 hover:bg-warning/10"
                        onClick={() => updateUserStatus(selectedUser.id, "disabled")}
                      >
                        <Ban className="h-4 w-4" />
                        Disable User
                      </Button>
                      <Button 
                        variant="outline" 
                        className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                        onClick={() => updateUserStatus(selectedUser.id, "banned")}
                      >
                        <XCircle className="h-4 w-4" />
                        Ban User
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="gap-2 text-success border-success/20 hover:bg-success/10"
                      onClick={() => updateUserStatus(selectedUser.id, "active")}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Enable User
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    className="gap-2"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this user?")) {
                        deleteUser(selectedUser.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">
              Adjust {adjustType === "cash" ? "SP Cash" : "SP Coins"}
            </h2>

            <p className="text-sm text-muted-foreground mb-4">
              User: {selectedUser?.username || selectedUser?.email}
            </p>

            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 mb-4"
              style={{color:'black'}}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                disabled={loading}
                onClick={() => handleAdjust("add")}
              >
                Add
              </Button>

              <Button
                disabled={loading}
                variant="destructive"
                onClick={() => handleAdjust("update")}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};