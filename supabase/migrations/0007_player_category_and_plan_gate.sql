alter table players add column if not exists player_category text
  check (player_category in ('Plaisir', 'Amateur', 'Académicien', 'Pro'))
  default 'Amateur';
