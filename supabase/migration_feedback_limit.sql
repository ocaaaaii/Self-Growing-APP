-- ============================================================
--  意見回饋防灌水
--  全站每分鐘最多 20 筆；同一個登入帳號每小時最多 5 筆。
--  超過時新增會失敗，/api/feedback 會回「太頻繁」的提示。
--
--  在 Supabase SQL Editor 貼上整段執行一次即可。可重複執行。
-- ============================================================

create or replace function public.feedback_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.feedback where created_at > now() - interval '1 minute') >= 20 then
    raise exception 'feedback_rate_limited' using errcode = 'P0001';
  end if;
  if new.user_id is not null and
     (select count(*) from public.feedback
       where user_id = new.user_id and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'feedback_rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists feedback_rate_limit on public.feedback;
create trigger feedback_rate_limit
  before insert on public.feedback
  for each row execute function public.feedback_rate_limit();
