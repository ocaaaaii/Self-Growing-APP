-- ============================================================
--  用戶變多時的兩個保護
--  1. growth_stats()：成長頁的天數統計改在資料庫算。
--     原本把一個人所有打卡紀錄抓回來算，但 API 一次最多回 1000 筆，
--     紀錄一多「成長天數／連續天數／徽章」就會悄悄算錯。
--  2. ai_daily_usage + use_ai_quota()：每人每天呼叫 AI 的次數上限，
--     避免 Anthropic 費用跟著開 App 次數無限增加。
--
--  在 Supabase SQL Editor 貼上整段執行一次即可。可重複執行。
-- ============================================================

-- ---------- 1. growth_stats ----------
-- 只算呼叫者自己的資料（auth.uid()），RLS 照常生效。
create or replace function public.growth_stats(p_today date)
returns table (growth_days int, current_streak int, best_streak int)
language sql
stable
security invoker
set search_path = public
as $$
  with days as (
    select distinct completed_on as d
    from public.habit_logs
    where user_id = auth.uid() and completed_on <= p_today
  ),
  grouped as (
    select d, d - (row_number() over (order by d))::int as grp from days
  ),
  runs as (
    select max(d) as last_day, count(*)::int as len from grouped group by grp
  )
  select
    (select count(*)::int from days),
    -- 目前連續：最後一段連續要到今天或昨天才算數
    coalesce((select len from runs where last_day >= p_today - 1 order by last_day desc limit 1), 0),
    coalesce((select max(len) from runs), 0);
$$;

grant execute on function public.growth_stats(date) to authenticated;

-- ---------- 2. AI 每日次數 ----------
create table if not exists public.ai_daily_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  kind    text not null check (kind in ('encourage', 'reward_comment')),
  count   int  not null default 0,
  primary key (user_id, day, kind)
);

alter table public.ai_daily_usage enable row level security;
-- 不開放任何直接讀寫政策；只能透過下面的函式加一。

-- 回傳 true 表示這次可以呼叫 AI（並且已經記上一次）；超過上限回傳 false。
create or replace function public.use_ai_quota(p_kind text, p_day date, p_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if auth.uid() is null then
    return false;
  end if;
  if p_kind not in ('encourage', 'reward_comment') or p_limit < 1 or p_limit > 100 then
    return false;
  end if;
  -- p_day is the user's local date; it can only be a day either side of UTC today
  if p_day not between current_date - 1 and current_date + 1 then
    return false;
  end if;

  insert into public.ai_daily_usage (user_id, day, kind, count)
  values (auth.uid(), p_day, p_kind, 1)
  on conflict (user_id, day, kind)
  do update set count = public.ai_daily_usage.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.use_ai_quota(text, date, int) from public, anon;
grant execute on function public.use_ai_quota(text, date, int) to authenticated;
