-- ============================================
-- PadelRush — Player Stats Computation
-- Trigger: auto-computes player_stats when
-- a match status changes to 'jugado'
-- ============================================

-- Helper: compute stats for a single player in a league+category
create or replace function public.compute_player_stats(
  p_player_name text,
  p_league_id uuid,
  p_category text
)
returns void as $$
declare
  v_matches_played int;
  v_matches_won int;
  v_matches_lost int;
  v_sets_won int;
  v_sets_lost int;
  v_games_won int;
  v_games_lost int;
  v_win_pct numeric(5,2);
  v_league_name text;
  v_season text;
  v_partner_name text;
  v_teams record;
begin
  select name, season into v_league_name, v_season
  from public.leagues where id = p_league_id;

  with player_matches as (
    select
      m.*,
      t1.team_number as t1n, t2.team_number as t2n,
      p1.name as t1p1, p2.name as t1p2,
      p3.name as t2p1, p4.name as t2p2
    from public.matches m
    left join public.teams t1 on t1.id = m.team1_id
    left join public.teams t2 on t2.id = m.team2_id
    left join public.participants p1 on p1.id = t1.player1_id
    left join public.participants p2 on p2.id = t1.player2_id
    left join public.participants p3 on p3.id = t2.player1_id
    left join public.participants p4 on p4.id = t2.player2_id
    where m.league_id = p_league_id
      and m.category = p_category
      and m.status = 'jugado'
      and (
        p1.name = p_player_name or p2.name = p_player_name or
        p3.name = p_player_name or p4.name = p_player_name
      )
  )
  select
    count(*)::int,
    coalesce(sum(case when (
      (t1n = m.winner_team_number and (t1p1 = p_player_name or t1p2 = p_player_name)) or
      (t2n = m.winner_team_number and (t2p1 = p_player_name or t2p2 = p_player_name))
    ) then 1 else 0 end), 0)::int,
    coalesce(sum(case when (
      (t1n != m.winner_team_number and (t1p1 = p_player_name or t1p2 = p_player_name)) or
      (t2n != m.winner_team_number and (t2p1 = p_player_name or t2p2 = p_player_name))
    ) then 1 else 0 end), 0)::int,
    coalesce(sum(
      case when t1p1 = p_player_name or t1p2 = p_player_name then coalesce(m.sets_won_team1, 0)
           else coalesce(m.sets_won_team2, 0) end
    ), 0)::int,
    coalesce(sum(
      case when t1p1 = p_player_name or t1p2 = p_player_name then coalesce(m.sets_won_team2, 0)
           else coalesce(m.sets_won_team1, 0) end
    ), 0)::int,
    coalesce(sum(
      case when t1p1 = p_player_name or t1p2 = p_player_name then
        coalesce(m.set1_team1, 0) + coalesce(m.set2_team1, 0) + coalesce(m.tiebreak_team1, 0)
      else
        coalesce(m.set1_team2, 0) + coalesce(m.set2_team2, 0) + coalesce(m.tiebreak_team2, 0)
      end
    ), 0)::int,
    coalesce(sum(
      case when t1p1 = p_player_name or t1p2 = p_player_name then
        coalesce(m.set1_team2, 0) + coalesce(m.set2_team2, 0) + coalesce(m.tiebreak_team2, 0)
      else
        coalesce(m.set1_team1, 0) + coalesce(m.set2_team1, 0) + coalesce(m.tiebreak_team1, 0)
      end
    ), 0)::int
  into v_matches_played, v_matches_won, v_matches_lost,
       v_sets_won, v_sets_lost, v_games_won, v_games_lost
  from player_matches m;

  if v_matches_played = 0 then
    v_win_pct := 0;
  else
    v_win_pct := round((v_matches_won::numeric / v_matches_played) * 100, 2);
  end if;

  -- Get partner name from most recent match
  select
    case
      when t1p1 = p_player_name then t1p2
      when t1p2 = p_player_name then t1p1
      when t2p1 = p_player_name then t2p2
      when t2p2 = p_player_name then t2p1
    end into v_partner_name
  from (
    select
      p1.name as t1p1, p2.name as t1p2,
      p3.name as t2p1, p4.name as t2p2
    from public.matches m
    left join public.teams t1 on t1.id = m.team1_id
    left join public.teams t2 on t2.id = m.team2_id
    left join public.participants p1 on p1.id = t1.player1_id
    left join public.participants p2 on p2.id = t1.player2_id
    left join public.participants p3 on p3.id = t2.player1_id
    left join public.participants p4 on p4.id = t2.player2_id
    where m.league_id = p_league_id
      and m.category = p_category
      and m.status = 'jugado'
      and (
        p1.name = p_player_name or p2.name = p_player_name or
        p3.name = p_player_name or p4.name = p_player_name
      )
    order by m.played_date desc nulls last, m.updated_at desc
    limit 1
  ) sub;

  insert into public.player_stats
    (player_name, league_id, league_name, category, season, partner_name,
     matches_played, matches_won, matches_lost, sets_won, sets_lost,
     games_won, games_lost, win_percentage)
  values
    (p_player_name, p_league_id, v_league_name, p_category, v_season, v_partner_name,
     v_matches_played, v_matches_won, v_matches_lost, v_sets_won, v_sets_lost,
     v_games_won, v_games_lost, v_win_pct)
  on conflict (player_name, league_id, category)
  do update set
    league_name = excluded.league_name,
    season = excluded.season,
    partner_name = excluded.partner_name,
    matches_played = excluded.matches_played,
    matches_won = excluded.matches_won,
    matches_lost = excluded.matches_lost,
    sets_won = excluded.sets_won,
    sets_lost = excluded.sets_lost,
    games_won = excluded.games_won,
    games_lost = excluded.games_lost,
    win_percentage = excluded.win_percentage;
end;
$$ language plpgsql security definer;

-- Trigger function
create or replace function public.handle_match_result()
returns trigger as $$
declare
  v_p1 text; v_p2 text; v_p3 text; v_p4 text;
begin
  if new.status = 'jugado' or old.status = 'jugado' then
    select p1.name, p2.name, p3.name, p4.name
    into v_p1, v_p2, v_p3, v_p4
    from public.teams t1
    left join public.teams t2 on t2.id = new.team2_id
    left join public.participants p1 on p1.id = t1.player1_id
    left join public.participants p2 on p2.id = t1.player2_id
    left join public.participants p3 on p3.id = t2.player1_id
    left join public.participants p4 on p4.id = t2.player2_id
    where t1.id = new.team1_id;

    if v_p1 is not null then perform public.compute_player_stats(v_p1, new.league_id, new.category); end if;
    if v_p2 is not null then perform public.compute_player_stats(v_p2, new.league_id, new.category); end if;
    if v_p3 is not null then perform public.compute_player_stats(v_p3, new.league_id, new.category); end if;
    if v_p4 is not null then perform public.compute_player_stats(v_p4, new.league_id, new.category); end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_match_result on public.matches;
create trigger on_match_result
  after update of status on public.matches
  for each row
  when (new.status = 'jugado' or old.status = 'jugado')
  execute function public.handle_match_result();
