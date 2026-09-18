create table if not exists coaches (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists coach_players (
  coach_id uuid not null references coaches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (coach_id, player_id)
);

alter table coaches enable row level security;
alter table coach_players enable row level security;

drop policy if exists "coaches_select_own" on coaches;
create policy "coaches_select_own" on coaches for select using (auth.uid() = id);
drop policy if exists "coaches_insert_own" on coaches;
create policy "coaches_insert_own" on coaches for insert with check (auth.uid() = id);

drop policy if exists "coach_players_all_own" on coach_players;
create policy "coach_players_all_own" on coach_players for all using (auth.uid() = coach_id) with check (auth.uid() = coach_id);

drop policy if exists "players_select_via_coach" on players;
create policy "players_select_via_coach" on players for select using (
  exists (select 1 from coach_players cp where cp.coach_id = auth.uid() and cp.player_id = players.id)
);

drop policy if exists "matches_select_via_coach" on matches;
create policy "matches_select_via_coach" on matches for select using (
  exists (select 1 from coach_players cp where cp.coach_id = auth.uid() and cp.player_id = matches.player_id)
);

drop policy if exists "match_stats_select_via_coach" on match_stats;
create policy "match_stats_select_via_coach" on match_stats for select using (
  exists (
    select 1 from matches m join coach_players cp on cp.player_id = m.player_id
    where m.id = match_stats.match_id and cp.coach_id = auth.uid()
  )
);
