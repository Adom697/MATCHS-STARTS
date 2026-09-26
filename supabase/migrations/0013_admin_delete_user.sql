create or replace function admin_delete_user(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.email() <> 'cedriccassy312@gmail.com' then
    raise exception 'not authorized';
  end if;

  delete from auth.users where id = target_id;
end;
$$;

grant execute on function admin_delete_user(uuid) to authenticated;
