alter table match_stats add column if not exists tacles_reussis int not null default 0;
alter table match_stats add column if not exists tacles_rates int not null default 0;
alter table match_stats add column if not exists interceptions int not null default 0;
alter table match_stats add column if not exists duels_aeriens_gagnes int not null default 0;
alter table match_stats add column if not exists duels_aeriens_perdus int not null default 0;

alter table matches add column if not exists player_rating numeric(3,1);
alter table matches add column if not exists coach_rating numeric(3,1);
