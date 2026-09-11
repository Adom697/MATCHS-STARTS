create or replace function admin_set_plan(target_id uuid, new_plan text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.email() <> 'cedriccassy312@gmail.com' then
    raise exception 'not authorized';
  end if;

  if new_plan not in ('free', 'pro') then
    raise exception 'invalid plan';
  end if;

  update players set plan = new_plan where id = target_id;
end;
$$;

grant execute on function admin_set_plan(uuid, text) to authenticated;
