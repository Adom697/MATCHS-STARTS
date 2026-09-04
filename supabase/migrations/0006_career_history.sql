create table if not exists career_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  club text not null,
  category text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists career_history_player_id_idx on career_history(player_id);

alter table career_history enable row level security;

drop policy if exists "career_all_owner" on career_history;
create policy "career_all_owner" on career_history for all using (
  auth.uid() = player_id
  or exists (select 1 from assistants a where a.id = auth.uid() and a.player_id = career_history.player_id)
) with check (
  auth.uid() = player_id
  or exists (select 1 from assistants a where a.id = auth.uid() and a.player_id = career_history.player_id)
);

drop policy if exists "career_select_public" on career_history;
create policy "career_select_public" on career_history for select using (
  exists (select 1 from players p where p.id = career_history.player_id and p.is_public = true)
);
