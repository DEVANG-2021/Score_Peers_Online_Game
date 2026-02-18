import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Users, Trophy, ArrowRight, Eye, Coins } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface Contest {
  id: string;
  name: string;
  predictions: number;
  entryFee: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'open' | 'active' | 'completed' | 'expired';
  sport: string;
  createdBy: string;
}

interface ContestCardProps {
  contest: Contest;
  onJoin?: (id: string, contest: Contest) => void;
  onDelete?: (id: string) => void;
  onReview?: (id: string, contest: Contest) => void;
  isCreator?: boolean;
  currentUserId?: string;
  hasJoined?: boolean;
}

export const ContestCard = ({ contest, onJoin, onDelete, onReview, isCreator = false, currentUserId, hasJoined = false }: ContestCardProps) => {
  const { currencyType } = useCurrency();
  
  const statusColors = {
    open: 'bg-primary/20 text-primary border-primary/30',
    active: 'bg-accent/20 text-accent border-accent/30',
    completed: 'bg-success/20 text-success border-success/30',
    expired: 'bg-muted/20 text-muted-foreground border-muted/30',
  };

  const isFull = contest.currentPlayers >= contest.maxPlayers;
  const currencyLabel = currencyType === 'coins' ? 'SP Coins' : 'SP Cash';
  const currencyColor = currencyType === 'coins' ? 'text-yellow-500' : 'text-success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card variant="contest" className="overflow-hidden">
        {/* Header */}
        <div className="p-4 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {contest.name}
              </h3>
              <p className="text-xs text-muted-foreground">{contest.sport}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${statusColors[contest.status]} text-xs capitalize`}
          >
            {contest.status}
          </Badge>
        </div>

        <CardContent className="p-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-secondary/50">
              <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <Coins className={`w-3 h-3 ${currencyColor}`} />
                Entry
              </div>
              <div className="font-semibold text-foreground">{contest.entryFee}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/50">
              <div className="text-xs text-muted-foreground mb-1">Players</div>
              <div className="font-semibold text-foreground">
                {contest.currentPlayers}/{contest.maxPlayers}
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/50">
              <div className="text-xs text-muted-foreground mb-1">Predictions</div>
              <div className="font-semibold text-primary">{contest.predictions}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(contest.currentPlayers / contest.maxPlayers) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {contest.createdBy}
              </span>
            </div>
            
            {hasJoined ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReview?.(contest.id, contest)}
                className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Eye className="w-3 h-3" />
                Review
              </Button>
            ) : (
              <Button
                variant={isFull ? "secondary" : "hero"}
                size="sm"
                disabled={isFull || contest.status !== 'open'}
                onClick={() => onJoin?.(contest.id, contest)}
                className="gap-1"
              >
                {isFull ? 'Full' : 'Join'}
                {!isFull && <ArrowRight className="w-3 h-3" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
