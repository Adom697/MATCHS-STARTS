alter table match_stats add column if not exists arrets int not null default 0;
alter table match_stats add column if not exists buts_encaisses int not null default 0;
alter table match_stats add column if not exists degagements_reussis int not null default 0;
alter table match_stats add column if not exists degagements_rates int not null default 0;
alter table match_stats add column if not exists sorties_aeriennes_reussies int not null default 0;
alter table match_stats add column if not exists penalties_arretes int not null default 0;
