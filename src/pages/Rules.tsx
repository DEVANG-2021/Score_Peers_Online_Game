import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Users, 
  Target, 
  CheckCircle, 
  XCircle,
  Heart,
  Scale,
  Coins,
  Banknote,
  ListChecks,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeeEntry {
  entry: number;
  fee: number;
}

interface DatabaseFee {
  id: string;
  currency_type: "sp_cash" | "sp_coins";
  entry_amount: number;
  processing_fee: number;
}

const Rules = () => {
  const [isCash, setIsCash] = useState(true);
  const [spCashFees, setSpCashFees] = useState<FeeEntry[]>([]);
  const [spCoinsFees, setSpCoinsFees] = useState<FeeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data: fees, error } = await supabase
        .from("platform_settings")
        .select("*")
        .order("entry_amount", { ascending: true });

      if (error) {
        console.error("Error fetching fee settings:", error);
        toast.error("Failed to load fee settings");
        return;
      }

      if (!fees) {
        console.log("No fee settings found");
        return;
      }

      // Process SP Coins fees
      const coinsFees = fees
        .filter((f: DatabaseFee) => f.currency_type === "sp_coins")
        .map((f: DatabaseFee) => ({ 
          entry: Number(f.entry_amount), 
          fee: Number(f.processing_fee) 
        }));

      // Process SP Cash fees
      const cashFees = fees
        .filter((f: DatabaseFee) => f.currency_type === "sp_cash")
        .map((f: DatabaseFee) => ({ 
          entry: Number(f.entry_amount), 
          fee: Number(f.processing_fee) 
        }));

      setSpCoinsFees(coinsFees);
      setSpCashFees(cashFees);

      // Set default fees if database is empty
      if (coinsFees.length === 0) {
        setSpCoinsFees([
          { entry: 1000, fee: 50 },
          { entry: 10000, fee: 500 },
          { entry: 20000, fee: 1000 },
          { entry: 50000, fee: 2000 },
          { entry: 100000, fee: 3000 },
          { entry: 500000, fee: 5000 },
        ]);
      }

      if (cashFees.length === 0) {
        setSpCashFees([
          { entry: 5, fee: 0.25 },
          { entry: 10, fee: 0.25 },
          { entry: 20, fee: 0.50 },
          { entry: 50, fee: 2 },
          { entry: 100, fee: 5 },
          { entry: 200, fee: 5 },
          { entry: 300, fee: 10 },
          { entry: 400, fee: 15 },
          { entry: 500, fee: 20 },
        ]);
      }
    } catch (err) {
      console.error("Unexpected error in fetchSettings:", err);
      toast.error("An error occurred while loading settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const formatCurrency = (amount: number, isCash: boolean) => {
    if (isCash) {
      return `${amount.toFixed(2)} SP Cash`;
    } else {
      return `${amount.toLocaleString()} SP Coins`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              Official Rules
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              How <span className="text-gradient-primary">Score Peers</span> Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Score Peers is a skill-based sweepstakes challenge platform. Players compete by earning points through predictions. Results are determined by total score, not perfect picks.
            </p>
          </motion.div>

          {/* Key Concept */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-xl font-semibold text-foreground mb-2">
                  Each correct prediction earns 10 points. The highest total score earns the challenge prize.
                </p>
                <p className="text-muted-foreground">
                  Missing one or more predictions does not eliminate a player.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scoring System */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Scoring System
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
                    <CheckCircle className="w-6 h-6 text-success shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Correct prediction</p>
                      <p className="text-sm text-muted-foreground">= 10 points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <XCircle className="w-6 h-6 text-destructive shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Incorrect prediction</p>
                      <p className="text-sm text-muted-foreground">= 0 points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                    <AlertCircle className="w-6 h-6 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Missed predictions</p>
                      <p className="text-sm text-muted-foreground">do not eliminate you</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <Trophy className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Rankings</p>
                      <p className="text-sm text-muted-foreground">based on total points</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Challenge Outcomes */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Challenge Outcomes
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
                  <Trophy className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  <p className="text-foreground">Player with the highest score earns the challenge prize</p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-foreground">If multiple players tie for highest score, the prize is split evenly</p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                  <XCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-foreground">If all players score zero, the challenge ends with no prize issued</p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Challenge Entry & Processing Fees */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <Scale className="w-8 h-8 text-primary" />
              Challenge Entry & Processing Fees
            </h2>
            <p className="text-muted-foreground mb-6">
              Score Peers charges a processing fee when a challenge is created or joined. If a challenge ends in a draw, all SP Cash or SP Coins, including the processing fee, are fully returned.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-4 mb-6 p-4 rounded-xl bg-secondary/50">
              <div className={`flex items-center gap-2 transition-opacity ${!isCash ? 'opacity-100' : 'opacity-50'}`}>
                <Coins className="w-5 h-5 text-yellow-500" />
                <Label htmlFor="currency-toggle" className="font-medium cursor-pointer">
                  SP Coins
                </Label>
              </div>
              <Switch
                id="currency-toggle"
                checked={isCash}
                onCheckedChange={setIsCash}
              />
              <div className={`flex items-center gap-2 transition-opacity ${isCash ? 'opacity-100' : 'opacity-50'}`}>
                <Banknote className="w-5 h-5 text-success" />
                <Label htmlFor="currency-toggle" className="font-medium cursor-pointer">
                  SP Cash
                </Label>
              </div>
            </div>

            {/* Fee Tables */}
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className={`${isCash ? 'bg-success/10' : 'bg-yellow-500/10'}`}>
                <CardTitle className="flex items-center gap-2">
                  {isCash ? (
                    <>
                      <Banknote className="w-5 h-5 text-success" />
                      SP Cash Challenges
                    </>
                  ) : (
                    <>
                      <Coins className="w-5 h-5 text-yellow-500" />
                      SP Coins Challenges
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading fee settings...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Challenge Entry</TableHead>
                        <TableHead>Processing Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(isCash ? spCashFees : spCoinsFees).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {formatCurrency(row.entry, isCash)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatCurrency(row.fee, isCash)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.section>

          {/* Challenge Creation Rules */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <ListChecks className="w-8 h-8 text-primary" />
              Challenge Creation Rules
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <p className="text-foreground">Users may create unlimited challenges</p>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <p className="text-foreground">Once created, a challenge cannot be deleted</p>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <p className="text-foreground">Once joined, predictions are final</p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Selection Rules */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Selection Rules
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <p className="text-foreground">Each player or outcome may be selected once per challenge</p>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  <p className="text-foreground">Duplicate selections are not allowed</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <p className="text-foreground">Selections must match the challenge category</p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Event Outcomes & Special Cases */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <Heart className="w-8 h-8 text-destructive" />
              Event Outcomes & Special Cases
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Fight Canceled</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  If a fight gets canceled → <span className="text-success font-medium">+10 points</span> (regardless of over/under)
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Accidental Injury</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  If a fighter gets accidentally injured (broken arm, leg, jaw, or dislocated shoulder/knee) → <span className="text-success font-medium">+10 points</span> (regardless of over/under)
                </CardContent>
              </Card>
              <Card className="border-border/50 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">No Contest & Disqualification</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  If a fight ends in No Contest or Disqualification → <span className="text-success font-medium">+10 points</span> (regardless of over/under)
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* No Pushes */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <Scale className="w-8 h-8 text-primary" />
              No Pushes — Pushes Count as Points
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">Score Peers does not use traditional "push" rules.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <p className="text-sm">
                      <span className="font-medium text-foreground">Over 30 Significant Strikes</span> → fighter lands 30 → <span className="text-success font-medium">+10 points</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <p className="text-sm">
                      <span className="font-medium text-foreground">Under 30 Significant Strikes</span> → fighter lands 30 → <span className="text-success font-medium">+10 points</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Final Results */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Final Results
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <p className="text-foreground">Results are settled using official league statistics</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <p className="text-foreground">Scores are final once confirmed</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <p className="text-foreground">Stat corrections follow official league updates</p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Currency Definitions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <Coins className="w-8 h-8 text-primary" />
              Currency Definitions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-yellow-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    SP Coins
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Entertainment-only currency used for challenge entry
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-success" />
                    SP Cash
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Sweepstakes prize currency earned through free methods or challenge results
                </CardContent>
              </Card>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Rules;