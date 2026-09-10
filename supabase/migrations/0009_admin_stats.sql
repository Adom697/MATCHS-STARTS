create or replace function get_admin_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if auth.email() <> 'cedriccassy312@gmail.com' then
    raise exception 'not authorized';
  end if;

  select json_build_object(
    'total_players', (select count(*) from players),
    'pro_players', (select count(*) from players where plan = 'pro'),
    'free_players', (select count(*) from players where plan = 'free'),
    'total_assistants', (select count(*) from assistants),
    'by_category', (
      select coalesce(json_object_agg(coalesce(player_category, 'Non renseigné'), cnt), '{}'::json)
      from (select player_category, count(*) cnt from players group by player_category) t
    ),
    'by_position', (
      select coalesce(json_object_agg(coalesce(position, 'Non renseigné'), cnt), '{}'::json)
      from (select position, count(*) cnt from players group by position) t
    ),
    'total_matches', (select count(*) from matches),
    'matches_completed', (select count(*) from matches where status = 'termine'),
    'matches_live', (select count(*) from matches where status = 'en_direct'),
    'matches_upcoming', (select count(*) from matches where status = 'a_venir'),
    'avg_feedback_rating', (select round(avg(rating)::numeric, 1) from feedback where rating is not null),
    'feedback_count', (select count(*) from feedback where message not like '[Système]%'),
    'pro_conversions', (select count(*) from feedback where message like '[Système] Passage en Pro%'),
    'signups_last_7_days', (
      select coalesce(json_agg(json_build_object('date', to_char(d, 'DD/MM'), 'count', coalesce(c.cnt, 0)) order by d), '[]'::json)
      from generate_series(current_date - interval '6 days', current_date, interval '1 day') d
      left join (
        select date_trunc('day', created_at)::date dt, count(*) cnt from players group by dt
      ) c on c.dt = d::date
    )
  ) into result;

  return result;
end;
$$;

grant execute on function get_admin_stats() to authenticated;

create or replace function get_admin_feedback()
returns table(message text, rating int, created_at timestamptz, email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.email() <> 'cedriccassy312@gmail.com' then
    raise exception 'not authorized';
  end if;

  return query
    select f.message, f.rating, f.created_at, u.email
    from feedback f
    join auth.users u on u.id = f.user_id
    where f.message not like '[Système]%'
    order by f.created_at desc
    limit 20;
end;
$$;

grant execute on function get_admin_feedback() to authenticated;
