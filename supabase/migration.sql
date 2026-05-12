-- ============================================
-- PadelRush — Full Schema Migration
-- ============================================

-- 0. EXTENSIONS
create extension if not exists "pgcrypto";

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  phone text,
  role text not null default 'player' check (role in ('admin', 'organizer', 'player')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. LEAGUES
create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sport text not null default 'padel' check (sport in ('padel', 'tenis', 'squash', 'otro')),
  gender text not null default 'femenil' check (gender in ('femenil', 'varonil', 'mixto')),
  season text,
  categories text[] default '{}',
  category_formats jsonb default '{}',
  sets_per_match int not null default 2,
  tiebreak_enabled boolean not null default true,
  status text not null default 'proxima' check (status in ('activa', 'finalizada', 'proxima')),
  logo_url text,
  color text default '#c96442',
  organizer_id uuid references public.profiles(id) on delete set null,
  organizer_name text,
  organizer_whatsapp text,
  organizer_instagram text,
  organizer_facebook text,
  organizer_website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leagues enable row level security;

-- 3. PARTICIPANTS
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null check (level in ('3RA', '4TA', '5TA', '6TA')),
  gender text not null default 'femenil' check (gender in ('femenil', 'varonil')),
  photo_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.participants enable row level security;

-- 4. TEAMS (parejas)
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  category text not null,
  team_number int not null,
  player1_id uuid references public.participants(id) on delete set null,
  player2_id uuid references public.participants(id) on delete set null,
  team_name text,
  created_at timestamptz not null default now(),
  unique(league_id, category, team_number)
);
alter table public.teams enable row level security;

-- 5. MATCHES
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  category text not null,
  match_number int,
  round text,
  team1_id uuid references public.teams(id) on delete set null,
  team2_id uuid references public.teams(id) on delete set null,
  team1_number int,
  team2_number int,
  team1_name text,
  team2_name text,
  scheduled_date date,
  scheduled_time text,
  court text,
  location text,
  set1_team1 int,
  set1_team2 int,
  set2_team1 int,
  set2_team2 int,
  set3_team1 int,
  set3_team2 int,
  tiebreak_team1 int,
  tiebreak_team2 int,
  sets_won_team1 int,
  sets_won_team2 int,
  winner_team_number int,
  played_date date,
  notes text,
  status text not null default 'programado' check (status in ('programado', 'jugado', 'cancelado', 'walkover')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.matches enable row level security;

-- 6. PLAYER STATS
create table if not exists public.player_stats (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  league_id uuid not null references public.leagues(id) on delete cascade,
  league_name text,
  category text not null,
  season text,
  partner_name text,
  matches_played int not null default 0,
  matches_won int not null default 0,
  matches_lost int not null default 0,
  sets_won int not null default 0,
  sets_lost int not null default 0,
  games_won int not null default 0,
  games_lost int not null default 0,
  win_percentage numeric(5,2) not null default 0,
  final_ranking int,
  unique(player_name, league_id, category)
);
alter table public.player_stats enable row level security;

-- INDEXES
create index if not exists idx_teams_league on public.teams(league_id);
create index if not exists idx_teams_category on public.teams(category);
create index if not exists idx_matches_league on public.matches(league_id);
create index if not exists idx_matches_category on public.matches(category);
create index if not exists idx_matches_status on public.matches(status);
create index if not exists idx_player_stats_league on public.player_stats(league_id);

-- RLS POLICIES
-- Profiles: owner and admins
create policy "Profiles are public"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Leagues: public read, organizers/admins write
create policy "Leagues are public read"
  on public.leagues for select
  using (true);

create policy "Admins and organizers can insert leagues"
  on public.leagues for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'organizer'))
  );

create policy "Admins and organizers can update leagues"
  on public.leagues for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'organizer'))
  );

create policy "Admins can delete leagues"
  on public.leagues for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Participants: public read, authenticated write
create policy "Participants are public read"
  on public.participants for select
  using (true);

create policy "Authenticated users can insert participants"
  on public.participants for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update participants"
  on public.participants for update
  using (auth.role() = 'authenticated');

-- Teams: public read, authenticated write
create policy "Teams are public read"
  on public.teams for select
  using (true);

create policy "Admins and organizers can manage teams"
  on public.teams for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'organizer'))
  );

create policy "Admins and organizers can update teams"
  on public.teams for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'organizer'))
  );

-- Matches: public read, authenticated write
create policy "Matches are public read"
  on public.matches for select
  using (true);

create policy "Admins and organizers can manage matches"
  on public.matches for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'organizer'))
  );

create policy "Admins and organizers can update matches"
  on public.matches for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'organizer'))
  );

-- Player Stats: public read, triggers/authenticated write
create policy "Player stats are public read"
  on public.player_stats for select
  using (true);

create policy "Admins and organizers can manage stats"
  on public.player_stats for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'organizer'))
  );

create policy "Admins and organizers can update stats"
  on public.player_stats for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'organizer'))
  );
