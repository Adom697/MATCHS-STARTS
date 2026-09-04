create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int check (rating between 1 and 5),
  message text not null,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

drop policy if exists "feedback_insert_own" on feedback;
create policy "feedback_insert_own" on feedback for insert with check (auth.uid() = user_id);

drop policy if exists "feedback_select_own" on feedback;
create policy "feedback_select_own" on feedback for select using (auth.uid() = user_id);
