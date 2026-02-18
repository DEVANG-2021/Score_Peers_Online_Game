import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check, Users, Trophy, Coins, CircleDollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface HeroSectionProps {
  onGetStarted?: () => void;
}
export const HeroSection = ({
  onGetStarted
}: HeroSectionProps) => {
  const navigate = useNavigate();
  const valueProps = ["No Platform Interference", "Your Score Still Counts", "Player-vs-Player Challenges"];
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card pb-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Floating Elements */}
      <motion.div className="absolute top-32 left-[10%] w-20 h-20 rounded-2xl bg-gradient-primary opacity-10 blur-xl" animate={{
      y: [0, -20, 0],
      rotate: [0, 5, 0]
    }} transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }} />
      <motion.div className="absolute top-48 right-[15%] w-32 h-32 rounded-full bg-accent/10 blur-2xl" animate={{
      y: [0, 20, 0],
      rotate: [0, -5, 0]
    }} transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1
    }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Headline */}
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }} className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            Compete With Your
            <br />
            <span className="text-gradient-primary">Peers.</span>
            <br />
            Skill Sets the Score.
          </motion.h1>

          {/* Subtitle */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="max-w-2xl mx-auto mb-8">
            <p className="text-muted-foreground">
              Score Peers is a skill-based sweepstakes platform where players compete in score-based challenges against other players.
              <br className="hidden sm:block" />
              <span className="text-primary font-medium">Each correct prediction = 10 points. Highest score wins!</span>
            </p>
          </motion.div>

          {/* Value Props */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }} className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {valueProps.map((prop, index) => <motion.div key={prop} initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.3,
            delay: 0.4 + index * 0.1
          }} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <Check className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-foreground">{prop}</span>
              </motion.div>)}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.5
        }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button variant="hero" size="xl" className="gap-2" onClick={onGetStarted}>
              <Trophy className="w-5 h-5" />
              Create a Challenge
            </Button>
            <Button variant="glass" size="xl" className="gap-2" onClick={() => navigate('/contests')}>
              <Users className="w-5 h-5" />
              Join a Challenge
            </Button>
          </motion.div>
        </div>

        {/* Stats Section */}
        
      </div>
    </section>;
};