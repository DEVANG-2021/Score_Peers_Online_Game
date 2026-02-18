-- Create player_props table for managing picks/lines
CREATE TABLE public.player_props (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sport TEXT NOT NULL,
  league TEXT NOT NULL,
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  player_name TEXT NOT NULL,
  player_image TEXT,
  prop_type TEXT NOT NULL, -- e.g., 'rebounds', 'points', 'assists', 'passing_yards', etc.
  line NUMERIC NOT NULL, -- e.g., 10.5 for over/under 10.5 rebounds
  over_odds INTEGER DEFAULT -110,
  under_odds INTEGER DEFAULT -110,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_props ENABLE ROW LEVEL SECURITY;

-- Everyone can view active props
CREATE POLICY "Anyone can view active props"
ON public.player_props
FOR SELECT
USING (is_active = true);

-- Create admin_users table for managing admin access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin list
CREATE POLICY "Admins can view admin list"
ON public.admin_users
FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create full access policy for admins on player_props
CREATE POLICY "Admins can manage all props"
ON public.player_props
FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create trigger for updated_at
CREATE TRIGGER update_player_props_updated_at
BEFORE UPDATE ON public.player_props
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample player props data
INSERT INTO public.player_props (sport, league, game_date, home_team, away_team, player_name, player_image, prop_type, line, over_odds, under_odds) VALUES
-- NBA
('Basketball', 'NBA', now() + interval '1 day', 'Los Angeles Lakers', 'Boston Celtics', 'LeBron James', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/1966.png', 'points', 27.5, -115, -105),
('Basketball', 'NBA', now() + interval '1 day', 'Los Angeles Lakers', 'Boston Celtics', 'LeBron James', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/1966.png', 'rebounds', 8.5, -110, -110),
('Basketball', 'NBA', now() + interval '1 day', 'Los Angeles Lakers', 'Boston Celtics', 'LeBron James', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/1966.png', 'assists', 7.5, -120, +100),
('Basketball', 'NBA', now() + interval '1 day', 'Los Angeles Lakers', 'Boston Celtics', 'Jayson Tatum', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4065648.png', 'points', 28.5, -110, -110),
('Basketball', 'NBA', now() + interval '1 day', 'Los Angeles Lakers', 'Boston Celtics', 'Jayson Tatum', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4065648.png', 'rebounds', 9.5, +105, -125),
('Basketball', 'NBA', now() + interval '2 days', 'Golden State Warriors', 'Denver Nuggets', 'Stephen Curry', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3975.png', 'points', 29.5, -105, -115),
('Basketball', 'NBA', now() + interval '2 days', 'Golden State Warriors', 'Denver Nuggets', 'Stephen Curry', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3975.png', 'threes_made', 5.5, -110, -110),
('Basketball', 'NBA', now() + interval '2 days', 'Golden State Warriors', 'Denver Nuggets', 'Nikola Jokic', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3112335.png', 'points', 26.5, -110, -110),
('Basketball', 'NBA', now() + interval '2 days', 'Golden State Warriors', 'Denver Nuggets', 'Nikola Jokic', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3112335.png', 'rebounds', 12.5, -115, -105),
('Basketball', 'NBA', now() + interval '2 days', 'Golden State Warriors', 'Denver Nuggets', 'Nikola Jokic', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3112335.png', 'assists', 9.5, -110, -110),

-- NFL
('Football', 'NFL', now() + interval '3 days', 'Kansas City Chiefs', 'Buffalo Bills', 'Patrick Mahomes', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3139477.png', 'passing_yards', 285.5, -110, -110),
('Football', 'NFL', now() + interval '3 days', 'Kansas City Chiefs', 'Buffalo Bills', 'Patrick Mahomes', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3139477.png', 'passing_tds', 2.5, +120, -140),
('Football', 'NFL', now() + interval '3 days', 'Kansas City Chiefs', 'Buffalo Bills', 'Josh Allen', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3918298.png', 'passing_yards', 275.5, -115, -105),
('Football', 'NFL', now() + interval '3 days', 'Kansas City Chiefs', 'Buffalo Bills', 'Josh Allen', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3918298.png', 'rushing_yards', 35.5, -110, -110),
('Football', 'NFL', now() + interval '3 days', 'Kansas City Chiefs', 'Buffalo Bills', 'Travis Kelce', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/15847.png', 'receiving_yards', 72.5, -110, -110),
('Football', 'NFL', now() + interval '4 days', 'Dallas Cowboys', 'Philadelphia Eagles', 'Dak Prescott', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/2577417.png', 'passing_yards', 265.5, -110, -110),
('Football', 'NFL', now() + interval '4 days', 'Dallas Cowboys', 'Philadelphia Eagles', 'Jalen Hurts', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4040715.png', 'rushing_yards', 45.5, -105, -115),

-- NHL
('Hockey', 'NHL', now() + interval '1 day', 'Toronto Maple Leafs', 'Montreal Canadiens', 'Auston Matthews', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nhl/players/full/4024123.png', 'shots_on_goal', 4.5, -110, -110),
('Hockey', 'NHL', now() + interval '1 day', 'Toronto Maple Leafs', 'Montreal Canadiens', 'Auston Matthews', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nhl/players/full/4024123.png', 'points', 1.5, +130, -150),
('Hockey', 'NHL', now() + interval '2 days', 'Edmonton Oilers', 'Colorado Avalanche', 'Connor McDavid', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nhl/players/full/3895074.png', 'points', 1.5, -110, -110),
('Hockey', 'NHL', now() + interval '2 days', 'Edmonton Oilers', 'Colorado Avalanche', 'Connor McDavid', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nhl/players/full/3895074.png', 'shots_on_goal', 4.5, -115, -105),
('Hockey', 'NHL', now() + interval '2 days', 'Edmonton Oilers', 'Colorado Avalanche', 'Nathan MacKinnon', 'https://a.espncdn.com/combiner/i?img=/i/headshots/nhl/players/full/3041969.png', 'points', 1.5, +110, -130),

-- MLB
('Baseball', 'MLB', now() + interval '1 day', 'Los Angeles Dodgers', 'San Diego Padres', 'Shohei Ohtani', 'https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/39832.png', 'total_bases', 2.5, -120, +100),
('Baseball', 'MLB', now() + interval '1 day', 'Los Angeles Dodgers', 'San Diego Padres', 'Shohei Ohtani', 'https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/39832.png', 'hits', 1.5, +105, -125),
('Baseball', 'MLB', now() + interval '1 day', 'Los Angeles Dodgers', 'San Diego Padres', 'Mookie Betts', 'https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/33039.png', 'runs', 0.5, -130, +110),
('Baseball', 'MLB', now() + interval '2 days', 'New York Yankees', 'Boston Red Sox', 'Aaron Judge', 'https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/33192.png', 'total_bases', 2.5, -110, -110),
('Baseball', 'MLB', now() + interval '2 days', 'New York Yankees', 'Boston Red Sox', 'Aaron Judge', 'https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/33192.png', 'home_runs', 0.5, +170, -200),

-- UFC
('MMA', 'UFC', now() + interval '5 days', 'UFC 300', 'Main Event', 'Alex Pereira', 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4348855.png', 'significant_strikes', 45.5, -110, -110),
('MMA', 'UFC', now() + interval '5 days', 'UFC 300', 'Main Event', 'Alex Pereira', 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4348855.png', 'takedowns', 0.5, +200, -250),
('MMA', 'UFC', now() + interval '5 days', 'UFC 300', 'Co-Main', 'Islam Makhachev', 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3027961.png', 'takedowns', 3.5, -115, -105),

-- Soccer
('Soccer', 'Premier League', now() + interval '2 days', 'Manchester City', 'Liverpool', 'Erling Haaland', 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/260372.png', 'shots_on_target', 2.5, -110, -110),
('Soccer', 'Premier League', now() + interval '2 days', 'Manchester City', 'Liverpool', 'Erling Haaland', 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/260372.png', 'goals', 0.5, -120, +100),
('Soccer', 'Premier League', now() + interval '2 days', 'Manchester City', 'Liverpool', 'Mohamed Salah', 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/179862.png', 'shots_on_target', 1.5, -105, -115);