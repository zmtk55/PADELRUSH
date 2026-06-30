-- supabase/migrations/20260630_create_team_stats.sql

CREATE TABLE team_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  matches_played INT DEFAULT 0,
  matches_won INT DEFAULT 0,
  matches_lost INT DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  current_streak INT DEFAULT 0,
  streak_type TEXT CHECK (streak_type IN ('W', 'L')),
  avg_score DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, league_id)
);

CREATE INDEX idx_team_stats_league ON team_stats(league_id);

-- Function to update team stats after match result
CREATE OR REPLACE FUNCTION update_team_stats_on_match()
RETURNS TRIGGER AS $$
DECLARE
  team1_stats RECORD;
  team2_stats RECORD;
  r_team1_id UUID;
  r_team2_id UUID;
  r_league_id UUID;
BEGIN
  -- Guard: skip recalculation if only non-score fields changed on UPDATE
  IF (TG_OP = 'UPDATE' 
      AND NEW.status = OLD.status 
      AND NEW.team1_score = OLD.team1_score 
      AND NEW.team2_score = OLD.team2_score 
      AND NEW.winner_team_id = OLD.winner_team_id) THEN
    RETURN NEW;
  END IF;

  -- Resolve row data for INSERT/UPDATE (NEW) or DELETE (OLD)
  IF TG_OP = 'DELETE' THEN
    r_team1_id := OLD.team1_id;
    r_team2_id := OLD.team2_id;
    r_league_id := OLD.league_id;
  ELSE
    r_team1_id := NEW.team1_id;
    r_team2_id := NEW.team2_id;
    r_league_id := NEW.league_id;
  END IF;

  -- Get or create stats for team1
  INSERT INTO team_stats (team_id, league_id) VALUES (r_team1_id, r_league_id)
  ON CONFLICT (team_id, league_id) DO NOTHING;
  
  -- Get or create stats for team2
  INSERT INTO team_stats (team_id, league_id) VALUES (r_team2_id, r_league_id)
  ON CONFLICT (team_id, league_id) DO NOTHING;

  -- Recalculate stats for team1
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE winner_team_id = r_team1_id) as won,
    COUNT(*) FILTER (WHERE winner_team_id = r_team2_id) as lost,
    AVG(CASE WHEN team1_id = r_team1_id THEN team1_score ELSE team2_score END) as avg
  INTO team1_stats
  FROM matches 
  WHERE league_id = r_league_id 
    AND (team1_id = r_team1_id OR team2_id = r_team1_id)
    AND status = 'completed';

  UPDATE team_stats SET
    matches_played = team1_stats.total,
    matches_won = team1_stats.won,
    matches_lost = team1_stats.lost,
    win_rate = CASE WHEN team1_stats.total > 0 
      THEN ROUND((team1_stats.won::DECIMAL / team1_stats.total) * 100, 2) 
      ELSE 0 END,
    avg_score = ROUND(COALESCE(team1_stats.avg, 0), 2),
    updated_at = NOW()
  WHERE team_id = r_team1_id AND league_id = r_league_id;

  -- Recalculate stats for team2
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE winner_team_id = r_team2_id) as won,
    COUNT(*) FILTER (WHERE winner_team_id = r_team1_id) as lost,
    AVG(CASE WHEN team1_id = r_team2_id THEN team1_score ELSE team2_score END) as avg
  INTO team2_stats
  FROM matches 
  WHERE league_id = r_league_id 
    AND (team1_id = r_team2_id OR team2_id = r_team2_id)
    AND status = 'completed';

  UPDATE team_stats SET
    matches_played = team2_stats.total,
    matches_won = team2_stats.won,
    matches_lost = team2_stats.lost,
    win_rate = CASE WHEN team2_stats.total > 0 
      THEN ROUND((team2_stats.won::DECIMAL / team2_stats.total) * 100, 2) 
      ELSE 0 END,
    avg_score = ROUND(COALESCE(team2_stats.avg, 0), 2),
    updated_at = NOW()
  WHERE team_id = r_team2_id AND league_id = r_league_id;

  -- Calculate current streaks for both teams
  PERFORM calculate_streak(r_team1_id, r_league_id);
  PERFORM calculate_streak(r_team2_id, r_league_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate current streak
CREATE OR REPLACE FUNCTION calculate_streak(p_team_id UUID, p_league_id UUID)
RETURNS VOID AS $$
DECLARE
  streak_count INT := 0;
  streak_char TEXT := 'W';
  match_rec RECORD;
BEGIN
  -- Get most recent completed matches for this team
  FOR match_rec IN 
    SELECT winner_team_id, match_date
    FROM matches 
    WHERE league_id = p_league_id 
      AND (team1_id = p_team_id OR team2_id = p_team_id)
      AND status = 'completed'
    ORDER BY match_date DESC
    LIMIT 50
  LOOP
    IF streak_count = 0 THEN
      -- First match determines streak type
      IF match_rec.winner_team_id = p_team_id THEN
        streak_count := 1;
        streak_char := 'W';
      ELSE
        streak_count := -1;
        streak_char := 'L';
      END IF;
    ELSIF (streak_char = 'W' AND match_rec.winner_team_id = p_team_id) THEN
      streak_count := streak_count + 1;
    ELSIF (streak_char = 'L' AND match_rec.winner_team_id != p_team_id) THEN
      streak_count := streak_count - 1;
    ELSE
      -- Streak broken
      EXIT;
    END IF;
  END LOOP;

  UPDATE team_stats SET
    current_streak = streak_count,
    streak_type = streak_char
  WHERE team_id = p_team_id AND league_id = p_league_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger on matches table
CREATE TRIGGER trigger_update_team_stats
  AFTER INSERT OR UPDATE OR DELETE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_team_stats_on_match();