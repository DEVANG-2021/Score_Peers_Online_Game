import { motion } from "framer-motion";
import { UserPlus, Trophy, Target, BarChart3 } from "lucide-react";

const steps = [{
  icon: UserPlus,
  step: "01",
  title: "Create or Join a Challenge",
  description: "Choose a sport, number of players, and number of picks. Enter the challenge using SP Coins or SP Cash."
}, {
  icon: Target,
  step: "02",
  title: "Make Your Picks",
  description: "Select player outcomes for the challenge. All picks are scored equally and used only for point scoring."
}, {
  icon: BarChart3,
  step: "03",
  title: "Earn Points",
  description: "Correct pick = 10 points. Incorrect pick = 0 points. Missing a pick does not eliminate you."
}, {
  icon: Trophy,
  step: "04",
  title: "Top Score Earns the Rewards",
  description: "When the challenge ends, players are ranked by total points. The highest score earns the challenge rewards in SP Coins or SP Cash, depending on the challenge."
}];

export const HowItWorks = () => {
  return <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5
      }} className="text-center mb-8">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            How Score Peers <span className="text-gradient-primary">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-4">
            Score Peers is a skill-based sweepstakes game where players compete by scoring points.
          </p>
          <p className="text-foreground font-medium max-w-xl mx-auto">
            You join challenges using SP Coins or SP Cash. Players with the highest score earn the rewards.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => <motion.div key={step.step} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1
        }} className="relative group">
              <div className="p-6 rounded-2xl bg-card border border-border/50 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-glow">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-display font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Connector Line (hidden on last item) */}
              {index < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-border/50" />}
            </motion.div>)}
        </div>
      </div>
    </section>;
};
