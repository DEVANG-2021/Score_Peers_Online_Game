import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Handshake, RotateCcw, Coins, Banknote } from "lucide-react";

const getExamples = (currencyType: 'coins' | 'cash') => {
  const entryLabel = currencyType === 'coins' ? 'SP Coins' : 'SP Cash';
  const prizeLabel = currencyType === 'coins' ? 'SP Coins' : 'SP Cash';
  const entryAmount = currencyType === 'coins' ? '25,000' : '10';
  const entryAmount2 = currencyType === 'coins' ? '15,000' : '5';

  return [
    {
      icon: Trophy,
      title: "2 Players – 3 Prediction Challenge",
      setup: {
        players: 2,
        entryFee: `${entryAmount} ${entryLabel} each`,
        totalPrize: `${prizeLabel} Prize`,
      },
      results: [
        { player: "Player A", picks: "2 correct", points: "20 pts" },
        { player: "Player B", picks: "1 correct", points: "10 pts" },
      ],
      outcome: {
        type: "win",
        text: `Player A finishes first and earns ${prizeLabel}`,
        payout: "Prize distributed based on ranking",
        note: "Even though Player A missed a prediction, they scored higher and won!",
      },
    },
    {
      icon: Handshake,
      title: "2 Players – Tie Score",
      setup: {
        players: 2,
        entryFee: `${entryAmount} ${entryLabel} each`,
        totalPrize: `${prizeLabel} Prize`,
      },
      results: [
        { player: "Player A", picks: "2 correct", points: "20 pts" },
        { player: "Player B", picks: "2 correct", points: "20 pts" },
      ],
      outcome: {
        type: "draw",
        text: `Tie — players with the same score split ${prizeLabel} prizes evenly`,
        payout: `${prizeLabel} split equally`,
        note: null,
      },
    },
    {
      icon: Users,
      title: "6 Players – 5 Prediction Challenge",
      setup: {
        players: 6,
        entryFee: `${entryAmount2} ${entryLabel} each`,
        totalPrize: `${prizeLabel} Prize`,
      },
      results: [
        { player: "Player A", picks: "4 correct", points: "40 pts" },
        { player: "Player B", picks: "4 correct", points: "40 pts" },
        { player: "Player C", picks: "3 correct", points: "30 pts" },
        { player: "Player D", picks: "3 correct", points: "30 pts" },
        { player: "Player E", picks: "1 correct", points: "10 pts" },
        { player: "Player F", picks: "1 correct", points: "10 pts" },
      ],
      outcome: {
        type: "split",
        text: `Player A & Player B split ${prizeLabel} prize`,
        payout: "Top scores share prize equally",
        note: null,
      },
    },
    {
      icon: RotateCcw,
      title: "All Players Score Zero",
      setup: {
        players: 6,
        entryFee: `${entryAmount2} ${entryLabel} each`,
        totalPrize: `${prizeLabel} Prize`,
      },
      results: [
        { player: "Everyone", picks: "0 correct", points: "0 pts" },
      ],
      outcome: {
        type: "refund",
        text: "Challenge ends with no prize awarded",
        payout: `All ${entryLabel} entries returned`,
        note: null,
      },
    },
  ];
};

export const Examples = () => {
  const [currencyType, setCurrencyType] = useState<'coins' | 'cash'>('coins');
  const examples = getExamples(currencyType);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-card/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Real Examples
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            See How <span className="text-gradient-primary">Scoring</span> Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Each correct prediction = 10 points. Highest score wins!
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

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {examples.map((example, index) => (
            <motion.div
              key={`${example.title}-${currencyType}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-background border border-border/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <example.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground">{example.title}</h3>
              </div>

              {/* Setup */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="px-3 py-1 rounded-full bg-secondary">
                  <span className="text-muted-foreground">Players: </span>
                  <span className="text-foreground font-medium">{example.setup.players}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-secondary flex items-center gap-1">
                  {currencyType === 'coins' ? (
                    <Coins className="w-3 h-3 text-yellow-500" />
                  ) : (
                    <Banknote className="w-3 h-3 text-emerald-500" />
                  )}
                  <span className="text-muted-foreground">Entry: </span>
                  <span className="text-foreground font-medium">{example.setup.entryFee}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-secondary flex items-center gap-1">
                  {currencyType === 'coins' ? (
                    <Coins className="w-3 h-3 text-yellow-500" />
                  ) : (
                    <Banknote className="w-3 h-3 text-emerald-500" />
                  )}
                  <span className="text-muted-foreground">Prize: </span>
                  <span className="text-foreground font-medium">{example.setup.totalPrize}</span>
                </div>
              </div>

              {/* Results Table */}
              <div className="mb-4 space-y-2">
                {example.results.map((result) => (
                  <div key={result.player} className="flex items-center justify-between px-3 py-2 rounded-lg bg-card">
                    <span className="text-sm text-muted-foreground">{result.player}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{result.picks}</span>
                      <span className="text-sm font-bold text-primary">{result.points}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Outcome */}
              <div className={`p-4 rounded-xl ${
                example.outcome.type === 'win' ? 'bg-success/10 border border-success/20' :
                example.outcome.type === 'split' ? 'bg-primary/10 border border-primary/20' :
                example.outcome.type === 'draw' ? 'bg-warning/10 border border-warning/20' :
                'bg-secondary border border-border'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg ${
                    example.outcome.type === 'win' || example.outcome.type === 'split' ? 'text-success' :
                    example.outcome.type === 'draw' ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    {example.outcome.type === 'win' || example.outcome.type === 'split' ? '🏆' : 
                     example.outcome.type === 'draw' ? '🤝' : '🔄'}
                  </span>
                  <span className="font-semibold text-foreground">{example.outcome.text}</span>
                </div>
                <p className="text-sm text-primary font-medium flex items-center gap-1">
                  {currencyType === 'coins' ? (
                    <Coins className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Banknote className="w-4 h-4 text-emerald-500" />
                  )}
                  {example.outcome.payout}
                </p>
                {example.outcome.note && (
                  <p className="text-xs text-muted-foreground mt-2">{example.outcome.note}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
