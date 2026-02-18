import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Clock, Trophy, Coins, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const spCashChallenges = [
  {
    sport: "🥊",
    league: "UFC",
    predictions: 3,
    players: { current: 2, max: 2 },
    entry: 5,
    status: "full",
    timeRemaining: "2h 30m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 5,
    players: { current: 4, max: 6 },
    entry: 10,
    status: "open",
    timeRemaining: "5h 15m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 4,
    players: { current: 1, max: 2 },
    entry: 20,
    status: "open",
    timeRemaining: "3h 45m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 6,
    players: { current: 5, max: 8 },
    entry: 50,
    status: "open",
    timeRemaining: "1d 2h",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 5,
    players: { current: 3, max: 4 },
    entry: 100,
    status: "open",
    timeRemaining: "6h 10m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 3,
    players: { current: 2, max: 2 },
    entry: 20,
    status: "full",
    timeRemaining: "45m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 2,
    players: { current: 1, max: 4 },
    entry: 10,
    status: "open",
    timeRemaining: "4h 20m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 4,
    players: { current: 6, max: 10 },
    entry: 5,
    status: "open",
    timeRemaining: "8h 30m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 3,
    players: { current: 2, max: 6 },
    entry: 50,
    status: "open",
    timeRemaining: "1h 15m",
  },
];

const spCoinsChallenges = [
  {
    sport: "🥊",
    league: "UFC",
    predictions: 4,
    players: { current: 3, max: 4 },
    entry: 10000,
    status: "open",
    timeRemaining: "1h 45m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 2,
    players: { current: 1, max: 2 },
    entry: 5000,
    status: "open",
    timeRemaining: "3h 20m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 6,
    players: { current: 7, max: 10 },
    entry: 50000,
    status: "open",
    timeRemaining: "12h 30m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 3,
    players: { current: 2, max: 2 },
    entry: 20000,
    status: "full",
    timeRemaining: "25m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 5,
    players: { current: 4, max: 8 },
    entry: 100000,
    status: "open",
    timeRemaining: "2d 5h",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 4,
    players: { current: 5, max: 6 },
    entry: 25000,
    status: "open",
    timeRemaining: "4h 50m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 3,
    players: { current: 1, max: 4 },
    entry: 15000,
    status: "open",
    timeRemaining: "7h 10m",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 5,
    players: { current: 3, max: 4 },
    entry: 75000,
    status: "open",
    timeRemaining: "1d 8h",
  },
  {
    sport: "🥊",
    league: "UFC",
    predictions: 2,
    players: { current: 4, max: 6 },
    entry: 8000,
    status: "open",
    timeRemaining: "55m",
  },
];

export const ContestPreview = () => {
  const navigate = useNavigate();
  const [currencyType, setCurrencyType] = useState<'coins' | 'cash'>('coins');
  
  const challenges = currencyType === 'coins' ? spCoinsChallenges : spCashChallenges;
  const currencyLabel = currencyType === 'coins' ? 'SP Coins' : 'SP Cash';

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const calculatePrize = (entry: number, maxPlayers: number) => {
    return formatNumber(entry * maxPlayers);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Available Now
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Sample <span className="text-gradient-primary">Challenges</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Here is what active challenges look like. Join the action!
          </p>
        </motion.div>

        {/* Currency Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex rounded-full bg-card border border-border/50 p-1">
            <button
              onClick={() => setCurrencyType('coins')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currencyType === 'coins'
                  ? 'bg-yellow-500/20 text-yellow-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Coins className="w-4 h-4" />
              SP Coins
            </button>
            <button
              onClick={() => setCurrencyType('cash')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currencyType === 'cash'
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Banknote className="w-4 h-4" />
              SP Cash
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {challenges.map((challenge, index) => (
            <motion.div
              key={`${challenge.league}-${index}-${currencyType}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{challenge.sport}</span>
                  <span className="font-display font-semibold text-foreground">{challenge.league}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  challenge.status === 'full' 
                    ? 'bg-muted text-muted-foreground' 
                    : 'bg-success/10 text-success'
                }`}>
                  {challenge.status === 'full' ? 'FULL' : 'JOIN'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {currencyType === 'coins' ? (
                      <Coins className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Banknote className="w-4 h-4 text-emerald-500" />
                    )}
                    <span>Entry</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatNumber(challenge.entry)} {currencyLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {currencyType === 'coins' ? (
                      <Coins className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Banknote className="w-4 h-4 text-emerald-500" />
                    )}
                    <span>Prize</span>
                  </div>
                  <span className={`font-semibold ${currencyType === 'coins' ? 'text-yellow-500' : 'text-emerald-500'}`}>
                    {calculatePrize(challenge.entry, challenge.players.max)} {currencyLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selections</span>
                  <span className="font-semibold text-foreground">{challenge.predictions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Players</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {challenge.players.current}/{challenge.players.max}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Time</span>
                  </div>
                  <span className="font-semibold text-foreground">{challenge.timeRemaining}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div 
                  className={`h-full rounded-full ${challenge.status === 'full' ? 'bg-muted-foreground' : 'bg-primary'}`}
                  style={{ width: `${(challenge.players.current / challenge.players.max) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Button variant="hero" size="lg" onClick={() => navigate('/challenge')} className="gap-2">
            <Trophy className="w-5 h-5" />
            View All Challenges
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
