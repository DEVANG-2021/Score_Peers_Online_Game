import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Send,
  User,
  Headphones,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  issue_category: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketReply {
  id: string;
  ticket_id: string;
  admin_id: string | null;
  message: string;
  is_admin: boolean;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  "withdraw-help": "Withdraw Help",
  "deposit-help": "Deposit Help",
  "signup-help": "Signup Help",
  "contest-issue": "Contest Issue",
  "account-issue": "Account Issue",
  "payment-issue": "Payment Issue",
  "technical-issue": "Technical Issue",
  "feedback": "Feedback",
  "other": "Other",
};

export const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [replies, setReplies] = useState<Record<string, TicketReply[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTickets();
    
    // Set up realtime subscription for new tickets
    const channel = supabase
      .channel("support_tickets_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to fetch support tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketReplies = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setReplies((prev) => ({
        ...prev,
        [ticketId]: data || [],
      }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };
  
  const updateTicketStatus = async (
    ticketId: string,
    status: SupportTicket["status"]
  ) => {
    setUpdatingStatus(true);
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // If status is resolved or closed, set resolved_at
      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", ticketId);

      if (error) throw error;

      toast.success("Ticket status updated successfully");
      fetchTickets();
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status, ...updateData });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update ticket status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateAdminNotes = async (ticketId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ 
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticketId);

      if (error) throw error;

      toast.success("Admin notes saved");
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, admin_notes: notes });
      }
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Failed to save admin notes");
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      // Get current admin session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      // Call edge function to send reply email
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-ticket-reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ticketId: selectedTicket.id,
            ticketNumber: selectedTicket.ticket_number,
            customerEmail: selectedTicket.email,
            customerName: `${selectedTicket.first_name} ${selectedTicket.last_name}`,
            replyMessage: replyMessage.trim(),
            issueCategory: selectedTicket.issue_category,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      toast.success("Reply sent successfully to customer's email");
      setReplyMessage("");

      // Update ticket status to in_progress if it was open
      if (selectedTicket.status === "open") {
        updateTicketStatus(selectedTicket.id, "in_progress");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-warning/10 text-warning border-warning/20";
      case "in_progress":
        return "bg-info/10 text-info border-info/20";
      case "resolved":
        return "bg-success/10 text-success border-success/20";
      case "closed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-warning/10 text-warning border-warning/20";
      case "normal":
        return "bg-info/10 text-info border-info/20";
      case "low":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatCategory = (category: string) => {
    return CATEGORY_LABELS[category] || category;
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;
  const urgentTickets = tickets.filter((t) => t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage customer support requests</p>
        </div>
        <Button onClick={fetchTickets} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-warning">{openTickets}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-info">{inProgressTickets}</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-success">{resolvedTickets}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-destructive">{urgentTickets}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket number, name, email, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No support tickets found</p>
              <p className="text-sm">Tickets will appear here when customers submit support requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Ticket #</TableHead>
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Priority</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="border-border cursor-pointer hover:bg-secondary/50"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setAdminNotes(ticket.admin_notes || "");
                      fetchTicketReplies(ticket.id);
                    }}
                  >
                    <TableCell className="font-mono text-sm text-primary font-medium">
                      {ticket.ticket_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {ticket.first_name} {ticket.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{ticket.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {formatCategory(ticket.issue_category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                        {formatStatus(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(ticket.created_at), "MMM d, yyyy")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ticket.created_at), "h:mm a")}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
                          setAdminNotes(ticket.admin_notes || "");
                          fetchTicketReplies(ticket.id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ticket Details: {selectedTicket?.ticket_number}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Ticket Info */}
              <div className="flex-shrink-0 space-y-4 pb-4 border-b border-border">
                {/* Contact Info Bar */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedTicket.first_name} {selectedTicket.last_name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedTicket.email}
                        </span>
                        {selectedTicket.phone_number && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {selectedTicket.phone_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{formatCategory(selectedTicket.issue_category)}</Badge>
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Status and Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) => updateTicketStatus(selectedTicket.id, value as SupportTicket["status"])}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <div className="p-2 bg-secondary/30 rounded-md text-sm text-foreground">
                      {format(new Date(selectedTicket.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Internal Notes (Private)</label>
                  <Textarea
                    placeholder="Add internal notes about this ticket..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateAdminNotes(selectedTicket.id, adminNotes)}
                    disabled={adminNotes === selectedTicket.admin_notes}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 pr-4 -mr-4 py-4">
                <div className="space-y-4">
                  {/* Customer's Initial Message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {selectedTicket.first_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(selectedTicket.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <div className="bg-secondary/50 rounded-lg rounded-tl-none p-3 max-w-[85%]">
                        <p className="text-foreground text-sm whitespace-pre-wrap">
                          {selectedTicket.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional replies would go here if you have a replies table */}
                  {replies[selectedTicket.id]?.map((reply) => (
                    <div key={reply.id} className={`flex gap-3 ${reply.is_admin ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        reply.is_admin ? 'bg-primary' : 'bg-muted'
                      }`}>
                        {reply.is_admin ? (
                          <Headphones className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`flex-1 flex flex-col ${reply.is_admin ? 'items-end' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {!reply.is_admin && (
                            <span className="font-medium text-sm text-foreground">
                              {selectedTicket.first_name}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(reply.created_at), "MMM d, h:mm a")}
                          </span>
                          {reply.is_admin && (
                            <span className="font-medium text-sm text-foreground">Support Team</span>
                          )}
                        </div>
                        <div className={`rounded-lg p-3 max-w-[85%] ${
                          reply.is_admin 
                            ? 'bg-primary/20 rounded-tr-none' 
                            : 'bg-secondary/50 rounded-tl-none'
                        }`}>
                          <p className="text-foreground text-sm whitespace-pre-wrap">
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply Input */}
              <div className="flex-shrink-0 pt-4 border-t border-border space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your reply to the customer..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-[100px] resize-none"
                    disabled={sendingReply}
                  />
                  <Button
                    onClick={handleSendReply}
                    className="self-end"
                    disabled={!replyMessage.trim() || sendingReply}
                  >
                    {sendingReply ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 inline mr-1" />
                  Reply will be sent to: <strong>{selectedTicket.email}</strong>
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};