import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  winnings: number;
  wins: number;
  winRate: number;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'SportsKing99', winnings: 12450, wins: 47, winRate: 68 },
  { rank: 2, username: 'ParlayPro', winnings: 9820, wins: 38, winRate: 62 },
  { rank: 3, username: 'BetMaster', winnings: 8350, wins: 41, winRate: 58 },
  { rank: 4, username: 'ChampionBets', winnings: 6720, wins: 29, winRate: 55 },
  { rank: 5, username: 'WinnerCircle', winnings: 5430, wins: 24, winRate: 52 },
  { rank: 6, username: 'LuckyStreak', winnings: 4890, wins: 22, winRate: 51 },
  { rank: 7, username: 'TopDog22', winnings: 4210, wins: 19, winRate: 48 },
  { rank: 8, username: 'ElitePlayer', winnings: 3850, wins: 17, winRate: 47 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 2:
      return 'bg-gray-400/10 border-gray-400/30';
    case 3:
      return 'bg-amber-600/10 border-amber-600/30';
    default:
      return 'bg-card border-border/50';
  }
};

export const Leaderboard = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Card variant="gradient" className="overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Top Performers</CardTitle>
                  <p className="text-sm text-muted-foreground">This month's leaderboard</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-right">Wins</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-2 text-right">Winnings</div>
            </div>

            {/* Entries */}
            <div className="divide-y divide-border/30">
              {mockLeaderboard.map((entry, index) => (
                <motion.div
                  key={entry.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-secondary/30 ${getRankBg(entry.rank)}`}
                >
                  <div className="col-span-1">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="col-span-5">
                    <span className="font-semibold text-foreground">{entry.username}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-foreground">{entry.wins}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <Badge 
                      variant="outline" 
                      className={`${entry.winRate >= 55 ? 'text-primary border-primary/30' : 'text-muted-foreground'}`}
                    >
                      {entry.winRate}%
                    </Badge>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-bold text-gradient-primary">
                      ${entry.winnings.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
