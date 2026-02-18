import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Trophy, Users, Eye, CheckCircle, AlertTriangle, XCircle, TimerOff, Check, X, Clock, Split, Crown, Coins } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"; // Adjust path as needed
// Currency type
type CurrencyType = "cash" | "coins";

// Contest Status Types
type ContestStatus = "available" | "ready" | "manual_verification" | "settled" | "expired";

// Pick Result
type PickResult = "win" | "loss" | "push" | "pending";

interface ContestPick {
  id: string;
  fighter: string;
  fighterImage: string;
  matchup: string;
  category: string;
  line: number;
  selection: "more" | "less";
  result: PickResult;
  actualValue: number | null;
}

interface ContestPlayer {
  odtId: string;
  username: string;
  picks: ContestPick[];
  correctPicks: number;
  incorrectPicks: number;
  rank: number;
  prizeCredits: number;
  isWinner: boolean | string;  // Changed to support "won", "loss", "draw"
}

interface Contest {
  id: string;
  status: ContestStatus;  // This will be removed later, keeping for compatibility
  admin_state: 'available' | 'ready' | 'manual_verification' | 'settled' | 'expired';
  user_state: 'available' | 'active' | 'completed' | 'expired';
  createdBy: string;
  creatorUsername: string;
  playersJoined: number;
  maxPlayers: number;
  entryFee: number;
  totalPrizeCredits: number;
  processingFee: number;
  currencyType: CurrencyType;
  createdAt: string;
  settledAt: string | null;
  players: ContestPlayer[];
  refundReason?: string;
}
// Helper function to format currency
const formatCurrency = (amount: number, currencyType: CurrencyType): string => {
  console.log("Formatting amount:", amount, "as", currencyType);
  if (currencyType === "coins") {
    // Round to nearest 1000
    const rounded = Math.round(amount / 1000) * 1000;
    return `${rounded.toLocaleString()} SP Coins`;
  } else {
    // Round to nearest 5
    const rounded = Math.round(amount / 5) * 5;
    return `${rounded} SP Cash`;
  }
};


