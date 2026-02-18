import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Coins, Banknote, CalendarIcon, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
// Global KPIs

// {
//   title: "Total Challenges",
//   value: "1,284",
//   icon: Trophy
// }];

// SP Cash KPIs
const spCashStats = [{
  title: "SP Cash Challenges Available",
  value: "156",
  icon: Clock
}, {
  title: "SP Cash Challenges Active",
  value: "89",
  icon: CheckCircle
}, {
  title: "SP Cash Challenges Expired",
  value: "412",
  icon: XCircle
}, {
  title: "SP Cash Processing Fees Collected",
  value: "8,450 SP Cash",
  icon: Banknote
}];

// SP Coins KPIs
const spCoinsStats = [{
  title: "SP Coins Challenges Available",
  value: "234",
  icon: Clock
}, {
  title: "SP Coins Challenges Active",
  value: "167",
  icon: CheckCircle
}, {
  title: "SP Coins Challenges Expired",
  value: "226",
  icon: XCircle
}, {
  title: "SP Coins Processing Fees Collected",
  value: "1,250,000 SP Coins",
  icon: Coins
}];
export const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const loadUsersCount = async () => {
      setLoadingUsers(true);
      const count = await fetchUserCount();
      setTotalUsers(count);
      setLoadingUsers(false);
    };

    loadUsersCount();
  }, []);

  const fetchUserCount = async () => {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching user count:", error);
      return 0;
    }

    return count ?? 0;
  };

  // const [date, setDate] = useState<Date>(new Date());

  const globalStats = [
    {
      title: "Total Users",
      value: loadingUsers ? "Loading..." : totalUsers.toLocaleString(),
      icon: Users,
    },
  ];
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to Score Peers Admin</p>
        </div>
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal gap-2", !date && "text-muted-foreground")}>
              <CalendarIcon className="h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar mode="single" selected={date} onSelect={d => d && setDate(d)} initialFocus className="pointer-events-auto" />
          </PopoverContent>
        </Popover> */}
      </div>

      {/* Global Stats */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Global</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {globalStats.map(stat => <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* SP Cash Stats */}
      {/* <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Banknote className="h-5 w-5 text-success" />
          SP Cash
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spCashStats.map(stat => <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-success" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div> */}

      {/* SP Coins Stats */}
      {/* <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Coins className="h-5 w-5 text-warning" />
          SP Coins
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spCoinsStats.map(stat => <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-warning" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div> */}
    </div>;
};