-- Fix #1: Games table - Deny all write access (games should only be managed by admin/external system)
-- Create restrictive policies that deny INSERT, UPDATE, DELETE for all users
CREATE POLICY "Deny game inserts" ON public.games
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Deny game updates" ON public.games
  FOR UPDATE USING (false);

CREATE POLICY "Deny game deletes" ON public.games
  FOR DELETE USING (false);

-- Fix #2: Add validation constraints to contests table
ALTER TABLE public.contests
  ADD CONSTRAINT entry_fee_non_negative CHECK (entry_fee >= 0),
  ADD CONSTRAINT prize_pool_non_negative CHECK (prize_pool >= 0),
  ADD CONSTRAINT max_entries_positive CHECK (max_entries > 0),
  ADD CONSTRAINT current_entries_non_negative CHECK (current_entries >= 0),
  ADD CONSTRAINT picks_range_valid CHECK (min_picks > 0 AND max_picks >= min_picks AND max_picks <= 20);

-- Add validation constraints to parlays table
ALTER TABLE public.parlays
  ADD CONSTRAINT total_odds_positive CHECK (total_odds > 0),
  ADD CONSTRAINT potential_payout_non_negative CHECK (potential_payout >= 0);

-- Add validation constraints to picks table (odds can be negative for favorites in American odds format)
ALTER TABLE public.picks
  ADD CONSTRAINT odds_range_valid CHECK (odds BETWEEN -100000 AND 100000 AND odds != 0);

-- Create validation trigger for time range (using trigger instead of CHECK for mutable comparison)
CREATE OR REPLACE FUNCTION public.validate_contest_times()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'Contest end_time must be after start_time';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_contest_times_trigger
  BEFORE INSERT OR UPDATE ON public.contests
  FOR EACH ROW EXECUTE FUNCTION public.validate_contest_times();

-- Create validation trigger for parlay pick count on status change
CREATE OR REPLACE FUNCTION public.validate_parlay_picks()
RETURNS TRIGGER AS $$
DECLARE
  v_pick_count INTEGER;
  v_min_picks INTEGER;
  v_max_picks INTEGER;
BEGIN
  -- Only validate when status changes from pending to something else
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    -- Get contest requirements
    SELECT min_picks, max_picks INTO v_min_picks, v_max_picks
    FROM public.contests WHERE id = NEW.contest_id;
    
    -- Count picks for this parlay
    SELECT COUNT(*) INTO v_pick_count
    FROM public.picks WHERE parlay_id = NEW.id;
    
    -- Validate pick count
    IF v_pick_count < v_min_picks OR v_pick_count > v_max_picks THEN
      RAISE EXCEPTION 'Parlay must have between % and % picks, but has %', v_min_picks, v_max_picks, v_pick_count;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_parlay_before_status_change
  BEFORE UPDATE ON public.parlays
  FOR EACH ROW EXECUTE FUNCTION public.validate_parlay_picks();