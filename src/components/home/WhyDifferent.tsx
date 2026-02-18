import { motion } from "framer-motion";
import { Target, TrendingUp, Users, Award, Zap } from "lucide-react";

const highlights = [
  { icon: Target, text: "Score-based challenges" },
  { icon: TrendingUp, text: "Every prediction earns points" },
  { icon: Users, text: "Missing a prediction does not eliminate you" },
  { icon: Award, text: "Rankings based on total score" },
  { icon: Zap, text: "Skill-driven competition" },
];

export const WhyDifferent = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
              The Difference
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Why Score Peers Is <span className="text-gradient-primary">Different</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-16 space-y-6"
          >
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Score Peers is built around score-based challenges where performance matters from start to finish.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Challenges are decided by total points, not perfect predictions. Every correct prediction adds to your score, and missing one does not eliminate you.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Players are ranked by accuracy and consistency, creating a competitive experience driven by skill and scoring, not all-or-nothing outcomes.
            </p>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {highlights.map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 px-5 py-3 rounded-full bg-primary/10 border border-primary/20"
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
