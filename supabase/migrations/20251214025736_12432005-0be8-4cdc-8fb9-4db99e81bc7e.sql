
-- Create enum types for status tracking
CREATE TYPE public.contest_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');
CREATE TYPE public.pick_result AS ENUM ('pending', 'won', 'lost', 'push');
CREATE TYPE public.parlay_status AS ENUM ('pending', 'won', 'lost', 'cancelled');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'entry_fee', 'winnings', 'refund');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');

-- Games/Events table for sports data
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sport TEXT NOT NULL,
  league TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  spread DECIMAL(5,2),
  moneyline_home INTEGER,
  moneyline_away INTEGER,
  total DECIMAL(5,2),
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contests table
CREATE TABLE public.contests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  prize_pool DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_entries INTEGER NOT NULL DEFAULT 100,
  current_entries INTEGER NOT NULL DEFAULT 0,
  min_picks INTEGER NOT NULL DEFAULT 2,
  max_picks INTEGER NOT NULL DEFAULT 10,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status contest_status NOT NULL DEFAULT 'upcoming',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Parlays (contest entries)
CREATE TABLE public.parlays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_odds DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  potential_payout DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status parlay_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

-- Picks within parlays
CREATE TABLE public.picks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parlay_id UUID NOT NULL REFERENCES public.parlays(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  pick_type TEXT NOT NULL,
  selection TEXT NOT NULL,
  odds INTEGER NOT NULL,
  result pick_result NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reference_id UUID,
  description TEXT,
  status transaction_status NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Games policies (public read, admin write)
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);

-- Contests policies
CREATE POLICY "Anyone can view contests" ON public.contests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create contests" ON public.contests FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Contest creators can update their contests" ON public.contests FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Parlays policies
CREATE POLICY "Users can view their own parlays" ON public.parlays FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view parlays in contests they're in" ON public.parlays FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parlays p WHERE p.contest_id = parlays.contest_id AND p.user_id = auth.uid())
);
CREATE POLICY "Users can create their own parlays" ON public.parlays FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pending parlays" ON public.parlays FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending');

-- Picks policies
CREATE POLICY "Users can view picks in their parlays" ON public.picks FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parlays WHERE parlays.id = picks.parlay_id AND parlays.user_id = auth.uid())
);
CREATE POLICY "Users can view picks in contests they're in" ON public.picks FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.parlays p1 
    JOIN public.parlays p2 ON p1.contest_id = p2.contest_id 
    WHERE p2.id = picks.parlay_id AND p1.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create picks in their parlays" ON public.picks FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.parlays WHERE parlays.id = picks.parlay_id AND parlays.user_id = auth.uid() AND parlays.status = 'pending')
);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contests_updated_at BEFORE UPDATE ON public.contests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parlays_updated_at BEFORE UPDATE ON public.parlays FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for contests and parlays
ALTER PUBLICATION supabase_realtime ADD TABLE public.contests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parlays;
