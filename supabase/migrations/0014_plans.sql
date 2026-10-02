create table if not exists plans (
  code text primary key,
  name text not null,
  price_fcfa int not null default 0,
  sort_order int not null default 0,
  features jsonb not null default '[]'::jsonb
);

insert into plans (code, name, price_fcfa, sort_order, features) values
  ('free', 'Free', 0, 1, '["Saisie live illimitée","Bilan de saison","Historique des matchs","Parcours & clubs"]'),
  ('pro', 'Pro', 5000, 2, '["Tout Free","MatchStat filme ton match","Analyse humaine du match complet","Statistiques validées par l''équipe"]'),
  ('pro_max', 'Pro Max', 10000, 3, '["Tout Pro","Vidéo de performance condensée","Timeline horodatée de tes actions"]'),
  ('elite', 'Élite', 20000, 4, '["Tout Pro Max","Montage highlights professionnel","Rapport de progression détaillé","Exercices personnalisés"]'),
  ('carriere', 'Carrière', 3000, 5, '["Vitrine publique","CV PDF","QR code partageable","Historique cumulé multi-saisons"]')
on conflict (code) do update set
  name = excluded.name,
  price_fcfa = excluded.price_fcfa,
  sort_order = excluded.sort_order,
  features = excluded.features;

alter table plans enable row level security;
drop policy if exists "plans_select_all" on plans;
create policy "plans_select_all" on plans for select using (true);

alter table players add column if not exists plan_code text references plans(code) default 'free';
alter table players add column if not exists plan_expires_at timestamptz;

update players set plan_code = case when plan = 'pro' then 'carriere' else 'free' end where plan_code is null;
