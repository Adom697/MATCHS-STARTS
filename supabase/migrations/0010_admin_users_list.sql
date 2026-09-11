create or replace function get_admin_users()
returns table(
  id uuid,
  first_name text,
  last_name text,
  email text,
  current_club text,
  "position" text,
  player_category text,
  plan text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.email() <> 'cedriccassy312@gmail.com' then
    raise exception 'not authorized';
  end if;

  return query
    select p.id, p.first_name, p.last_name, u.email, p.current_club, p."position",
           p.player_category, p.plan, p.created_at
    from players p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

grant execute on function get_admin_users() to authenticated;