// Mock Data with UFC fighters - multiple contests per status
const mockContests: Contest[] = [
  // Available Contests - SP Cash
  {
    id: "CTX-MMA-001",
    status: "available",
    createdBy: "user_abc123",
    creatorUsername: "parlay_king",
    playersJoined: 2,
    maxPlayers: 4,
    entryFee: 25,
    totalPrizeCredits: 100,
    processingFee: 5,
    currencyType: "cash",
    createdAt: "2024-12-14 10:30",
    settledAt: null,
    players: [
      {
        odtId: "u1",
        username: "parlay_king",
        picks: [
          { id: "p1", fighter: "Jon Jones", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/JONES_JON_L_BELT_03_04.png", matchup: "JON vs STI", category: "Significant Strikes", line: 45.5, selection: "more", result: "pending", actualValue: null },
          { id: "p2", fighter: "Islam Makhachev", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/MAKHACHEV_ISLAM_L_BELT_06_22.png", matchup: "ISL vs DUS", category: "Takedowns", line: 2.5, selection: "more", result: "pending", actualValue: null }
        ],
        correctPicks: 0, incorrectPicks: 0, rank: 1, prizeCredits: 0, isWinner: false
      },
      {
        odtId: "u2",
        username: "sports_guru",
        picks: [
          { id: "p3", fighter: "Jon Jones", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/JONES_JON_L_BELT_03_04.png", matchup: "JON vs STI", category: "Significant Strikes", line: 45.5, selection: "less", result: "pending", actualValue: null },
          { id: "p4", fighter: "Islam Makhachev", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/MAKHACHEV_ISLAM_L_BELT_06_22.png", matchup: "ISL vs DUS", category: "Takedowns", line: 2.5, selection: "less", result: "pending", actualValue: null }
        ],
        correctPicks: 0, incorrectPicks: 0, rank: 2, prizeCredits: 0, isWinner: false
      }
    ]
  },
  // Available Contests - SP Coins
  {
    id: "CTX-MMA-006",
    status: "available",
    createdBy: "user_new001",
    creatorUsername: "octagon_oracle",
    playersJoined: 1,
    maxPlayers: 2,
    entryFee: 10000,
    totalPrizeCredits: 20000,
    processingFee: 1000,
    currencyType: "coins",
    createdAt: "2024-12-14 14:00",
    settledAt: null,
    players: [
      {
        odtId: "u10",
        username: "octagon_oracle",
        picks: [
          { id: "p30", fighter: "Sean O'Malley", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/O%27MALLEY_SEAN_L_BELT_09-14.png", matchup: "SEA vs MER", category: "Significant Strikes", line: 55.5, selection: "more", result: "pending", actualValue: null }
        ],
        correctPicks: 0, incorrectPicks: 0, rank: 1, prizeCredits: 0, isWinner: false
      }
    ]
  },
  // Ready Contests - SP Cash
  {
    id: "CTX-MMA-002",
    status: "ready",
    createdBy: "user_def456",
    creatorUsername: "mma_master",
    playersJoined: 4,
    maxPlayers: 4,
    entryFee: 50,
    totalPrizeCredits: 200,
    processingFee: 10,
    currencyType: "cash",
    createdAt: "2024-12-13 19:00",
    settledAt: null,
    players: [
      {
        odtId: "u3",
        username: "mma_master",
        picks: [
          { id: "p5", fighter: "Alex Pereira", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/PEREIRA_ALEX_L_BELT_04_13.png", matchup: "ALE vs JAM", category: "Total Strikes", line: 85.5, selection: "more", result: "pending", actualValue: null },
          { id: "p6", fighter: "Sean O'Malley", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/O%27MALLEY_SEAN_L_BELT_09-14.png", matchup: "SEA vs MER", category: "Significant Strikes", line: 55.5, selection: "more", result: "pending", actualValue: null },
          { id: "p61", fighter: "Jon Jones", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/JONES_JON_L_BELT_03_04.png", matchup: "JON vs STI", category: "Round Line", line: 2.5, selection: "less", result: "pending", actualValue: null }
        ],
        correctPicks: 0, incorrectPicks: 0, rank: 1, prizeCredits: 0, isWinner: false
      },
      {
        odtId: "u31",
        username: "fight_fan99",
        picks: [
          { id: "p62", fighter: "Alex Pereira", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/PEREIRA_ALEX_L_BELT_04_13.png", matchup: "ALE vs JAM", category: "Total Strikes", line: 85.5, selection: "less", result: "pending", actualValue: null },
          { id: "p63", fighter: "Dustin Poirier", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/POIRIER_DUSTIN_L_04_13.png", matchup: "ISL vs DUS", category: "Significant Strikes", line: 45.5, selection: "more", result: "pending", actualValue: null },
          { id: "p64", fighter: "Stipe Miocic", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/MIOCIC_STIPE_L_03-04.png", matchup: "JON vs STI", category: "Total Strikes", line: 40.5, selection: "more", result: "pending", actualValue: null }
        ],
        correctPicks: 0, incorrectPicks: 0, rank: 2, prizeCredits: 0, isWinner: false
      }
    ]
  },
  // Ready Contests - SP Coins
  {
    id: "CTX-MMA-007",
    status: "ready",
    createdBy: "user_xyz789",
    creatorUsername: "knockout_king",
    playersJoined: 2,
    maxPlayers: 2,
    entryFee: 20000,
    totalPrizeCredits: 40000,
    processingFee: 2000,
    currencyType: "coins",
    createdAt: "2024-12-13 21:00",
    settledAt: null,
    players: [
      {
        odtId: "u11",
        username: "knockout_king",
        picks: [
          { id: "p31", fighter: "Jon Jones", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/JONES_JON_L_BELT_03_04.png", matchup: "JON vs STI", category: "Significant Strikes", line: 30.5, selection: "more", result: "pending", actualValue: null },
          { id: "p32", fighter: "Stipe Miocic", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/MIOCIC_STIPE_L_03-04.png", matchup: "JON vs STI", category: "Round Line", line: 3.5, selection: "less", result: "pending", actualValue: null }
        ],
        correctPicks: 0, incorrectPicks: 0, rank: 1, prizeCredits: 0, isWinner: false
      },
      {
        odtId: "u12",
        username: "submission_ace",
        picks: [
          { id: "p33", fighter: "Jon Jones", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/JONES_JON_L_BELT_03_04.png", matchup: "JON vs STI", category: "Significant Strikes", line: 30.5, selection: "less", result: "pending", actualValue: null },
          { id: "p34", fighter: "Stipe Miocic", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/MIOCIC_STIPE_L_03-04.png", matchup: "JON vs STI", category: "Round Line", line: 3.5, selection: "more", result: "pending", actualValue: null }
        ],
        correctPicks: 0, incorrectPicks: 0, rank: 2, prizeCredits: 0, isWinner: false
      }
    ]
  },
  // Manual Verification Contests - SP Cash
  {
    id: "CTX-MMA-003",
    status: "manual_verification",
    createdBy: "user_ghi789",
    creatorUsername: "fight_picker",
    playersJoined: 4,
    maxPlayers: 4,
    entryFee: 100,
    totalPrizeCredits: 400,
    processingFee: 20,
    currencyType: "cash",
    createdAt: "2024-12-12 15:00",
    settledAt: null,
    players: [
      {
        odtId: "u4",
        username: "fight_picker",
        picks: [
          { id: "p7", fighter: "Stipe Miocic", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/MIOCIC_STIPE_L_03-04.png", matchup: "JON vs STI", category: "Round Line", line: 2.5, selection: "less", result: "win", actualValue: 2 },
          { id: "p8", fighter: "Dustin Poirier", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/POIRIER_DUSTIN_L_04_13.png", matchup: "ISL vs DUS", category: "Significant Strikes", line: 65.5, selection: "more", result: "win", actualValue: 72 },
          { id: "p81", fighter: "Islam Makhachev", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/MAKHACHEV_ISLAM_L_BELT_06_22.png", matchup: "ISL vs DUS", category: "Takedowns", line: 3.5, selection: "more", result: "win", actualValue: 5 },
          { id: "p82", fighter: "Jon Jones", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/JONES_JON_L_BELT_03_04.png", matchup: "JON vs STI", category: "Significant Strikes", line: 40.5, selection: "more", result: "win", actualValue: 48 }
        ],
        correctPicks: 4, incorrectPicks: 0, rank: 1, prizeCredits: 0, isWinner: false
      },
      {
        odtId: "u5",
        username: "ufc_fanatic",
        picks: [
          { id: "p9", fighter: "Stipe Miocic", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/MIOCIC_STIPE_L_03-04.png", matchup: "JON vs STI", category: "Round Line", line: 2.5, selection: "more", result: "loss", actualValue: 2 },
          { id: "p10", fighter: "Dustin Poirier", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/POIRIER_DUSTIN_L_04_13.png", matchup: "ISL vs DUS", category: "Significant Strikes", line: 65.5, selection: "less", result: "loss", actualValue: 72 },
          { id: "p101", fighter: "Islam Makhachev", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/MAKHACHEV_ISLAM_L_BELT_06_22.png", matchup: "ISL vs DUS", category: "Takedowns", line: 3.5, selection: "less", result: "loss", actualValue: 5 },
          { id: "p102", fighter: "Jon Jones", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/JONES_JON_L_BELT_03_04.png", matchup: "JON vs STI", category: "Significant Strikes", line: 40.5, selection: "less", result: "loss", actualValue: 48 }
        ],
        correctPicks: 0, incorrectPicks: 4, rank: 2, prizeCredits: 0, isWinner: false
      }
    ]
  },
  // Manual Verification - SP Coins
  {
    id: "CTX-MMA-008",
    status: "manual_verification",
    createdBy: "user_ver001",
    creatorUsername: "sharp_picker",
    playersJoined: 2,
    maxPlayers: 2,
    entryFee: 15000,
    totalPrizeCredits: 30000,
    processingFee: 1500,
    currencyType: "coins",
    createdAt: "2024-12-12 18:00",
    settledAt: null,
    players: [
      {
        odtId: "u13",
        username: "sharp_picker",
        picks: [
          { id: "p35", fighter: "Alex Pereira", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/PEREIRA_ALEX_L_BELT_04_13.png", matchup: "ALE vs JAM", category: "Round Line", line: 2.5, selection: "less", result: "win", actualValue: 1 },
          { id: "p36", fighter: "Jamahal Hill", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/HILL_JAMAHAL_L_04-13.png", matchup: "ALE vs JAM", category: "Significant Strikes", line: 25.5, selection: "less", result: "pending", actualValue: null }
        ],
        correctPicks: 1, incorrectPicks: 0, rank: 1, prizeCredits: 0, isWinner: false
      },
      {
        odtId: "u14",
        username: "unlucky_pete",
        picks: [
          { id: "p37", fighter: "Alex Pereira", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/PEREIRA_ALEX_L_BELT_04_13.png", matchup: "ALE vs JAM", category: "Round Line", line: 2.5, selection: "more", result: "loss", actualValue: 1 },
          { id: "p38", fighter: "Jamahal Hill", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/HILL_JAMAHAL_L_04-13.png", matchup: "ALE vs JAM", category: "Significant Strikes", line: 25.5, selection: "more", result: "pending", actualValue: null }
        ],
        correctPicks: 0, incorrectPicks: 1, rank: 2, prizeCredits: 0, isWinner: false
      }
    ]
  },
  // Settled Contests - SP Cash
  {
    id: "CTX-MMA-004",
    status: "settled",
    createdBy: "user_jkl012",
    creatorUsername: "prediction_master",
    playersJoined: 4,
    maxPlayers: 4,
    entryFee: 50,
    totalPrizeCredits: 200,
    processingFee: 10,
    currencyType: "cash",
    createdAt: "2024-12-10 10:00",
    settledAt: "2024-12-10 22:30",
    players: [
      {
        odtId: "u6",
        username: "prediction_master",
        picks: [
          { id: "p11", fighter: "Jon Jones", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2023-03/JONES_JON_L_BELT_03_04.png", matchup: "JON vs STI", category: "Significant Strikes", line: 40.5, selection: "more", result: "win", actualValue: 52 },
          { id: "p12", fighter: "Islam Makhachev", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/MAKHACHEV_ISLAM_L_BELT_06_22.png", matchup: "ISL vs DUS", category: "Takedowns", line: 3.5, selection: "more", result: "win", actualValue: 5 }
        ],
        correctPicks: 2, incorrectPicks: 0, rank: 1, prizeCredits: 190, isWinner: true
      }
    ]
  },
  // Settled Contests - SP Coins
  {
    id: "CTX-MMA-009",
    status: "settled",
    createdBy: "user_set001",
    creatorUsername: "champion_picker",
    playersJoined: 2,
    maxPlayers: 2,
    entryFee: 10000,
    totalPrizeCredits: 20000,
    processingFee: 1000,
    currencyType: "coins",
    createdAt: "2024-12-09 15:00",
    settledAt: "2024-12-09 23:00",
    players: [
      {
        odtId: "u15",
        username: "champion_picker",
        picks: [
          { id: "p39", fighter: "Sean O'Malley", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/O%27MALLEY_SEAN_L_BELT_09-14.png", matchup: "SEA vs MER", category: "Significant Strikes", line: 60.5, selection: "more", result: "win", actualValue: 78 },
          { id: "p40", fighter: "Merab Dvalishvili", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/DVALISHVILI_MERAB_L_BELT_09-14.png", matchup: "SEA vs MER", category: "Takedowns", line: 4.5, selection: "more", result: "win", actualValue: 7 }
        ],
        correctPicks: 2, incorrectPicks: 0, rank: 1, prizeCredits: 19000, isWinner: true
      },
      {
        odtId: "u16",
        username: "risky_picks",
        picks: [
          { id: "p41", fighter: "Sean O'Malley", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/O%27MALLEY_SEAN_L_BELT_09-14.png", matchup: "SEA vs MER", category: "Significant Strikes", line: 60.5, selection: "less", result: "loss", actualValue: 78 },
          { id: "p42", fighter: "Merab Dvalishvili", fighterImage: "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/DVALISHVILI_MERAB_L_BELT_09-14.png", matchup: "SEA vs MER", category: "Takedowns", line: 4.5, selection: "less", result: "loss", actualValue: 7 }
        ],
        correctPicks: 0, incorrectPicks: 2, rank: 2, prizeCredits: 0, isWinner: false
      }
    ]
  },
  // Expired Contests - SP Cash
  {
    id: "CTX-MMA-005",
    status: "expired",
    createdBy: "user_mno345",
    creatorUsername: "casual_fan",
    playersJoined: 1,
    maxPlayers: 4,
    entryFee: 25,
    totalPrizeCredits: 25,
    processingFee: 0,
    currencyType: "cash",
    createdAt: "2024-12-08 09:00",
    settledAt: null,
    refundReason: "Challenge did not fill before deadline",
    players: []
  },
  // Expired Contests - SP Coins
  {
    id: "CTX-MMA-010",
    status: "expired",
    createdBy: "user_exp001",
    creatorUsername: "late_entry",
    playersJoined: 0,
    maxPlayers: 4,
    entryFee: 25000,
    totalPrizeCredits: 0,
    processingFee: 0,
    currencyType: "coins",
    createdAt: "2024-12-07 12:00",
    settledAt: null,
    refundReason: "No players joined before challenge deadline",
    players: []
  }
];

// Status Badge Component
const StatusBadge = ({ status }: { status: ContestStatus }) => {
  const config: Record<ContestStatus, { icon: React.ReactNode; label: string; className: string }> = {
    available: { icon: <Users className="h-3 w-3" />, label: "Available", className: "bg-success/10 text-success border-success/20" },
    ready: { icon: <Trophy className="h-3 w-3" />, label: "Ready", className: "bg-info/10 text-info border-info/20" },
    manual_verification: { icon: <AlertTriangle className="h-3 w-3" />, label: "Manual Verification", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    settled: { icon: <CheckCircle className="h-3 w-3" />, label: "Settled", className: "bg-muted text-muted-foreground border-muted" },
    expired: { icon: <TimerOff className="h-3 w-3" />, label: "Expired", className: "bg-secondary text-secondary-foreground border-secondary" }
  };
  const { icon, label, className } = config[status];
  return <Badge className={`${className} flex items-center gap-1`}>{icon}{label}</Badge>;
};

export const AdminContests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContestStatus>("available");
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyType>("cash");
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [contests, setContests] = useState<Contest[]>(mockContests);
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
  const [tempPickResults, setTempPickResults] = useState<Record<string, Record<string, PickResult>>>({});
  const [gameEvent, setGameEvent] = useState<any>(null);
  const [priceCredit, setPrizeCredit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settlingContest, setSettlingContest] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();

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
            fetchContests(),
            fetchGameEvent()
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
      

  const stats = {
    available: contests.filter(c => c.admin_state === "available" && c.currencyType === currencyFilter).length,
    ready: contests.filter(c => c.admin_state === "ready" && c.currencyType === currencyFilter).length,
    manual_verification: contests.filter(c => c.admin_state === "manual_verification" && c.currencyType === currencyFilter).length,
    settled: contests.filter(c => c.admin_state === "settled" && c.currencyType === currencyFilter).length,
    expired: contests.filter(c => c.admin_state === "expired" && c.currencyType === currencyFilter).length
  };

  const fetchGameEvent = async () => {
   try {
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
          .from('games')
          .select('*')
          .eq('sport', 'MMA')
          .eq('league', 'MMA')
          .gte('game_date', new Date().toISOString().split('T')[0])
          .order('game_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setGameEvent(data);
      } catch (error) {
        console.error('Error fetching game event:', error);
      }
   };

  useEffect(() => {
    fetchGameEvent();
    const now = new Date();
    if (!gameEvent) return;
    const eventDateTime = new Date(`${gameEvent.game_date}T${gameEvent.game_time}`);

      contests.forEach(async (contest) => {
        if (
          contest.admin_state === 'ready' &&
          eventDateTime &&
          eventDateTime.getTime() <= now.getTime()
        ) {
          const { error } = await supabase
            .from('contests')
            .update({
              user_state: 'active',
              admin_state: 'manual_verification'
            })
            .eq('id', contest.id);

          if (!error) {
            fetchContests(); // refresh UI
          }
        }
      });
  }, [contests]);


  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  const fetchContests = async () => {
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
    
    setLoading(true);
    try {
      // Fetch contests - use admin_state instead of status
      const { data: contestsData, error: contestsError } = await supabase
        .from('contests')
        .select(`
          id,
          name,
          admin_state,
          user_state,
          created_by,
          current_players,
          max_players,
          entry_fee_cash,
          entry_fee_coins,
          processing_fee_cash,
          processing_fee_coins,
          currency_type,
          num_predictions,
          created_at,
          settled_at,
          refund_reason
        `)
        .eq('currency_type', currencyFilter)
        .order('created_at', { ascending: false });

      if (contestsError) throw contestsError;

      // Transform data
      const transformed = await Promise.all(
        (contestsData || []).map(async (contest) => {
          // Get creator username
          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', contest.created_by)
            .single();

          // Get all entries for this contest
          const { data: entries } = await supabase
            .from('contest_entries')
            .select(`
              id,
              user_id,
              score,
              rank,
              is_winner,
              prize_credits_cash,
              prize_credits_coins,
              contest_entry_picks(
                id,
                selection,
                points,
                is_correct,
                player_props(
                  id,
                  player_name,
                  player_image,
                  prop_type,
                  line,
                  score,
                  fights(fighter_a, fighter_b)
                )
              )
            `)
            .eq('contest_id', contest.id);

          // Get usernames for all players
          const players = await Promise.all(
            (entries || []).map(async (entry) => {
              const { data: playerProfile } = await supabase
                .from('profiles')
                .select('username')
                .eq('user_id', entry.user_id)
                .single();

              const picks = entry.contest_entry_picks.map(pick => ({
                id: pick.id,
                fighter: pick.player_props.player_name,
                fighterImage: pick.player_props.player_image || '',
                matchup: `${pick.player_props.fights?.fighter_a?.substring(0, 3).toUpperCase() || 'N/A'} vs ${pick.player_props.fights?.fighter_b?.substring(0, 3).toUpperCase() || 'N/A'}`,
                category: pick.player_props.prop_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                line: pick.player_props.line,
                selection: pick.selection === 'over' ? 'more' : 'less',
                result: pick.is_correct === true ? 'win' : pick.is_correct === false ? 'loss' : 'pending',
                actualValue: pick.player_props.score
              }));

              return {
                odtId: entry.user_id,
                username: playerProfile?.username || 'Unknown',
                picks,
                correctPicks: picks.filter(p => p.result === 'win').length,
                incorrectPicks: picks.filter(p => p.result === 'loss').length,
                rank: entry.rank || 0,
                prizeCredits: contest.currency_type === 'cash' ? entry.prize_credits_cash : entry.prize_credits_coins,
                isWinner: entry.is_winner || false
              };
            })
          );

          const totalPrize = contest.currency_type === 'cash' 
            ? contest.entry_fee_cash * contest.max_players
            : contest.entry_fee_coins * contest.max_players;

          return {
            id: contest.id,
            status: contest.admin_state as ContestStatus, // Map admin_state to status for compatibility
            admin_state: contest.admin_state,
            user_state: contest.user_state,
            createdBy: contest.created_by,
            creatorUsername: creatorProfile?.username || 'Unknown',
            playersJoined: contest.current_players,
            maxPlayers: contest.max_players,
            entryFee: contest.currency_type === 'cash' ? contest.entry_fee_cash : contest.entry_fee_coins,
            totalPrizeCredits: totalPrize,
            processingFee: contest.currency_type === 'cash' ? contest.processing_fee_cash : contest.processing_fee_coins,
            currencyType: contest.currency_type as CurrencyType,
            createdAt: new Date(contest.created_at).toLocaleString(),
            settledAt: contest.settled_at ? new Date(contest.settled_at).toLocaleString() : null,
            players,
            refundReason: contest.refund_reason
          };
        })
      );

      setContests(transformed);
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };
    
  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = contest.admin_state === statusFilter; // Use admin_state
    const matchesCurrency = contest.currencyType === currencyFilter;
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const handleForceRefund = async () => {
    if (!selectedContest || !refundReason.trim()) return;
    
    try {
      // Update contest states to expired
      const { error: contestError } = await supabase
        .from('contests')
        .update({ 
          admin_state: 'expired',
          user_state: 'expired',
          refund_reason: refundReason,
          settled_at: new Date().toISOString()
        })
        .eq('id', selectedContest.id);

      if (contestError) throw contestError;

      // Refund entry fees and processing fees to all players
      for (const player of selectedContest.players) {
        const totalRefund = selectedContest.entryFee + selectedContest.processingFee;

        const columnName = selectedContest.currencyType === 'cash' ? 'sp_cash' : 'sp_coins';
        
        const { data: profile } = await supabase
          .from('profiles')
          .select(columnName)
          .eq('user_id', player.odtId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              [columnName]: profile[columnName] + totalRefund
            })
            .eq('user_id', player.odtId);
        }

        // Update processing fee status to refunded
        await supabase
          .from('processing_fees')
          .update({
            status: 'refunded',
            refunded_at: new Date().toISOString(),
            refund_reason: refundReason
          })
          .eq('contest_id', selectedContest.id)
          .eq('user_id', player.odtId);
      }

      toast.success('Contest refunded successfully');
      setShowRefundModal(false);
      setRefundReason('');
      setSelectedContest(null);
      fetchContests();
    } catch (error) {
      console.error('Error refunding:', error);
      toast.error('Failed to refund contest');
    }
  };

  const getPrizeForPlayer = (playerId: string) => {
    if (!selectedContest) return 0;

    const winners = selectedContest.players.filter(
      p => p.isWinner === true || p.isWinner === 'won' || p.isWinner === 'draw'
    );

    if (winners.length === 0) return 0;

    const isWinner = winners.some(w => w.odtId === playerId);
    if (!isWinner) return 0;

    return selectedContest.totalPrizeCredits / winners.length;
  };

  const handleForceSettle = async () => {
    if (!selectedContest) return;
    
    // Validation: Check if at least one winner is selected
    const hasWinner = selectedContest.players.some(p => p.isWinner === true || p.isWinner === 'won' || p.isWinner === 'draw');
    if (!hasWinner) {
      toast.error('Please select at least one winner before settling');
      return;
    }
    
    setSettlingContest(true);
    try {
      // Step 1: Update all pick results in database
      for (const player of selectedContest.players) {
        for (const pick of player.picks) {
          const tempResult = tempPickResults[selectedContest.id]?.[pick.id] || pick.result;
          
          let points = 0;
          let isCorrect = null;

          if (tempResult === 'win') {
            points = 10;
            isCorrect = true;
          } else if (tempResult === 'loss') {
            points = 0;
            isCorrect = false;
          } else if (tempResult === 'push') {
            points = 0;
            isCorrect = null;
          }

          // Update pick in database
          const { error: pickError } = await supabase
            .from('contest_entry_picks')
            .update({
              points,
              is_correct: isCorrect
            })
            .eq('id', pick.id);

          if (pickError) {
            console.error('Error updating pick:', pickError);
            throw pickError;
          }
        }
      }

      // Step 2: Calculate final scores for all players
      const entriesUpdates = [];

      const winners = selectedContest.players.filter(
        p => p.isWinner === true || p.isWinner === 'won' || p.isWinner === 'draw'
      );

      const prizePerWinner =
        winners.length > 0
          ? selectedContest.totalPrizeCredits / winners.length
          : 0;

      
      for (const player of selectedContest.players) {
        // Calculate total score based on updated picks
        const totalScore = player.picks.reduce((sum, pick) => {
          const tempResult = tempPickResults[selectedContest.id]?.[pick.id] || pick.result;
          return sum + (tempResult === 'win' ? 10 : 0);
        }, 0);

        entriesUpdates.push({
          user_id: player.odtId,
          score: totalScore,
          isWinner: player.isWinner,
          prizeCredits:
            winners.some(w => w.odtId === player.odtId)
              ? prizePerWinner
              : 0
        });
      }

      // Step 3: Sort by score to assign ranks
      entriesUpdates.sort((a, b) => b.score - a.score);
      
      // Assign ranks based on score
      let currentRank = 1;
      for (let i = 0; i < entriesUpdates.length; i++) {
        if (i > 0 && entriesUpdates[i].score < entriesUpdates[i - 1].score) {
          currentRank = i + 1;
        }
        entriesUpdates[i].rank = currentRank;
      }

      // Step 4: Update contest_entries table with all data
      for (const entry of entriesUpdates) {
        // Determine is_winner value (handle boolean, string, or existing value)
        let isWinnerValue;
        if (entry.isWinner === true || entry.isWinner === 'won') {
          isWinnerValue = 'won';
        } else if (entry.isWinner === 'draw') {
          isWinnerValue = 'draw';
        } else if (entry.isWinner === 'loss' || entry.isWinner === false) {
          isWinnerValue = 'loss';
        } else {
          isWinnerValue = 'loss'; // Default to loss if not specified
        }

        const { error: entryError } = await supabase
          .from('contest_entries')
          .update({
            score: entry.score,
            rank: entry.rank,
            prize_credits_cash: selectedContest.currencyType === 'cash' ? entry.prizeCredits : 0,
            prize_credits_coins: selectedContest.currencyType === 'coins' ? entry.prizeCredits : 0,
            is_winner: isWinnerValue
          })
          .eq('contest_id', selectedContest.id)
          .eq('user_id', entry.user_id);

        if (entryError) {
          console.error('Error updating contest entry:', entryError);
          throw entryError;
        }

        // Step 5: Update user's profile balance if they won
        if (entry.prizeCredits > 0 && (entry.isWinner === true || entry.isWinner === 'won' || entry.isWinner === 'draw')) {
          const columnName = selectedContest.currencyType === 'cash' ? 'sp_cash' : 'sp_coins';
          
          const { data: profile, error: profileFetchError } = await supabase
            .from('profiles')
            .select(columnName)
            .eq('user_id', entry.user_id)
            .single();

          if (profileFetchError) {
            console.error('Error fetching profile:', profileFetchError);
            throw profileFetchError;
          }

          if (profile) {
            const newBalance = (profile[columnName] || 0) + entry.prizeCredits;
            
            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .update({
                [columnName]: newBalance
              })
              .eq('user_id', entry.user_id);

            if (profileUpdateError) {
              console.error('Error updating profile:', profileUpdateError);
              throw profileUpdateError;
            }
          }
        }
      }

      // Step 6: Update contest states (admin_state and user_state)
      const { error: contestError } = await supabase
      .from('contests')
      .update({
        admin_state: 'settled',
        user_state: 'completed',
        settled_at: new Date().toISOString(),
        settled_by: user?.id
      })
      .eq('id', selectedContest.id);

    if (contestError) {
      console.error('Error updating contest:', contestError);
      throw contestError;
    }

    // Clear temporary pick results for this contest
    setTempPickResults(prev => {
      const newState = { ...prev };
      delete newState[selectedContest.id];
      return newState;
    });

    toast.success('Contest settled successfully! All changes saved to database.');
    setShowSettleModal(false);
    
    // DON'T close the main modal yet - refresh it with latest data
    // Fetch the updated contest from database
    await fetchContests();
    
    // Re-fetch the specific contest to show updated data
    const { data: updatedContestData, error: fetchError } = await supabase
      .from('contests')
      .select(`
        id,
        name,
        admin_state,
        user_state,
        created_by,
        current_players,
        max_players,
        entry_fee_cash,
        entry_fee_coins,
        processing_fee_cash,
        processing_fee_coins,
        currency_type,
        num_predictions,
        created_at,
        settled_at,
        refund_reason
      `)
      .eq('id', selectedContest.id)
      .single();

    if (!fetchError && updatedContestData) {
      // Get creator username
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', updatedContestData.created_by)
        .single();

      // Get all entries for this contest with updated data
      const { data: entries } = await supabase
        .from('contest_entries')
        .select(`
          id,
          user_id,
          score,
          rank,
          is_winner,
          prize_credits_cash,
          prize_credits_coins,
          contest_entry_picks(
            id,
            selection,
            points,
            is_correct,
            player_props(
              id,
              player_name,
              player_image,
              prop_type,
              line,
              score,
              fights(fighter_a, fighter_b)
            )
          )
        `)
        .eq('contest_id', updatedContestData.id);

      // Get usernames for all players
      const players = await Promise.all(
        (entries || []).map(async (entry) => {
          const { data: playerProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', entry.user_id)
            .single();

          const picks = entry.contest_entry_picks.map(pick => ({
            id: pick.id,
            fighter: pick.player_props.player_name,
            fighterImage: pick.player_props.player_image || '',
            matchup: `${pick.player_props.fights?.fighter_a?.substring(0, 3).toUpperCase() || 'N/A'} vs ${pick.player_props.fights?.fighter_b?.substring(0, 3).toUpperCase() || 'N/A'}`,
            category: pick.player_props.prop_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            line: pick.player_props.line,
            selection: pick.selection === 'over' ? 'more' : 'less',
            result: pick.is_correct === true ? 'win' : pick.is_correct === false ? 'loss' : 'pending',
            actualValue: pick.player_props.score
          }));

          // Properly parse is_winner field
          let isWinnerValue: boolean | string = false;
          if (entry.is_winner === 'won' || entry.is_winner === true) {
            isWinnerValue = true;
          } else if (entry.is_winner === 'draw') {
            isWinnerValue = 'draw';
          } else {
            isWinnerValue = false;
          }

          return {
            odtId: entry.user_id,
            username: playerProfile?.username || 'Unknown',
            picks,
            correctPicks: picks.filter(p => p.result === 'win').length,
            incorrectPicks: picks.filter(p => p.result === 'loss').length,
            rank: entry.rank || 0,
            prizeCredits: updatedContestData.currency_type === 'cash' 
              ? (entry.prize_credits_cash || 0) 
              : (entry.prize_credits_coins || 0),
            isWinner: isWinnerValue
          };
        })
      );

      const totalPrize = updatedContestData.currency_type === 'cash' 
        ? updatedContestData.entry_fee_cash * updatedContestData.max_players
        : updatedContestData.entry_fee_coins * updatedContestData.max_players;

      // Update selectedContest with fresh data
      const refreshedContest: Contest = {
        id: updatedContestData.id,
        status: updatedContestData.admin_state as ContestStatus,
        admin_state: updatedContestData.admin_state,
        user_state: updatedContestData.user_state,
        createdBy: updatedContestData.created_by,
        creatorUsername: creatorProfile?.username || 'Unknown',
        playersJoined: updatedContestData.current_players,
        maxPlayers: updatedContestData.max_players,
        entryFee: updatedContestData.currency_type === 'cash' 
          ? updatedContestData.entry_fee_cash 
          : updatedContestData.entry_fee_coins,
        totalPrizeCredits: totalPrize,
        processingFee: updatedContestData.currency_type === 'cash' 
          ? updatedContestData.processing_fee_cash 
          : updatedContestData.processing_fee_coins,
        currencyType: updatedContestData.currency_type as CurrencyType,
        createdAt: new Date(updatedContestData.created_at).toLocaleString(),
        settledAt: updatedContestData.settled_at 
          ? new Date(updatedContestData.settled_at).toLocaleString() 
          : null,
        players,
        refundReason: updatedContestData.refund_reason
      };

      setSelectedContest(refreshedContest);
      toast.success('Contest view updated with winner information!');
    }
    
    setSelectedWinners([]);
  } catch (error) {
    console.error('Error settling contest:', error);
    toast.error('Failed to settle contest. Check console for details.');
  } finally {
    setSettlingContest(false);
  }
};

  const handleChangePickResult = (contestId: string, odtId: string, pickId: string, newResult: PickResult) => {
    // Store in temporary state instead of updating database
    setTempPickResults(prev => ({
      ...prev,
      [contestId]: {
        ...(prev[contestId] || {}),
        [pickId]: newResult
      }
    }));
    
    // Update the UI by modifying selectedContest
    if (selectedContest) {
      const updatedPlayers = selectedContest.players.map(player => {
        if (player.odtId === odtId) {
          const updatedPicks = player.picks.map(pick => {
            if (pick.id === pickId) {
              return { ...pick, result: newResult };
            }
            return pick;
          });
          
          // Recalculate correct/incorrect picks
          const correctPicks = updatedPicks.filter(p => p.result === 'win').length;
          const incorrectPicks = updatedPicks.filter(p => p.result === 'loss').length;
          
          return {
            ...player,
            picks: updatedPicks,
            correctPicks,
            incorrectPicks
          };
        }
        return player;
      });
      
      setSelectedContest({
        ...selectedContest,
        players: updatedPlayers
      });
    }
    
    toast.success('Pick result updated (not saved yet)');
  };

  // Make Winner Handler
  const handleMakeWinner = async (odtId: string) => {
    if (!selectedContest) return;

    try {
      // Calculate scores based on temporary results
      const playerScores = selectedContest.players.map(player => {
        const score = player.picks.reduce((sum, pick) => {
          const tempResult = tempPickResults[selectedContest.id]?.[pick.id] || pick.result;
          return sum + (tempResult === 'win' ? 10 : 0);
        }, 0);
        return { user_id: player.odtId, score };
      });

      // Sort by score to find top score
      playerScores.sort((a, b) => b.score - a.score);
      const topScore = playerScores[0]?.score || 0;
      
      const selectedPlayerScore = playerScores.find(p => p.user_id === odtId)?.score || 0;
      const userRank = playerScores.findIndex(p => p.user_id === odtId) + 1;

      // Check if selected user has the highest score
      if (selectedPlayerScore < topScore) {
        const confirmed = window.confirm(
          `⚠️ Warning: Total score of this user is at rank ${userRank} with ${selectedPlayerScore} points. The top score is ${topScore} points. Logically, they are not winning. Do you still want them to win?`
        );
        if (!confirmed) return;
      }

      // Update local state to mark as winner (not database yet)
      const updatedPlayers = selectedContest.players.map(player => ({
        ...player,
        isWinner: player.odtId === odtId,
        prizeCredits: player.odtId === odtId ? selectedContest.totalPrizeCredits : 0
      }));

      setSelectedContest({
        ...selectedContest,
        players: updatedPlayers
      });

      toast.success(`@${selectedContest.players.find(p => p.odtId === odtId)?.username} marked as winner (not saved yet)`);
    } catch (error) {
      console.error('Error setting winner:', error);
      toast.error('Failed to set winner');
    }
  };

  const handleToggleWinnerSelection = (odtId: string) => {
    setSelectedWinners(prev => {
      const newSelection = prev.includes(odtId) 
        ? prev.filter(id => id !== odtId) 
        : [...prev, odtId];
      
      // Update UI to show selected winners
      if (selectedContest) {
        const updatedPlayers = selectedContest.players.map(player => ({
          ...player,
          isWinner: newSelection.includes(player.odtId)
        }));
        
        setSelectedContest({
          ...selectedContest,
          players: updatedPlayers
        });
      }
      
      return newSelection;
    });
  };

  const handleSplitPayout = () => {
    if (!selectedContest || selectedWinners.length === 0) return;

    const splitAmount = selectedContest.totalPrizeCredits / selectedWinners.length;

    // Update local state only
    const updatedPlayers = selectedContest.players.map(player => ({
      ...player,
      isWinner: selectedWinners.includes(player.odtId),
      prizeCredits: selectedWinners.includes(player.odtId) ? splitAmount : 0
    }));

    setSelectedContest({
      ...selectedContest,
      players: updatedPlayers
    });

    toast.success(`Prize marked to split between ${selectedWinners.length} winners (not saved yet)`);
  };

  const handleDeclareADraw = () => {
    if (!selectedContest) return;

    const splitAmount = selectedContest.totalPrizeCredits / selectedContest.players.length;

    // Update local state only
    const updatedPlayers = selectedContest.players.map(player => ({
      ...player,
      isWinner: 'draw',
      prizeCredits: splitAmount
    }));

    setSelectedContest({
      ...selectedContest,
      players: updatedPlayers
    });

    toast.success('Contest marked as draw (not saved yet)');
  };


  const openContestDetail = (contest: Contest) => {
    setSelectedContest(contest);
    setSelectedWinners([]);
    // Clear temp pick results when opening a new contest
    setTempPickResults(prev => {
      const newState = { ...prev };
      delete newState[contest.id];
      return newState;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Currency Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">MMA Challenges</h1>
          <p className="text-muted-foreground mt-1">Manage challenge lifecycle, view picks, and settle results</p>
        </div>
        <div className="flex items-center gap-2 p-1 rounded-lg bg-secondary/30">
          <Button
            variant={currencyFilter === "cash" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrencyFilter("cash")}
            className={currencyFilter === "cash" ? "bg-success text-white hover:bg-success/90" : "text-muted-foreground"}
          >
            SP Cash
          </Button>
          <Button
            variant={currencyFilter === "coins" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrencyFilter("coins")}
            className={currencyFilter === "coins" ? "bg-yellow-500 text-black hover:bg-yellow-500/90" : "text-muted-foreground"}
          >
            <Coins className="h-4 w-4 mr-1" />
            SP Coins
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContestStatus)} className="w-full">
        <TabsList className="bg-secondary/30 p-1 h-auto flex-wrap">
          <TabsTrigger value="available" className="data-[state=active]:bg-background">🟢 Available ({stats.available})</TabsTrigger>
          <TabsTrigger value="ready" className="data-[state=active]:bg-background">🔵 Ready ({stats.ready})</TabsTrigger>
          <TabsTrigger value="manual_verification" className="data-[state=active]:bg-background">🟠 Manual Verification ({stats.manual_verification})</TabsTrigger>
          <TabsTrigger value="settled" className="data-[state=active]:bg-background">⚪ Settled ({stats.settled})</TabsTrigger>
          <TabsTrigger value="expired" className="data-[state=active]:bg-background">⚫ Expired ({stats.expired})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by Challenge ID (e.g., CTX-MMA-001)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Contests Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Challenge ID</TableHead>
                <TableHead className="text-muted-foreground">Created By</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Players</TableHead>
                <TableHead className="text-muted-foreground">Challenge Entry</TableHead>
                <TableHead className="text-muted-foreground">ize CreTotal Prdits</TableHead>
                <TableHead className="text-muted-foreground">Processing Fee</TableHead>
                <TableHead className="text-muted-foreground">Created</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContests.map(contest => (
                <TableRow key={contest.id} className="border-border">
                  <TableCell className="font-mono text-foreground">{contest.id}</TableCell>
                  <TableCell className="text-foreground">@{contest.creatorUsername}</TableCell>
                  <TableCell><StatusBadge status={contest.status} /></TableCell>
                  <TableCell><span className={contest.playersJoined === contest.maxPlayers ? "text-success" : "text-foreground"}>{contest.playersJoined} / {contest.maxPlayers}</span></TableCell>
                  <TableCell className={`font-medium ${contest.currencyType === 'coins' ? 'text-yellow-500' : 'text-success'}`}>{formatCurrency(contest.entryFee, contest.currencyType)}</TableCell>
                  <TableCell className={contest.currencyType === 'coins' ? 'text-yellow-500' : 'text-success'}>{formatCurrency(contest.totalPrizeCredits, contest.currencyType)}</TableCell>
                  <TableCell className="text-muted-foreground">{contest.processingFee}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{contest.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openContestDetail(contest)}><Eye className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredContests.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No contests found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contest Detail Modal - Card Style Layout */}
      <Dialog open={!!selectedContest && !showRefundModal && !showSettleModal} onOpenChange={() => setSelectedContest(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-foreground flex items-center gap-3">
              Contest: {selectedContest?.id}
              {selectedContest && <StatusBadge status={selectedContest.status} />}
            </DialogTitle>
          </DialogHeader>

          {selectedContest && (
            <div className="space-y-6 mt-4">
              {/* Contest Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-semibold text-foreground">@{selectedContest.creatorUsername}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Challenge Entry</p>
                  <p className={`font-semibold ${selectedContest.currencyType === 'coins' ? 'text-yellow-500' : 'text-success'}`}>{formatCurrency(selectedContest.entryFee, selectedContest.currencyType)}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="font-semibold text-foreground">{selectedContest.playersJoined}/{selectedContest.maxPlayers}</p>
                </div>
                <div className={`p-4 rounded-lg ${selectedContest.currencyType === 'coins' ? 'bg-yellow-500/10' : 'bg-success/10'}`}>
                  <p className="text-sm text-muted-foreground">Total Prize Credits</p>
                  <p className={`font-semibold ${selectedContest.currencyType === 'coins' ? 'text-yellow-500' : 'text-success'}`}>{formatCurrency(selectedContest.totalPrizeCredits, selectedContest.currencyType)}</p>
                </div>
              </div>

              {/* Expired Contest Reason */}
              {selectedContest.status === "expired" && selectedContest.refundReason && (
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Expiry Reason</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedContest.refundReason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Actions for Manual Verification */}
              {(selectedContest.admin_state === "manual_verification" || selectedContest.admin_state === "ready") && selectedContest.players.length > 1 && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-foreground">Winner Actions:</span>
                      <Button size="sm" variant="outline" onClick={handleDeclareADraw} className="gap-2">
                        <Split className="h-4 w-4" /> Declare Draw (Split All)
                      </Button>
                      {selectedWinners.length >= 2 && (
                        <Button size="sm" variant="default" onClick={handleSplitPayout} className="gap-2">
                          <Split className="h-4 w-4" /> Split Between Selected ({selectedWinners.length})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Picks Cards - Side by Side like Reference Image */}
              {selectedContest.players.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">User Picks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedContest.players.map(player => {
                      const totalPicks = player.picks.length;
                      const resolvedPicks = player.picks.filter(p => p.result !== "pending").length;
                      const pendingPicks = player.picks.filter(p => p.result === "pending").length;
                      
                      return (
                        <Card key={player.odtId} className={`border-2 transition-all ${player.isWinner ? 'border-success bg-success/5' : 'border-border bg-[#1a2332]'}`}>
                          <CardHeader className="pb-2 border-b border-border/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {(selectedContest.status === "manual_verification" || selectedContest.status === "ready") && selectedContest.players.length > 1 && (
                                  <Checkbox
                                    checked={selectedWinners.includes(player.odtId)}
                                    onCheckedChange={() => handleToggleWinnerSelection(player.odtId)}
                                  />
                                )}
                                <div>
                                  <span className="font-semibold text-primary">@{player.username}</span>
                                  {/* Show crown for winners - handle both boolean and string values */}
                                  {(player.isWinner === true || player.isWinner === 'won') && (
                                    <Crown className="inline-block ml-2 h-4 w-4 text-yellow-500" />
                                  )}
                                  {player.isWinner === 'draw' && (
                                    <span className="ml-2 text-xs text-yellow-500 font-medium">(DRAW)</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-primary font-bold">{player.correctPicks * 10} Points</span>
                                <span className="text-muted-foreground text-xs">({player.correctPicks}/{totalPicks})</span>
                                {player.prizeCredits > 0 && (
                                  <Badge className={`${selectedContest.currencyType === 'coins' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-success/20 text-success'}`}>
                                    {formatCurrency(player.prizeCredits, selectedContest.currencyType)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            {player.picks.map((pick, idx) => {
                              const currentResult = tempPickResults[selectedContest.id]?.[pick.id] || pick.result;
                              const isPending = pick.result === "pending";
                              const isWin = pick.result === "win";
                              const isLoss = pick.result === "loss";
                              const isPush = pick.result === "push";
                              
                              return (
                                <div key={pick.id} className={`flex items-center gap-3 p-3 ${idx !== player.picks.length - 1 ? 'border-b border-border/30' : ''} ${isWin ? 'bg-success/10' : isLoss ? 'bg-destructive/10' : isPush ? 'bg-warning/10' : ''}`}>
                                  <img src={pick.fighterImage} alt={pick.fighter} className="w-12 h-12 rounded-full object-cover bg-secondary" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">{pick.fighter}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {pick.matchup} • {pick.category} {pick.selection.toUpperCase()} {pick.line}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isPending ? (
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-xs">Waiting</span>
                                      </div>
                                    ) : (
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs font-bold ${
                                          isWin ? 'border-success/50 text-success' : 
                                          isLoss ? 'border-destructive/50 text-destructive' : 
                                          'border-warning/50 text-warning'
                                        }`}
                                      >
                                        {isWin ? '+10 Points' : isLoss ? '0 Points' : 'PUSH'}
                                      </Badge>
                                    )}
                                    {(selectedContest.status === "manual_verification" || selectedContest.status === "ready") && (
                                      <Select
                                        value={pick.result}
                                        onValueChange={(value) => handleChangePickResult(selectedContest.id, player.odtId, pick.id, value as PickResult)}
                                      >
                                        <SelectTrigger className="w-24 h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="win">Win</SelectItem>
                                          <SelectItem value="loss">Loss</SelectItem>
                                          <SelectItem value="push">Push</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {/* Make Winner Button */}
                            {(selectedContest.status === "manual_verification" || selectedContest.status === "ready") && !player.isWinner && (
                              <div className="p-3 border-t border-border/30">
                                <Button size="sm" variant="ghost" className="w-full text-muted-foreground hover:text-foreground gap-2" onClick={() => handleMakeWinner(player.odtId)}>
                                  <Trophy className="h-4 w-4" /> Make @{player.username} Winner
                                </Button>
                              </div>
                            )}
                            {/* Winner status footer - updated to handle all winner states */}
                              {(player.isWinner === true || player.isWinner === 'won') && (
                                <div className={`p-3 border-t ${selectedContest.currencyType === 'coins' ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-success/30 bg-success/10'}`}>
                                  <div className={`flex items-center justify-center gap-2 ${selectedContest.currencyType === 'coins' ? 'text-yellow-500' : 'text-success'}`}>
                                    <Trophy className="h-4 w-4" />
                                    <span className="font-medium"> Winner – Prize Credits:{' '}
                                      {formatCurrency(
                                        getPrizeForPlayer(player.odtId),
                                        selectedContest.currencyType
                                      )}</span>
                                  </div>
                                </div>
                              )}
                              {player.isWinner === 'draw' && (
                                <div className="p-3 border-t border-yellow-500/30 bg-yellow-500/10">
                                  <div className="flex items-center justify-center gap-2 text-yellow-500">
                                    <Split className="h-4 w-4" />
                                    <span className="font-medium">Draw - Prize Credits:{' '}
                                    {formatCurrency(
                                      getPrizeForPlayer(player.odtId),
                                      selectedContest.currencyType
                                    )}</span>
                                  </div>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No players have joined this challenge yet</div>
              )}

              {/* Admin Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                {(selectedContest.admin_state === "available" || selectedContest.admin_state === "ready") && (
                  <Button variant="destructive" onClick={() => setShowRefundModal(true)} className="flex items-center gap-2">
                    Force Refund
                  </Button>
                )}
                {(selectedContest.admin_state === "manual_verification" || selectedContest.admin_state === "ready") && (
                  <Button variant="outline" onClick={() => setShowSettleModal(true)} className="flex items-center gap-2">
                    Force Settle
                  </Button>
                )}
                {selectedContest.admin_state === "settled" && (
                  <div className="text-sm text-muted-foreground">
                    Contest settled on {selectedContest.settledAt}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" /> Force Refund Contest
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">This will cancel the contest and refund all entry fees to participants. This action is logged and auditable.</p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Refund Reason (Required)</label>
              <Textarea placeholder="Enter the reason for refunding this contest..." value={refundReason} onChange={e => setRefundReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleForceRefund} disabled={!refundReason.trim()}>Confirm Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force Settle Modal */}
      <Dialog open={showSettleModal} onOpenChange={setShowSettleModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" /> Force Settle Challenge
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">This will manually settle the contest using the current pick results. Make sure all picks have been resolved before settling.</p>
            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <p className="text-sm text-warning">⚠️ Make sure all pick results are correctly set before settling.</p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettleModal(false)}>Cancel</Button>
            <Button onClick={handleForceSettle}>Confirm Settlement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
