import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface CTAProps {
  onGetStarted?: () => void;
}
export const CTA = ({
  onGetStarted
}: CTAProps) => {
  const navigate = useNavigate();
  return <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
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
      }} className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Stop Missing by <span className="text-gradient-primary">One Prediction</span>
          </h2>
          
          <p className="text-xl text-foreground font-medium mb-4">
            Start winning by outscoring others.
          </p>
          
          
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" className="gap-2" onClick={onGetStarted}>
              <Trophy className="w-5 h-5" />
              Create a Challenge
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="xl" className="gap-2" onClick={() => navigate('/contests')}>
              <Users className="w-5 h-5" />
              Join a Challenge
            </Button>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Skill-Based Results</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>24/7 Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>;
};