import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Trophy, Users, Target, CheckCircle2, AlertTriangle, Calendar, Upload, Image, Eye, EyeOff, Edit, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { m } from "framer-motion";
import { date } from "zod";
import { useAuth } from "@/contexts/AuthContext"; // Adjust path as needed



interface Event {
  id: string;
  name: string;
  game_date: string;
  game_time: string;
  sport: string;
  league: string;
  location?: string;
  created_at: string;
  status: "upcoming" | "live" | "completed";
  deleted_at?: string | null;  // Add this
  deleted_by?: string | null;   // Add this
}

interface Fight {
  id: string;
  eventId: string;
  fighterA: string;
  fighterB: string;
  status: "scheduled";
}

interface Prop {
  id: string;
  fightId: string;
  fighterName: string;
  fighterImage?: string;
  propType: "significant_strikes" | "total_strikes" | "round_line" | "takedowns";
  line: number;
  actualValue?: number;
  result?: "over" | "under" | "push" | null;
}

const PROP_TYPES = [
  { value: "significant_strikes", label: "Significant Strikes" },
  { value: "total_strikes", label: "Total Strikes" },
  { value: "round_line", label: "Round Line" },
  { value: "takedowns", label: "Takedowns" },
];

export const AdminUFCPicks = () => {
  const [fightStartTime, setFightStartTime] = useState("");

  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    totalFights: 0,
    totalProps: 0,
    scoredProps: 0,
  })
   // ---------- DATA ----------
  const [events, setEvents] = useState<Event[]>([])
  const [fights, setFights] = useState<Fight[]>([])
  const [props, setProps] = useState<Prop[]>([])

  // ---------- FORMS ----------
  const [selectedEventId, setSelectedEventId] = useState("")
  const [fighterA, setFighterA] = useState("")
  const [fighterB, setFighterB] = useState("")

  const [selectedFightId, setSelectedFightId] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [propType, setPropType] = useState("")
  const [line, setLine] = useState("")
  const [fightCountsByEvent, setFightCountsByEvent] = useState<Record<string, number>>({});
  const [propCountsByFight, setPropCountsByFight] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("events");
  
 const { user, isAdmin, loading: authLoading } = useAuth();
 const [loading, setLoading] = useState(true);

  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  useEffect(() => {
  const loadData = async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }
    
    try {
      // Verify session is still valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== user.id) {
        toast.error("Session expired");
        return;
      }
      
      await Promise.all([
        fetchEvents(),
        fetchFights(),
        fetchProps(),
        fetchMetrics()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, [user, isAdmin]); // Add dependencies
  
  // Add this state near the top of the component (around line 20)
  
  const fetchMetrics = async () => {
    const [events, fights, props, scored] = await Promise.all([
      supabase.from("games").select("*", { count: "exact", head: true }),
      supabase.from("fights").select("*", { count: "exact", head: true }),
      supabase.from("player_props").select("*", { count: "exact", head: true }),
      supabase.from("player_props").select("*", { count: "exact", head: true }).eq("is_active", false),
    ])

    setMetrics({
      totalEvents: events.count ?? 0,
      totalFights: fights.count ?? 0,
      totalProps: props.count ?? 0,
      scoredProps: scored.count ?? 0,
    })
  }
  
  const fetchFights = async () => {
    if (!user || !isAdmin) {
      toast.error("Unauthorized access");
      return;
    }
    
    // Validate user session is still valid
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user || session.user.id !== user.id) {
      toast.error("Session expired. Please login again.");
      return;
    }
    
    // Server-side admin verification
    const { data: userData, error: userError } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userError) {
      toast.error("Authorization error");
      console.error("Admin role check error:", userError);
      return;
    }

    if (!userData || userData.role !== "admin") {
      toast.error("Admin privileges required");
      return;
    }

    const { data: fightsData, error: fightsError } = await supabase
      .from("fights")
      .select(`
        id, 
        event_id, 
        fighter_a, 
        fighter_b, 
        fight_start_time,
        games!inner(name, game_date, game_time),
        player_props(count)
      `).is('deleted_at', null)  // Only get non-deleted fights
      .is('games.deleted_at', null);  // Only get fights from non-deleted events

    if (fightsError) {
      console.error("Error fetching fights:", fightsError);
      return;
    }

    if (!fightsData || fightsData.length === 0) {
      setFights([]);
      setPropCountsByFight({});
      return;
    }

    // Process fights and extract prop counts
    const propCounts: Record<string, number> = {};
    const fightsWithNames = fightsData.map(fight => {
      propCounts[fight.id] = fight.player_props?.[0]?.count || 0;
      return {
        id: fight.id,
        event_id: fight.event_id,
        fighter_a: fight.fighter_a,
        fighter_b: fight.fighter_b,
        fight_start_time: fight.fight_start_time,
        name: fight.games?.name || null,
        date: fight.games?.game_date || null,
        event_time: fight.games?.game_time || null,
      };
    });

    setFights(fightsWithNames);
    setPropCountsByFight(propCounts);
  };

  
  // Update the createFight function:
 const createFight = async () => {
     if (!user || !isAdmin) {
      toast.error("Unauthorized");
      return;
    }
    // Input validation
    if (!selectedEventId || !fighterA.trim() || !fighterB.trim() || !fightStartTime) {
      toast.error("All fields are required");
      return;
    }

    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (!selectedEvent) {
      toast.error("Selected event not found");
      return;
    }

    const eventTimeNormalized = selectedEvent.game_time.substring(0, 5);
    
    if (fightStartTime < eventTimeNormalized) {
      toast.error(`Fight start time must be at or after the event time (${eventTimeNormalized})`);
      return;
    }

    const { data: existingFight, error: checkError } = await supabase
      .from("fights")
      .select("id")
      .eq("event_id", selectedEventId)
      .eq("fighter_a", fighterA)
      .eq("fighter_b", fighterB)
      .maybeSingle();

    if (!checkError && existingFight) {
      toast.error("This fight already exists for this event");
      return;
    }

    const { error } = await supabase.from("fights").insert({
      event_id: selectedEventId,
      fighter_a: fighterA,
      fighter_b: fighterB,
      fight_start_time: fightStartTime,
    });

    if (!error) {
      toast.success("Fight created");
      setFighterA("");
      setFighterB("");
      setFightStartTime("");
      setSelectedEventId("");
      setIsFightModalOpen(false);
      fetchEvents();  // Refresh events with updated fight counts
      fetchFights();  // Refresh fights
      fetchMetrics();
    } else {
      toast.error("Error creating fight");
      console.error(error);
    }
  };


  const [showDeleted, setShowDeleted] = useState(false);

  // Add this filtered list after the fetchEvents function
  const filteredEvents = events.filter(event => {
    if (showDeleted) {
      return event.deleted_at !== null; // Show only deleted
    }
    return event.deleted_at === null; // Show only active
  });

  const scoreProp = async (propId: string, scoreValue: number) => {
    const { error } = await supabase
      .from("player_props")
      .update({
        score: scoreValue,
        scored: true,
        is_active: false,
      })
      .eq("id", propId);

    if (!error) {
      toast.success("Score updated");
      fetchProps();
      fetchMetrics();
    }
  };

 const fetchProps = async () => {
  if (!user || !isAdmin) {
    toast.error("Unauthorized access");
    return;
  }
  
  // Validate user session is still valid
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user || session.user.id !== user.id) {
    toast.error("Session expired. Please login again.");
    return;
  }
  
  // Server-side admin verification
  const { data: userData, error: userError } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (userError) {
    toast.error("Authorization error");
    console.error("Admin role check error:", userError);
    return;
  }

  if (!userData || userData.role !== "admin") {
    toast.error("Admin privileges required");
    return;
  }
  
  const { data, error } = await supabase
    .from("player_props")
    .select(`
      id,
      fight_id,
      player_name,
      player_image,
      prop_type,
      line,
      is_active,
      scored,
      score,
      fights!inner(
        fighter_a,
        fighter_b,
        event_id,
        games!inner(
          id,
          name,
          deleted_at
        )
      )
    `)
    .is('deleted_at', null)  // Only get non-deleted props
    .is('fights.games.deleted_at', null)  // Updated: Access games through fights
    .is('fights.deleted_at', null);  // Only get props from non-deleted fights

  if (error) {
    console.error("Error fetching props:", error);
    return;
  }

  setProps(data ?? []);
};

    const fetchEvents = async () => {
      const { data: eventsData, error: eventsError } = await supabase
        .from("games")
        .select(`
          id, 
          name, 
          game_date, 
          game_time, 
          status,
          created_at,
          deleted_at,
          deleted_by
          fights:fights(count)
        `)
        .order("game_date");

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
        return;
      }

      if (!eventsData) {
        setEvents([]);
        return;
      }

      // Process events and extract fight counts
      const counts: Record<string, number> = {};
      const processedEvents = eventsData.map(event => {
        counts[event.id] = event.fights?.[0]?.count || 0;
        return {
          id: event.id,
          name: event.name,
          game_date: event.game_date,
          game_time: event.game_time,
          status: event.status,
          created_at: event.created_at,
          deleted_at: event.deleted_at,
          deleted_by: event.deleted_by,
        };
      });

      setEvents(processedEvents);
      setFightCountsByEvent(counts);
  };

  const createProp = async () => {
    const { fightId, fighterName, propType, line, fighterImage } = propForm;

    if (!fightId || !fighterName || !propType || !line) {
      toast.error("All fields required");
      return;
    }

    const { data: existingProp, error: checkError } = await supabase
      .from("player_props")
      .select("id")
      .eq("fight_id", fightId)
      .eq("player_name", fighterName)
      .eq("prop_type", propType)
      .eq("line", Number(line))
      .maybeSingle();

    if (!checkError && existingProp) {
      toast.error("This prop already exists for this fighter in this fight");
      return;
    }

    const { error } = await supabase.from("player_props").insert({
      fight_id: fightId,
      player_name: fighterName,
      player_image: fighterImage || null,
      prop_type: propType,
      line: Number(line),
      sport: "MMA",
      league: "MMA",
      is_active: true,
    });

    if (!error) {
      toast.success("Prop created");
      setPropForm({
        fightId: "",
        fighterName: "",
        fighterImage: "",
        propType: "",
        line: "",
      });
      setSelectedFightId(null);
      setIsPropModalOpen(false);
      fetchFights();  // Refresh fights with updated prop counts
      fetchProps();
      fetchMetrics();
    } else {
      toast.error("Error creating prop");
      console.error(error);
    }
  };


  const deleteEvent = async (gameId: string) => {
    try {
      if (!user || !isAdmin) {
        toast.error("Unauthorized");
        return;
      }
      // Call the soft delete function
      const { data, error } = await supabase
        .rpc('soft_delete_game_cascade', {
          p_game_id: gameId,
          p_deleted_by: user.id
        });

      if (error) throw error;

      toast.success('Event soft deleted successfully', {
        description: `Deleted: ${data.fights || 0} fights, ${data.player_props || 0} props, ${data.picks || 0} picks, ${data.contests || 0} contests`
      });

      // Refresh the events list
      fetchEvents();
    } catch (error) {
      console.error('Error soft deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Add this new function after handleDeleteEvent
  const handleRestoreEvent = async (gameId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('restore_game_cascade', {
          p_game_id: gameId
        });

      if (error) throw error;

      toast.success('Event restored successfully', {
        description: `Restored: ${data.fights || 0} fights, ${data.player_props || 0} props, ${data.picks || 0} picks, ${data.contests || 0} contests`
      });

      // Refresh the events list
      fetchEvents();
    } catch (error) {
      console.error('Error restoring event:', error);
      toast.error('Failed to restore event');
    }
  };

  // Update deleteFight:
  const deleteFight = async (id: string) => {
    try {
      const { error: propsError } = await supabase
        .from("player_props")
        .delete()
        .eq("fight_id", id);

      if (propsError) {
        console.error("Error deleting props:", propsError);
        toast.error("Error deleting associated props");
        return;
      }

      const { error } = await supabase
        .from("fights")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting fight:", error);
        toast.error("Error deleting fight");
        return;
      }

      toast.success("Fight and all associated props deleted");
      fetchEvents();  // Refresh events with updated fight counts
      fetchFights();  // Refresh fights with updated prop counts
      fetchProps();
      fetchMetrics();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting fight");
    }
  };

  // Update deleteProp:
  const deleteProp = async (id: string) => {
    try {
      const { error } = await supabase
        .from("player_props")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting prop:", error);
        toast.error("Error deleting prop");
        return;
      }

      toast.success("Prop deleted");
      fetchFights();  // Refresh fights with updated prop counts
      fetchProps();
      fetchMetrics();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting prop");
    }
  };

  useEffect(() => {
    fetchEvents();   // This now includes fight counts
    fetchFights();   // This now includes prop counts
    fetchProps();
    fetchMetrics();
  }, []);
  // Event Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    time: "",
  });

  // Fight Modal State
  const [isFightModalOpen, setIsFightModalOpen] = useState(false);
  const [fightForm, setFightForm] = useState({
    eventId: "",
    fighterA: "",
    fighterB: "",
  });

  // Prop Modal State
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [propForm, setPropForm] = useState({
    fightId: "",
    fighterName: "",
    fighterImage: "",
    propType: "" as Prop["propType"] | "",
    line: "",
  });

  // Results Modal State
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null);
  const [resultForm, setResultForm] = useState({
    actualValue: "",
    result: "" as "over" | "under" | "push" | "",
  });

  // Event handlers
  const handleCreateEvent = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Not authenticated")
      return
    }

    if (!eventForm.name || !eventForm.date || !eventForm.time) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check for duplicate event name
    const { data: existingEvent } = await supabase
      .from("games")
      .select("id")
      .eq("name", eventForm.name)
      .maybeSingle();  // Changed from .single() to .maybeSingle()

    if (existingEvent) {
      toast.error("An event with this name already exists");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: eventForm.name,
            game_date: eventForm.date,
            game_time: eventForm.time,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error creating event");
      }

      // Clear form and close modal
      setEventForm({ name: "", date: "", time: "" });
      setIsEventModalOpen(false);
      
      // Refresh data from database
      await fetchEvents();
      await fetchMetrics();
      
      toast.success("Event created successfully");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Error creating event");
    }
  };

  // Fight handlers
  const handleCreateFight = () => {
    if (!fightForm.eventId || !fightForm.fighterA || !fightForm.fighterB) {
      toast.error("Please fill in all fields");
      return;
    }

    const newFight: Fight = {
      id: Date.now().toString(),
      eventId: fightForm.eventId,
      fighterA: fightForm.fighterA,
      fighterB: fightForm.fighterB,
      status: "upcoming",
    };

    setFights([...fights, newFight]);
    setFightForm({ eventId: "", fighterA: "", fighterB: "" });
    setIsFightModalOpen(false);
    toast.success("Fight created successfully");
  };

  // Prop handlers
  const handleCreateProp = () => {
    if (!propForm.fightId || !propForm.fighterName || !propForm.propType || !propForm.line) {
      toast.error("Please fill in all fields");
      return;
    }

    const newProp: Prop = {
      id: Date.now().toString(),
      fightId: propForm.fightId,
      fighterName: propForm.fighterName,
      fighterImage: propForm.fighterImage || undefined,
      propType: propForm.propType as Prop["propType"],
      line: parseFloat(propForm.line),
      result: null,
    };

    setProps([...props, newProp]);
    setPropForm({
      fightId: "",
      fighterName: "",
      fighterImage: "",
      propType: "",
      line: "",
    });
    setIsPropModalOpen(false);
    toast.success("Prop created successfully");
  };


 
  const handleOpenResults = (prop: Prop) => {
    setSelectedProp(prop);
    setResultForm({
      actualValue: prop.score?.toString() || "",
      result: prop.result || "",
    });
    setIsResultsModalOpen(true);
  };
  
  const handleSaveResults = async () => {
  if (!selectedProp || !resultForm.actualValue) {
    toast.error("Please enter the actual value");
    return;
  }

  const scoreValue = parseFloat(resultForm.actualValue);

  const { error } = await supabase
    .from("player_props")
    .update({
      score: scoreValue,
      scored: true,
      is_active: false,
    })
    .eq("id", selectedProp.id);

  if (error) {
    toast.error("Error saving result");
    console.error(error);
    return;
  }

  toast.success("Result saved successfully");
  setIsResultsModalOpen(false);
  setSelectedProp(null);
  fetchProps();
  fetchMetrics();
};
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPropForm({ ...propForm, fighterImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper functions
  const getEventById = (eventId: string) => events.find((e) => e.id === eventId);
  const getFightById = (fightId: string) => fights.find((f) => f.id === fightId);
  const getFightsForEvent = (eventId: string) => fights.filter((f) => f.eventId === eventId);
  const getPropsForFight = (fightId: string) => props.filter((p) => p.fightId === fightId);

   
  const getFightersForFight = (fightId?: string) => {
    if (!fightId) return [];

    const fight = fights.find((f) => f.id === fightId);
    if (!fight) return [];

      return [fight.fighter_a, fight.fighter_b].filter(Boolean);
  };


  const getResultBadge = (result: Prop["result"]) => {
    if (!result) return <Badge variant="outline">Pending</Badge>;
    
    const config = {
      over: { label: "Over Hit", className: "bg-green-500/10 text-green-500", icon: <CheckCircle2 className="h-3 w-3" /> },
      under: { label: "Under Hit", className: "bg-blue-500/10 text-blue-500", icon: <CheckCircle2 className="h-3 w-3" /> },
      push: { label: "Push", className: "bg-yellow-500/10 text-yellow-500", icon: <AlertTriangle className="h-3 w-3" /> },
    };
    
    const { label, className, icon } = config[result];
    return <Badge className={`${className} gap-1`}>{icon} {label}</Badge>;
  };

  const unscoredProps = props.filter((p) => !p.scored);
  const scoredProps = props.filter((p) => p.scored);

  if (!user || !isAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">UFC Picks Management</h1>
          <p className="text-muted-foreground mt-1">Create events, fights, props, and score results</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.totalEvents}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.totalFights}</p>
                <p className="text-sm text-muted-foreground">Total Fights</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.totalProps}</p>
                <p className="text-sm text-muted-foreground">Total Props</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Trophy className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.scoredProps}</p>
                <p className="text-sm text-muted-foreground">Scored Props</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="fights">Fights ({fights.length})</TabsTrigger>
          <TabsTrigger value="props">Player Props ({props.length})</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsEventModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
             <Button
                variant="outline"
                onClick={() => setShowDeleted(!showDeleted)}
                className="gap-2"
              >
                {showDeleted ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Active
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Show Deleted
                  </>
                )}
              </Button>
          </div>

          <Card className="bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Fights</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              {/* Around line 300, in the table body */}
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow 
                    key={event.id} 
                    className={`border-border ${event.deleted_at ? 'bg-destructive/10' : ''}`}
                  >
                    <TableCell className="font-mono text-foreground">
                      {event.name}
                      {event.deleted_at && (
                        <Badge className="ml-2 bg-destructive/20 text-destructive">
                          Deleted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {new Date(event.game_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-foreground">{event.game_time}</TableCell>
                    <TableCell className="text-foreground">{event.location || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {event.deleted_at ? (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleRestoreEvent(event.id)}
                            className="border-success text-success hover:bg-success/10"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteEvent(event.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Fights Tab */}
        <TabsContent value="fights" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsFightModalOpen(true)} className="gap-2" disabled={events.length === 0}>
              <Plus className="h-4 w-4" />
              Create Fight
            </Button>
          </div>

          <Card className="bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Fight</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Props</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fights.map((fight) => {
                  const event = getEventById(fight.eventId);
                  return (
                    <TableRow key={fight.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {fight.fighter_a} vs {fight.fighter_b}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fight.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {fight.date ? new Date(fight.date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fight.fight_start_time || "-"}
                      </TableCell>
                      <TableCell>{propCountsByFight[fight.id] || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFight(fight.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {fights.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No fights created yet. Create an event first, then add fights.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Props Tab */}
        <TabsContent value="props" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsPropModalOpen(true)} className="gap-2" disabled={fights.length === 0}>
              <Plus className="h-4 w-4" />
              Create Prop
            </Button>
          </div>

          <Card className="bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Fighter</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Fight</TableHead>
                  <TableHead>Prop Type</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.map((prop) => {
                  const fight = getFightById(prop.fightId);
                  return (
                    <TableRow key={prop.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{prop.player_name}</TableCell>
                      <TableCell>
                        {prop.player_image ? (
                          <img
                            src={prop.player_image}
                            alt={prop.player_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {prop.fights ? `${prop.fights.fighter_a} vs ${prop.fights.fighter_b}` : "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {PROP_TYPES.find((t) => t.value === prop.prop_type)?.label}
                      </TableCell>
                      <TableCell className="font-mono text-foreground">{prop.line}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProp(prop.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {props.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No props created yet. Create a fight first, then add props.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-4 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Pending Results</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Fighter</TableHead>
                  <TableHead>Fight</TableHead>
                  <TableHead>Prop Type</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unscoredProps.map((prop) => {
                  const fight = getFightById(prop.fightId);
                  return (
                    <TableRow key={prop.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{prop.player_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {prop.fights ? `${prop.fights.fighter_a} vs ${prop.fights.fighter_b}` : "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {PROP_TYPES.find((t) => t.value === prop.prop_type)?.label}
                      </TableCell>
                      <TableCell className="font-mono text-foreground">{prop.line}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleOpenResults(prop)}>
                          Score Result
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {unscoredProps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No pending results. All props have been scored.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Scored Results</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Fighter</TableHead>
                  <TableHead>Prop Type</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead>Actual Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoredProps.map((prop) => (
                  <TableRow key={prop.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{prop.player_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {PROP_TYPES.find((t) => t.value === prop.prop_type)?.label}
                    </TableCell>
                    <TableCell className="font-mono text-foreground">{prop.line}</TableCell>
                    <TableCell className="font-mono text-foreground">{prop.score}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenResults(prop)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {scoredProps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No scored results yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Event Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create UFC Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input
                placeholder="e.g. UFC 309"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleCreateEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Fight Modal */}
      <Dialog open={isFightModalOpen} onOpenChange={setIsFightModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create UFC Fight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event</Label>
              <Select 
                onValueChange={(value) => {
                  setSelectedEventId(value);
                  setFightStartTime(""); // Reset time when event changes
                }}
                value={selectedEventId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent>
                  {events
                    .filter(e => e.status === "scheduled")
                    .map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} - {e.game_time}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fighter A</Label>
                <Input
                  placeholder="e.g. Jon Jones"
                  value={fighterA} 
                  onChange={e => setFighterA(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fighter B</Label>
                <Input
                  placeholder="e.g. Stipe Miocic"
                  value={fighterB}
                  onChange={e => setFighterB(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fight Start Time *</Label>
              <Input
                type="time"
                value={fightStartTime}
                onChange={(e) => setFightStartTime(e.target.value)}
                min={selectedEventId ? events.find(ev => ev.id === selectedEventId)?.game_time : undefined}
              />
              {selectedEventId && (
                <p className="text-xs text-muted-foreground">
                  Event starts at: {events.find(ev => ev.id === selectedEventId)?.game_time}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFightModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createFight}>Create Fight</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Prop Modal */}
      <Dialog open={isPropModalOpen} onOpenChange={setIsPropModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Player Prop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fight</Label>
              <Select
                value={propForm.fightId}
                onValueChange={(val) => {
                  setPropForm({
                    ...propForm,
                    fightId: val,
                    fighterName: "", // reset fighter when fight changes
                  });

                  setSelectedFightId(val);
                }}
              >


              <SelectTrigger>
                <SelectValue placeholder="Select Fight" />
              </SelectTrigger>
              <SelectContent>
                {fights.map(f => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.fighter_a} vs {f.fighter_b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
              <Label>Fighter</Label>
              <Select
                    value={propForm.fighterName}
                    onValueChange={(val) =>
                      setPropForm({ ...propForm, fighterName: val })
                    }
                    disabled={!propForm.fightId}
                  >
                <SelectTrigger>
                  <SelectValue placeholder="Select fighter" />
                </SelectTrigger>
                <SelectContent>
                  {getFightersForFight(propForm.fightId).map((fighter) => (
                    <SelectItem key={fighter} value={fighter}>
                      {fighter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fighter Photo</Label>
              <div className="flex items-center gap-4">
                {propForm.fighterImage ? (
                  <img
                    src={propForm.fighterImage}
                    alt="Fighter"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Label
                    htmlFor="fighter-image"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Label>
                  <Input
                    id="fighter-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prop Type</Label>
              <Select
                value={propForm.propType}
                onValueChange={(val) => setPropForm({ ...propForm, propType: val as Prop["propType"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select prop type" />
                </SelectTrigger>
                <SelectContent>
                  {PROP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Line</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="e.g. 45.5"
                value={propForm.line}
                onChange={(e) => setPropForm({ ...propForm, line: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPropModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createProp}>Create Prop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Score Results Modal */}
      <Dialog open={isResultsModalOpen} onOpenChange={setIsResultsModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Score Result</DialogTitle>
          </DialogHeader>
          {selectedProp && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Prop Details</p>
                <p className="font-medium text-foreground">
                  {selectedProp.player_name} - {PROP_TYPES.find((t) => t.value === selectedProp.prop_type)?.label}
                </p>
                <p className="text-sm text-muted-foreground">Line: {selectedProp.line}</p>
              </div>
              <div className="space-y-2">
                <Label>Actual Value</Label>
                <Input
                  type="number"
                  placeholder="Enter actual value"
                  value={resultForm.actualValue}
                  onChange={(e) => setResultForm({ ...resultForm, actualValue: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResultsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveResults}>Save Result</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};