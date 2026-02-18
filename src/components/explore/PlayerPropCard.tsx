import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";

interface PlayerProp {
  id: string;
  sport: string;
  league: string;
  game_date: string;
  home_team: string;
  away_team: string;
  player_name: string;
  player_image: string | null;
  prop_type: string;
  line: number;
  over_odds: number;
  under_odds: number;
}

interface PlayerPropCardProps {
  prop: PlayerProp;
  isOverSelected: boolean;
  isUnderSelected: boolean;
  onSelectOver: () => void;
  onSelectUnder: () => void;
  index?: number;
}

const formatPropType = (propType: string) => {
  const labels: Record<string, string> = {
    'significant_strikes': 'Sig. Strikes',
    'total_strikes': 'Total Strikes',
    'round_line': 'Round Line',
    'takedowns': 'Takedowns',
  };
  return labels[propType] || propType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const PlayerPropCard = ({ 
  prop, 
  isOverSelected, 
  isUnderSelected,
  onSelectOver, 
  onSelectUnder,
  index = 0
}: PlayerPropCardProps) => {
  const gameDate = new Date(prop.game_date);
  const dayName = gameDate.toLocaleDateString('en-US', { weekday: 'short' });
  const time = gameDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
    >
      {/* Player Image */}
      <div className="flex justify-center py-3">
        <Avatar className="h-24 w-24 border-0">
          {prop.player_image ? (
            <AvatarImage src={prop.player_image} alt={prop.player_name} className="object-cover object-top" />
          ) : null}
          <AvatarFallback className="bg-secondary text-foreground text-xl font-semibold">
            {prop.player_name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Player Info */}
      <div className="text-center px-3 pb-3">
        {/* Player Name */}
        <h3 className="font-semibold text-foreground text-sm leading-tight">
          {prop.player_name}
        </h3>
        
        {/* Game Info */}
        <p className="text-xs text-muted-foreground mt-0.5">
          {prop.fights ? (
            <>
              {prop.fights.fighter_a} vs {prop.fights.fighter_b}
            </>
          ) : (
            'Fight TBD'
          )}
        </p>

        {/* Line */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-2xl font-bold text-foreground">{prop.line}</span>
          <span className="text-sm text-muted-foreground">{formatPropType(prop.prop_type)}</span>
        </div>
      </div>

      {/* Less/More Buttons */}
      <div className="grid grid-cols-2 border-t border-border">
        <button
          onClick={onSelectUnder}
          className={`flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all border-r border-border ${
            isUnderSelected 
              ? 'bg-red-600 text-white' 
              : 'hover:bg-secondary/50 text-foreground'
          }`}
        >
          <ArrowDown className="w-4 h-4" />
          Less
        </button>
        <button
          onClick={onSelectOver}
          className={`flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all ${
            isOverSelected 
              ? 'bg-green-600 text-white' 
              : 'hover:bg-secondary/50 text-foreground'
          }`}
        >
          <ArrowUp className="w-4 h-4" />
          More
        </button>
      </div>
    </motion.div>
  );
};
