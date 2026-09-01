alter table players add column if not exists invite_code text unique;

create or replace function set_invite_code()
returns trigger as $$
begin
  if new.invite_code is null then
    new.invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_invite_code on players;
create trigger trg_set_invite_code
before insert on players
for each row execute function set_invite_code();

create or replace function get_player_id_by_invite_code(code text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from players where invite_code = upper(code);
$$;

grant execute on function get_player_id_by_invite_code(text) to authenticated;
