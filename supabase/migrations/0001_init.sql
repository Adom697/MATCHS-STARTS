-- MatchStat — schéma initial (idempotent : peut être relancé sans erreur)
create extension if not exists "pgcrypto";

create table if not exists players (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  birth_date date,
  current_club text,
  jersey_number int,
  strong_foot text check (strong_foot in ('gauche', 'droit', 'ambidextre')),
  position text,
  previous_clubs text[] default '{}',
  achievements text,
  avatar_url text,
  public_slug text unique,
  is_public boolean not null default false,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assistants (
  id uuid primary key references auth.users(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  match_date date not null,
  opponent text not null,
  competition text,
  home_away text check (home_away in ('domicile', 'exterieur')),
  team_score int,
  opponent_score int,
  status text not null default 'a_venir' check (status in ('a_venir', 'en_direct', 'termine')),
  minutes_played int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists matches_player_id_idx on matches(player_id);

create table if not exists match_stats (
  match_id uuid primary key references matches(id) on delete cascade,
  touches int not null default 0,
  passes_reussies int not null default 0,
  passes_ratees int not null default 0,
  dribbles_reussis int not null default 0,
  dribbles_rates int not null default 0,
  tirs_cadres int not null default 0,
  tirs_non_cadres int not null default 0,
  buts int not null default 0,
  passes_decisives int not null default 0,
  ballons_perdus int not null default 0,
  ballons_recuperes int not null default 0,
  fautes_commises int not null default 0,
  fautes_subies int not null default 0,
  cartons_jaunes int not null default 0,
  cartons_rouges int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  event_type text not null,
  minute int,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists match_events_match_id_idx on match_events(match_id);

alter table players enable row level security;
alter table assistants enable row level security;
alter table matches enable row level security;
alter table match_stats enable row level security;
alter table match_events enable row level security;

drop policy if exists "players_select_own" on players;
drop policy if exists "players_update_own" on players;
drop policy if exists "players_insert_own" on players;
drop policy if exists "players_select_public" on players;
drop policy if exists "players_select_via_assistant" on players;
drop policy if exists "assistants_select_own_or_linked_player" on assistants;
drop policy if exists "matches_all_owner" on matches;
drop policy if exists "matches_select_public" on matches;
drop policy if exists "match_stats_all_owner" on match_stats;
drop policy if exists "match_stats_select_public" on match_stats;
drop policy if exists "match_events_all_owner" on match_events;

create policy "players_select_own" on players for select using (auth.uid() = id);
create policy "players_update_own" on players for update using (auth.uid() = id);
create policy "players_insert_own" on players for insert with check (auth.uid() = id);
create policy "players_select_public" on players for select using (is_public = true);
create policy "players_select_via_assistant" on players for select using (
  exists (select 1 from assistants a where a.id = auth.uid() and a.player_id = players.id)
);

create policy "assistants_select_own_or_linked_player" on assistants for select using (
  auth.uid() = id or auth.uid() = player_id
);

create policy "matches_all_owner" on matches for all using (
  auth.uid() = player_id
  or exists (select 1 from assistants a where a.id = auth.uid() and a.player_id = matches.player_id)
) with check (
  auth.uid() = player_id
  or exists (select 1 from assistants a where a.id = auth.uid() and a.player_id = matches.player_id)
);
create policy "matches_select_public" on matches for select using (
  exists (select 1 from players p where p.id = matches.player_id and p.is_public = true)
);

create policy "match_stats_all_owner" on match_stats for all using (
  exists (select 1 from matches m where m.id = match_stats.match_id and (
    auth.uid() = m.player_id
    or exists (select 1 from assistants a where a.id = auth.uid() and a.player_id = m.player_id)
  ))
) with check (
  exists (select 1 from matches m where m.id = match_stats.match_id and (
    auth.uid() = m.player_id
    or exists (select 1 from assistants a where a.id = auth.uid() and a.player_id = m.player_id)
  ))
);
create policy "match_stats_select_public" on match_stats for select using (
  exists (select 1 from matches m join players p on p.id = m.player_id
    where m.id = match_stats.match_id and p.is_public = true)
);

create policy "match_events_all_owner" on match_events for all using (
  exists (select 1 from matches m where m.id = match_events.match_id and (
    auth.uid() = m.player_id
    or exists (select 1 from assistants a where a.id = auth.uid() and a.player_id = m.player_id)
  ))
) with check (
  exists (select 1 from matches m where m.id = match_events.match_id and (
    auth.uid() = m.player_id
    or exists (select 1 from assistants a where a.id = auth.uid() and a.player_id = m.player_id)
  ))
);
