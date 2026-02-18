import { motion } from "framer-motion";
import { Shield, Zap, Users, TrendingUp, Lock, Award } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Peer-to-Peer Betting",
    description: "No house edge. Compete directly against other players. The winner takes the pot minus a small platform fee.",
    highlight: "0% House Edge",
  },
  {
    icon: Shield,
    title: "Secure Escrow",
    description: "All entry fees are held in secure escrow until contest completion. Guaranteed fair payouts every time.",
    highlight: "100% Secure",
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description: "Win a contest? Get paid immediately. No waiting periods, no withdrawal limits, no hassle.",
    highlight: "< 1 Min",
  },
  {
    icon: TrendingUp,
    title: "Live Odds",
    description: "Real-time odds from top sportsbooks. Make informed picks with the latest lines and spreads.",
    highlight: "Real-Time",
  },
  {
    icon: Lock,
    title: "Provably Fair",
    description: "Transparent contest rules and automatic result verification. Every outcome is verifiable on-chain.",
    highlight: "Verified",
  },
  {
    icon: Award,
    title: "Leaderboards & Rewards",
    description: "Climb the ranks, earn badges, and unlock exclusive contests. Prove you're the best bettor.",
    highlight: "Earn More",
  },
];

export const Features = () => {
  return (
    <section className="py-24 relative">
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
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Built for <span className="text-gradient-primary">Winners</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to dominate your friends and prove your sports knowledge.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="p-6 rounded-2xl bg-background border border-border/50 h-full transition-all duration-300 hover:border-primary/30 hover:bg-card/50">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {feature.highlight}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
